"""
Transcript Sentiment Aggregator
Aggregates transcript-level sentiment scores into client-level summaries,
applies weighted scoring (negative ×2.5, neutral ×0.5, positive ×1.0) plus recency boost,
and persists results into `client_sentiment_summary`.

Usage:
    python transcript_sentiment_aggregator.py                     # Process all clients
    python transcript_sentiment_aggregator.py --client CL005639  # Process a specific client
    python transcript_sentiment_aggregator.py --recalculate      # Force recalculation
"""

import os
import sys
import json
import argparse
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from pathlib import Path

from dotenv import load_dotenv

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("⚠️  supabase not installed. Install with: pip install supabase")

load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")
TARGET_ACCOUNTS_FILE = "target_accounts.json"

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

supabase: Optional[Client] = None

def initialize_supabase():
    """Initialize Supabase client."""
    global supabase

    if not SUPABASE_AVAILABLE:
        raise ImportError("supabase library is required")

    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in the .env file")

    if supabase is None:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("✅ Supabase client initialized")

    return supabase

def load_client_list(file_path: str = TARGET_ACCOUNTS_FILE) -> List[str]:
    """Load target client IDs for filtering (optional)."""
    try:
        path = Path(file_path)
        if not path.exists():
            logger.warning(f"⚠️  Client list file not found: {file_path}")
            return []

        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        client_ids = [str(cid).strip() for cid in data.get('accounts', []) if cid]

        logger.info(f"✅ Loaded {len(client_ids)} target clients from {file_path}")
        return client_ids
    except Exception as exc:
        logger.error(f"Failed to load client list: {exc}")
        return []

def get_all_clients_with_transcripts(filter_by_target: bool = False) -> List[str]:
    """Return client_platform_id values that have transcript analysis."""
    query = supabase.table('diio_transcripts') \
        .select('client_platform_id') \
        .not_.is_('client_platform_id', 'null') \
        .not_.is_('ai_analysis', 'null')

    result = query.execute()
    all_clients = list({record['client_platform_id'] for record in (result.data or []) if record.get('client_platform_id')})

    if filter_by_target:
        target_clients = load_client_list()
        if target_clients:
            filtered = [client for client in all_clients if client in target_clients]
            logger.info(f"📋 Filtered to {len(filtered)} target clients (out of {len(all_clients)})")
            return sorted(filtered)
        logger.warning("⚠️  Target client file empty, processing all clients")

    logger.info(f"📋 Found {len(all_clients)} clients with analyzed transcripts")
    return sorted(all_clients)

def get_client_transcripts(
    client_id: str,
    period_start: Optional[datetime] = None,
    period_end: Optional[datetime] = None
) -> List[Dict]:
    """Fetch all transcripts for a client within a period (if provided)."""
    query = supabase.table('diio_transcripts') \
        .select('id, client_platform_id, occurred_at, ai_analysis') \
        .eq('client_platform_id', client_id) \
        .not_.is_('ai_analysis', 'null')

    if period_start:
        query = query.gte('occurred_at', period_start.isoformat())
    if period_end:
        query = query.lte('occurred_at', period_end.isoformat())

    result = query.order('occurred_at', desc=False).execute()
    return result.data or []

def calculate_recency_weight(created_at: Optional[str], reference: Optional[datetime] = None) -> float:
    """Boost recent transcripts using the same tiered weights as tickets."""
    if not created_at:
        return 1.0

    if reference is None:
        reference = datetime.utcnow()

    try:
        ticket_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        # Strip any timezone info so we are always comparing naive datetimes
        ticket_date_naive = ticket_date.replace(tzinfo=None)
        reference_naive = reference.replace(tzinfo=None)
        days_ago = (reference_naive - ticket_date_naive).days
    except (ValueError, AttributeError):
        return 1.0

    if days_ago <= 7:
        return 2.0
    if days_ago <= 30:
        return 1.5
    if days_ago <= 90:
        return 1.0
    return 0.5

def calculate_sentiment_weight(sentiment_score: float, overall_sentiment: str) -> float:
    """Apply transcript-specific sentiment multipliers."""
    label_lower = overall_sentiment.lower()
    if label_lower == 'negative' or sentiment_score < -0.2:
        return 2.5
    if label_lower in ('neutral', 'mixed') or -0.2 <= sentiment_score <= 0.2:
        return 0.5
    return 1.0

def calculate_weighted_client_score(transcripts: List[Dict]) -> Tuple[float, Dict]:
    """Weighted average using sentiment and recency multipliers."""
    if not transcripts:
        return 0.0, {}

    total_weighted = 0.0
    total_weight = 0.0
    sentiment_counts = {'positive': 0, 'neutral': 0, 'negative': 0, 'mixed': 0}

    reference = datetime.utcnow()

    for transcript in transcripts:
        analysis_raw = transcript.get('ai_analysis') or {}
        # Parse JSON string if needed
        if isinstance(analysis_raw, str):
            try:
                analysis = json.loads(analysis_raw)
            except json.JSONDecodeError:
                analysis = {}
        else:
            analysis = analysis_raw

        score = float(analysis.get('sentimentScore', 0.0)) if analysis.get('sentimentScore') is not None else 0.0
        label = analysis.get('overallSentiment', 'neutral') or 'neutral'

        recency_w = calculate_recency_weight(transcript.get('occurred_at'), reference)
        sentiment_w = calculate_sentiment_weight(score, label)
        weight = recency_w * sentiment_w

        total_weighted += score * weight
        total_weight += weight

        sentiment_key = label.lower()
        if sentiment_key in sentiment_counts:
            sentiment_counts[sentiment_key] += 1

    weighted_score = total_weighted / total_weight if total_weight else 0.0
    stats = {
        'total_transcripts': len(transcripts),
        'positive_count': sentiment_counts['positive'],
        'neutral_count': sentiment_counts['neutral'],
        'negative_count': sentiment_counts['negative'],
        'mixed_count': sentiment_counts['mixed']
    }

    return round(weighted_score, 4), stats

def classify_client_sentiment(weighted_score: float) -> str:
    """Categorize client sentiment based on the scoring thresholds."""
    if weighted_score > 0.2:
        return 'Positive'
    if weighted_score >= -0.2:
        return 'Neutral'
    return 'Negative'

def calculate_aspect_sentiment_summary(transcripts: List[Dict]) -> Dict[str, float]:
    """Average aspect sentiment across transcripts."""
    scores: Dict[str, float] = {}
    counts: Dict[str, int] = {}

    for transcript in transcripts:
        analysis_raw = transcript.get('ai_analysis', {})
        # Parse JSON string if needed
        if isinstance(analysis_raw, str):
            try:
                analysis = json.loads(analysis_raw)
            except json.JSONDecodeError:
                analysis = {}
        else:
            analysis = analysis_raw

        aspects = analysis.get('aspectSentiment', {}) or {}
        if isinstance(aspects, dict):
            for aspect, value in aspects.items():
                scores[aspect] = scores.get(aspect, 0.0) + float(value)
                counts[aspect] = counts.get(aspect, 0) + 1

    return {aspect: round(scores[aspect] / counts[aspect], 4) for aspect in scores if counts[aspect] > 0}

def generate_negative_aspects_summary(transcripts: List[Dict]) -> Optional[str]:
    """Collect aspect names that consistently show negative sentiment."""
    negative_aspects = set()
    for transcript in transcripts:
        analysis_raw = transcript.get('ai_analysis', {})
        # Parse JSON string if needed
        if isinstance(analysis_raw, str):
            try:
                analysis = json.loads(analysis_raw)
            except json.JSONDecodeError:
                analysis = {}
        else:
            analysis = analysis_raw

        aspects = analysis.get('aspectSentiment', {}) or {}
        if isinstance(aspects, dict):
            for aspect, score in aspects.items():
                if float(score) < -0.2:
                    negative_aspects.add(aspect.replace('_', ' ').title())

    return ', '.join(sorted(negative_aspects)) if negative_aspects else None

def generate_conclusion(
    client_id: str,
    weighted_score: float,
    category: str,
    stats: Dict,
    negative_aspects: Optional[str]
) -> str:
    """Generate a natural language conclusion similar to the Zendesk aggregator."""
    total = stats.get('total_transcripts', 0)
    negative_pct = (stats['negative_count'] / total * 100) if total else 0.0

    lines = []

    if category == 'Positive':
        lines.append(f"Client {client_id} shows positive sentiment overall ({weighted_score:.2f}).")
        lines.append(f"{stats['positive_count']} of {total} transcripts are positive.")
    elif category == 'Neutral':
        lines.append(f"Client {client_id} shows neutral sentiment ({weighted_score:.2f}).")
        lines.append(f"Sentiment is balanced across {total} transcripts.")
    else:
        lines.append(f"Client {client_id} shows negative sentiment ({weighted_score:.2f}).")
        lines.append(f"{stats['negative_count']} of {total} transcripts ({negative_pct:.1f}%) are negative, indicating risk.")

    if negative_aspects:
        lines.append(f"Primary pain points: {negative_aspects}.")

    if category == 'Negative':
        lines.append("Recommendation: Proactive outreach to address recurring concerns.")
    elif category == 'Neutral':
        lines.append("Recommendation: Monitor trends and resolve emerging issues.")
    else:
        lines.append("Recommendation: Continue delivering high-quality service.")

    return ' '.join(lines)

def save_client_sentiment_summary(
    client_id: str,
    weighted_score: float,
    category: str,
    stats: Dict,
    negative_aspects: Optional[str],
    conclusion: str,
    aspect_sentiment: Dict[str, float],
    period_start: Optional[datetime] = None,
    period_end: Optional[datetime] = None
) -> bool:
    """Persist client-level summary to Supabase."""
    try:
        total = stats['total_transcripts']
        positive_pct = (stats['positive_count'] / total * 100) if total else 0.0
        negative_pct = (stats['negative_count'] / total * 100) if total else 0.0
        neutral_pct = (stats['neutral_count'] / total * 100) if total else 0.0

        payload = {
            'client_id': client_id,
            'period_start': period_start.isoformat() if period_start else None,
            'period_end': period_end.isoformat() if period_end else None,
            'total_tickets_analyzed': total,
            'positive_tickets': stats['positive_count'],
            'negative_tickets': stats['negative_count'],
            'neutral_tickets': stats['neutral_count'],
            'mixed_tickets': stats.get('mixed_count', 0),
            'positive_percentage': round(positive_pct, 2),
            'negative_percentage': round(negative_pct, 2),
            'neutral_percentage': round(neutral_pct, 2),
            'client_final_score': float(weighted_score),
            'client_sentiment_category': category,
            'aspect_sentiment': aspect_sentiment or {},
            'negative_aspects_summary': negative_aspects,
            'conclusion': conclusion,
            'last_updated': datetime.utcnow().isoformat(),
            'last_calculated_at': datetime.utcnow().isoformat()
        }

        supabase.table('client_sentiment_summary') \
            .upsert(payload, on_conflict='client_id,period_start,period_end') \
            .execute()
        return True
    except Exception as exc:
        logger.error(f"Failed to save client summary for {client_id}: {exc}")
        return False

def process_client_sentiment(
    client_id: str,
    period_start: Optional[datetime] = None,
    period_end: Optional[datetime] = None
) -> bool:
    """Process transcripts for a single client."""
    logger.info(f"Processing client {client_id}")
    transcripts = get_client_transcripts(client_id, period_start, period_end)

    if not transcripts:
        logger.warning(f"⚠️  No analyzed transcripts found for {client_id}")
        return False

    weighted_score, stats = calculate_weighted_client_score(transcripts)
    category = classify_client_sentiment(weighted_score)
    aspect_summary = calculate_aspect_sentiment_summary(transcripts)
    negative_aspects = generate_negative_aspects_summary(transcripts)
    conclusion = generate_conclusion(client_id, weighted_score, category, stats, negative_aspects)

    success = save_client_sentiment_summary(
        client_id,
        weighted_score,
        category,
        stats,
        negative_aspects,
        conclusion,
        aspect_summary,
        period_start,
        period_end
    )

    if success:
        logger.info(f"  ✅ {client_id}: {category} ({weighted_score:.2f})")
    return success

def main():
    parser = argparse.ArgumentParser(description="Aggregate transcript sentiment per client")
    parser.add_argument('--client', type=str, help='Process a specific client_platform_id')
    parser.add_argument('--recalculate', action='store_true', help='Force recalculation for all clients')
    parser.add_argument('--period-days', type=int, help='Look back this number of days')
    parser.add_argument('--filter-target', action='store_true', help='Only include clients from target_accounts.json')
    args = parser.parse_args()

    try:
        initialize_supabase()
    except Exception as exc:
        logger.error(f"Failed to initialize Supabase: {exc}")
        sys.exit(1)

    period_start = None
    period_end = None
    if args.period_days:
        period_end = datetime.utcnow()
        period_start = period_end - timedelta(days=args.period_days)
        logger.info(f"Processing transcripts from {period_start.date()} to {period_end.date()}")

    if args.client:
        success = process_client_sentiment(args.client, period_start, period_end)
        sys.exit(0 if success else 1)

    client_ids = get_all_clients_with_transcripts(filter_by_target=args.filter_target)
    if not client_ids:
        logger.warning("⚠️  No clients with transcripts found")
        return

    successes = 0
    failures = 0

    for idx, client_id in enumerate(client_ids, 1):
        logger.info(f"[{idx}/{len(client_ids)}] {client_id}")
        if process_client_sentiment(client_id, period_start, period_end):
            successes += 1
        else:
            failures += 1

    logger.info("=" * 40)
    logger.info(f"Successes: {successes}")
    logger.info(f"Failures: {failures}")

if __name__ == "__main__":
    main()

