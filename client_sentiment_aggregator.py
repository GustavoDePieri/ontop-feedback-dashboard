"""
Client-Level Sentiment Aggregator
Performs Stage 2 aggregation: Groups ticket-level sentiment into holistic client-level scores.

This script:
1. Groups all external tickets by client_id
2. Calculates weighted aggregate scores (negative weighted higher, recency matters)
3. Classifies into sentiment categories (Positive, Neutral, Negative)
4. Generates natural language conclusions
5. Saves results to client_sentiment_summary table

Usage:
    python client_sentiment_aggregator.py                    # Process all clients
    python client_sentiment_aggregator.py --client CL005639  # Process specific client
    python client_sentiment_aggregator.py --recalculate      # Recalculate all clients
"""

import os
import sys
import json
import argparse
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from decimal import Decimal
from pathlib import Path
from dotenv import load_dotenv

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("⚠️  supabase not installed. Install with: pip install supabase")

# Load environment variables
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
TARGET_ACCOUNTS_FILE = "target_accounts.json"

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================
# SUPABASE INTEGRATION
# ============================================================
supabase: Optional[Client] = None

def initialize_supabase():
    """Initialize Supabase client."""
    global supabase
    
    if not SUPABASE_AVAILABLE:
        raise ImportError("supabase library not available")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
    
    if supabase is None:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("✅ Supabase client initialized")
    
    return supabase


# ============================================================
# WEIGHTING FUNCTIONS
# ============================================================

def calculate_recency_weight(created_at: str, reference_date: Optional[datetime] = None) -> float:
    """
    Calculate recency weight for a ticket.
    More recent tickets have higher weight.
    
    Args:
        created_at: ISO timestamp string
        reference_date: Reference date (defaults to now)
        
    Returns:
        Weight factor (0.5 to 2.0)
    """
    if reference_date is None:
        reference_date = datetime.utcnow()
    
    try:
        if isinstance(created_at, str):
            ticket_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        else:
            ticket_date = created_at
        
        # Calculate days since ticket creation
        days_ago = (reference_date - ticket_date.replace(tzinfo=None)).days
        
        # Weight formula: newer tickets get higher weight
        # Tickets from last 7 days: 2.0x weight
        # Tickets from last 30 days: 1.5x weight
        # Tickets from last 90 days: 1.0x weight
        # Older tickets: 0.5x weight
        if days_ago <= 7:
            return 2.0
        elif days_ago <= 30:
            return 1.5
        elif days_ago <= 90:
            return 1.0
        else:
            return 0.5
    except Exception as e:
        logger.warning(f"Error calculating recency weight: {e}")
        return 1.0


def calculate_sentiment_weight(sentiment_score: float, overall_sentiment: str) -> float:
    """
    Calculate weight factor for sentiment.
    Negative sentiments are weighted higher than positive ones.
    
    Args:
        sentiment_score: Numerical score from -1.0 to 1.0
        overall_sentiment: Sentiment label
        
    Returns:
        Weight factor (1.0 to 2.5)
    """
    # Negative sentiments get higher weight
    if overall_sentiment == 'negative' or sentiment_score < -0.3:
        return 2.5  # Negative issues matter more
    elif overall_sentiment == 'mixed' or -0.3 <= sentiment_score < 0:
        return 1.5
    elif overall_sentiment == 'neutral' or -0.1 <= sentiment_score <= 0.1:
        return 1.0
    else:  # Positive
        return 1.2  # Positive feedback is good but less critical


def calculate_weighted_client_score(tickets: List[Dict]) -> Tuple[float, Dict]:
    """
    Calculate weighted aggregate sentiment score for a client.
    
    Formula: Client Score = Σ(TicketScore_i × WeightFactor_i) / Σ(WeightFactor_i)
    
    Where WeightFactor = recency_weight × sentiment_weight
    
    Args:
        tickets: List of ticket dicts with sentiment data
        
    Returns:
        Tuple of (weighted_score, statistics_dict)
    """
    if not tickets:
        return 0.0, {}
    
    total_weighted_score = 0.0
    total_weight = 0.0
    
    reference_date = datetime.utcnow()
    
    sentiment_counts = {
        'positive': 0,
        'negative': 0,
        'neutral': 0,
        'mixed': 0
    }
    
    for ticket in tickets:
        # Get sentiment score (default to 0.0 if missing)
        sentiment_score = float(ticket.get('sentiment_score', 0.0))
        overall_sentiment = ticket.get('overall_sentiment', 'neutral')
        created_at = ticket.get('created_at')
        
        # Calculate weights
        recency_w = calculate_recency_weight(created_at, reference_date)
        sentiment_w = calculate_sentiment_weight(sentiment_score, overall_sentiment)
        total_weight_factor = recency_w * sentiment_w
        
        # Add to weighted sum
        total_weighted_score += sentiment_score * total_weight_factor
        total_weight += total_weight_factor
        
        # Count sentiments
        sentiment_label = overall_sentiment.lower()
        if sentiment_label in sentiment_counts:
            sentiment_counts[sentiment_label] += 1
    
    # Calculate final weighted score
    if total_weight > 0:
        weighted_score = total_weighted_score / total_weight
    else:
        weighted_score = 0.0
    
    stats = {
        'total_tickets': len(tickets),
        'positive_count': sentiment_counts['positive'],
        'negative_count': sentiment_counts['negative'],
        'neutral_count': sentiment_counts['neutral'],
        'mixed_count': sentiment_counts['mixed']
    }
    
    return round(weighted_score, 4), stats


# ============================================================
# CLASSIFICATION FUNCTIONS
# ============================================================

def classify_client_sentiment(weighted_score: float, stats: Dict) -> str:
    """
    Classify client sentiment into category.
    
    Categories:
    - Positive: score > 0.2
    - Neutral: -0.2 <= score <= 0.2
    - Negative: score < -0.2
    
    Args:
        weighted_score: Weighted sentiment score
        stats: Statistics dict with ticket counts
        
    Returns:
        Sentiment category string
    """
    if weighted_score > 0.2:
        return 'Positive'
    elif weighted_score >= -0.2:
        return 'Neutral'
    else:
        return 'Negative'


def generate_negative_aspects_summary(tickets: List[Dict]) -> str:
    """
    Generate summary of negative aspects from tickets.
    
    Args:
        tickets: List of ticket dicts
        
    Returns:
        Comma-separated string of negative aspects
    """
    negative_aspects = set()
    
    for ticket in tickets:
        aspect_sentiment = ticket.get('aspect_sentiment', {})
        if isinstance(aspect_sentiment, dict):
            for aspect, score in aspect_sentiment.items():
                if score < -0.2:  # Negative aspect
                    # Format aspect name nicely
                    formatted = aspect.replace('_', ' ').title()
                    negative_aspects.add(formatted)
    
    if negative_aspects:
        return ', '.join(sorted(negative_aspects))
    return None


def generate_conclusion(
    client_id: str,
    weighted_score: float,
    category: str,
    stats: Dict,
    negative_aspects: Optional[str]
) -> str:
    """
    Generate natural language conclusion for client sentiment.
    
    Args:
        client_id: Client identifier
        weighted_score: Weighted sentiment score
        category: Sentiment category
        stats: Statistics dict
        negative_aspects: Summary of negative aspects
        
    Returns:
        Natural language conclusion string
    """
    total = stats['total_tickets']
    negative_pct = (stats['negative_count'] / total * 100) if total > 0 else 0
    
    conclusion_parts = []
    
    # Overall assessment
    if category == 'Positive':
        conclusion_parts.append(f"Client {client_id} shows positive sentiment overall (score: {weighted_score:.2f}).")
        conclusion_parts.append(f"Out of {total} tickets, {stats['positive_count']} are positive.")
    elif category == 'Neutral':
        conclusion_parts.append(f"Client {client_id} shows neutral sentiment (score: {weighted_score:.2f}).")
        conclusion_parts.append(f"Sentiment is balanced across {total} tickets.")
    else:  # Negative
        conclusion_parts.append(f"Client {client_id} shows negative sentiment (score: {weighted_score:.2f}).")
        conclusion_parts.append(f"{stats['negative_count']} out of {total} tickets ({negative_pct:.1f}%) are negative, indicating potential retention risk.")
    
    # Add negative aspects if present
    if negative_aspects:
        conclusion_parts.append(f"Primary pain points: {negative_aspects}.")
    
    # Add recommendation
    if category == 'Negative':
        conclusion_parts.append("Recommendation: Proactive outreach and issue resolution to improve client satisfaction.")
    elif category == 'Neutral':
        conclusion_parts.append("Recommendation: Monitor closely and address any emerging issues promptly.")
    else:  # Positive
        conclusion_parts.append("Recommendation: Maintain current service quality and leverage positive feedback.")
    
    return ' '.join(conclusion_parts)


# ============================================================
# DATA FETCHING
# ============================================================

def get_client_tickets(client_id: str, period_start: Optional[datetime] = None, period_end: Optional[datetime] = None) -> List[Dict]:
    """
    Fetch all analyzed external tickets for a client.
    
    Args:
        client_id: Client identifier
        period_start: Optional start date for period
        period_end: Optional end date for period
        
    Returns:
        List of ticket dicts
    """
    try:
        query = supabase.table('zendesk_conversations')\
            .select('ticket_id, client_id, created_at, overall_sentiment, sentiment_score, aspect_sentiment, issue_category')\
            .eq('client_id', client_id)\
            .eq('is_external', True)\
            .not_.is_('sentiment_analyzed_at', 'null')\
            .not_.is_('sentiment_score', 'null')
        
        if period_start:
            query = query.gte('created_at', period_start.isoformat())
        if period_end:
            query = query.lte('created_at', period_end.isoformat())
        
        result = query.execute()
        return result.data or []
    except Exception as e:
        logger.error(f"Error fetching tickets for client {client_id}: {e}")
        return []


def load_client_list(file_path: str = TARGET_ACCOUNTS_FILE) -> List[str]:
    """
    Load client IDs from target_accounts.json file.
    
    Args:
        file_path: Path to the JSON file with client list
        
    Returns:
        List of client IDs (e.g., ['CL004114', 'CL004778', ...])
    """
    try:
        file_path_obj = Path(file_path)
        
        if not file_path_obj.exists():
            logger.warning(f"⚠️  Client list file not found: {file_path}")
            logger.warning(f"   Will process all clients with analyzed tickets")
            return []
        
        with open(file_path_obj, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract client IDs from the accounts array
        client_ids = data.get('accounts', [])
        
        if not client_ids:
            logger.warning(f"⚠️  No accounts found in {file_path}")
            return []
        
        # Clean up any whitespace
        client_ids = [str(cid).strip() for cid in client_ids if cid]
        
        logger.info(f"✅ Loaded {len(client_ids)} client IDs from {file_path}")
        return client_ids
    except Exception as e:
        logger.error(f"Error loading client list from {file_path}: {e}")
        return []


def get_all_clients_with_tickets(filter_by_target: bool = False) -> List[str]:
    """
    Get list of client IDs that have analyzed external tickets.
    By default, processes ALL clients (not filtered by target_accounts.json).
    
    Args:
        filter_by_target: If True, only return clients from target_accounts.json
        
    Returns:
        List of client IDs
    """
    try:
        result = supabase.table('zendesk_conversations')\
            .select('client_id')\
            .eq('is_external', True)\
            .not_.is_('sentiment_analyzed_at', 'null')\
            .not_.is_('client_id', 'null')\
            .execute()
        
        # Get unique client IDs
        all_client_ids = list(set([ticket['client_id'] for ticket in (result.data or []) if ticket.get('client_id')]))
        
        # Filter by target list if requested
        if filter_by_target:
            target_clients = load_client_list()
            if target_clients:
                # Only return clients that are in both lists
                client_ids = [cid for cid in all_client_ids if cid in target_clients]
                logger.info(f"📋 Filtered to {len(client_ids)} clients from target list (out of {len(all_client_ids)} total)")
                return sorted(client_ids)
            else:
                logger.warning("⚠️  Could not load target client list, processing all clients")
        
        logger.info(f"📋 Processing ALL {len(all_client_ids)} clients with analyzed external tickets")
        return sorted(all_client_ids)
    except Exception as e:
        logger.error(f"Error fetching client list: {e}")
        return []


# ============================================================
# AGGREGATION AND SAVING
# ============================================================

def calculate_aspect_sentiment_summary(tickets: List[Dict]) -> Dict[str, float]:
    """
    Calculate average sentiment per aspect across all tickets.
    
    Args:
        tickets: List of ticket dicts
        
    Returns:
        Dict mapping aspect names to average sentiment scores
    """
    aspect_scores = {}
    aspect_counts = {}
    
    for ticket in tickets:
        aspect_sentiment = ticket.get('aspect_sentiment', {})
        if isinstance(aspect_sentiment, dict):
            for aspect, score in aspect_sentiment.items():
                if aspect not in aspect_scores:
                    aspect_scores[aspect] = 0.0
                    aspect_counts[aspect] = 0
                aspect_scores[aspect] += score
                aspect_counts[aspect] += 1
    
    # Calculate averages
    aspect_averages = {}
    for aspect in aspect_scores:
        if aspect_counts[aspect] > 0:
            aspect_averages[aspect] = round(aspect_scores[aspect] / aspect_counts[aspect], 4)
    
    return aspect_averages


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
    """
    Save or update client sentiment summary in database.
    
    Args:
        client_id: Client identifier
        weighted_score: Weighted sentiment score
        category: Sentiment category
        stats: Statistics dict
        negative_aspects: Summary of negative aspects
        conclusion: Natural language conclusion
        aspect_sentiment: Dict of aspect sentiment scores
        period_start: Optional period start
        period_end: Optional period end
        
    Returns:
        True if successful
    """
    try:
        total = stats['total_tickets']
        positive_pct = (stats['positive_count'] / total * 100) if total > 0 else 0.0
        negative_pct = (stats['negative_count'] / total * 100) if total > 0 else 0.0
        neutral_pct = (stats['neutral_count'] / total * 100) if total > 0 else 0.0
        
        summary_data = {
            'client_id': client_id,
            'period_start': period_start.isoformat() if period_start else None,
            'period_end': period_end.isoformat() if period_end else None,
            'total_tickets_analyzed': total,
            'positive_tickets': stats['positive_count'],
            'negative_tickets': stats['negative_count'],
            'neutral_tickets': stats['neutral_count'],
            'mixed_tickets': stats['mixed_count'],
            'positive_percentage': round(positive_pct, 2),
            'negative_percentage': round(negative_pct, 2),
            'neutral_percentage': round(neutral_pct, 2),
            'client_final_score': float(weighted_score),
            'client_sentiment_category': category,
            'aspect_sentiment': aspect_sentiment if aspect_sentiment else {},
            'negative_aspects_summary': negative_aspects,
            'conclusion': conclusion,
            'last_updated': datetime.utcnow().isoformat(),
            'last_calculated_at': datetime.utcnow().isoformat()
        }
        
        # Upsert (insert or update)
        supabase.table('client_sentiment_summary')\
            .upsert(summary_data, on_conflict='client_id,period_start,period_end')\
            .execute()
        
        return True
    except Exception as e:
        logger.error(f"Error saving client sentiment summary for {client_id}: {e}")
        return False


def process_client_sentiment(
    client_id: str,
    period_start: Optional[datetime] = None,
    period_end: Optional[datetime] = None
) -> bool:
    """
    Process sentiment aggregation for a single client.
    
    Args:
        client_id: Client identifier
        period_start: Optional period start
        period_end: Optional period end
        
    Returns:
        True if successful
    """
    logger.info(f"Processing client {client_id}...")
    
    # Fetch tickets
    tickets = get_client_tickets(client_id, period_start, period_end)
    
    if not tickets:
        logger.warning(f"  ⚠️  No analyzed tickets found for client {client_id}")
        return False
    
    # Calculate weighted score
    weighted_score, stats = calculate_weighted_client_score(tickets)
    
    # Classify sentiment
    category = classify_client_sentiment(weighted_score, stats)
    
    # Generate negative aspects summary
    negative_aspects = generate_negative_aspects_summary(tickets)
    
    # Calculate aspect sentiment summary
    aspect_sentiment = calculate_aspect_sentiment_summary(tickets)
    
    # Generate conclusion
    conclusion = generate_conclusion(client_id, weighted_score, category, stats, negative_aspects)
    
    # Save to database
    success = save_client_sentiment_summary(
        client_id, weighted_score, category, stats, negative_aspects,
        conclusion, aspect_sentiment, period_start, period_end
    )
    
    if success:
        logger.info(f"  ✅ {client_id}: {category} (score: {weighted_score:.2f}, {stats['total_tickets']} tickets)")
    else:
        logger.error(f"  ❌ Failed to save summary for {client_id}")
    
    return success


# ============================================================
# MAIN FUNCTION
# ============================================================

def main():
    """Main function to run client sentiment aggregation."""
    parser = argparse.ArgumentParser(description='Aggregate ticket-level sentiment to client-level')
    parser.add_argument('--client', type=str, help='Process specific client ID')
    parser.add_argument('--recalculate', action='store_true', help='Recalculate all clients')
    parser.add_argument('--period-days', type=int, help='Number of days to look back (default: all time)')
    parser.add_argument('--filter-target', action='store_true', help='Filter by target_accounts.json (default: process ALL clients)')
    parser.add_argument('--clients-file', type=str, default=TARGET_ACCOUNTS_FILE, help=f'Path to client list JSON file (default: {TARGET_ACCOUNTS_FILE})')
    
    args = parser.parse_args()
    
    # Initialize
    initialize_supabase()
    
    logger.info("="*80)
    logger.info("CLIENT SENTIMENT AGGREGATION")
    logger.info("="*80)
    
    # Determine period
    period_start = None
    period_end = None
    if args.period_days:
        period_end = datetime.utcnow()
        period_start = period_end - timedelta(days=args.period_days)
        logger.info(f"📅 Processing period: {period_start.date()} to {period_end.date()}")
    else:
        logger.info("📅 Processing all-time data (period_start and period_end will be NULL)")
    
    # Process clients
    if args.client:
        # Process specific client
        success = process_client_sentiment(args.client, period_start, period_end)
        sys.exit(0 if success else 1)
    else:
        # Process ALL clients by default (not filtered by target list)
        # Use --filter-target flag to filter by target_accounts.json
        filter_by_target = getattr(args, 'filter_target', False)
        client_ids = get_all_clients_with_tickets(filter_by_target=filter_by_target)
        logger.info(f"📊 Found {len(client_ids)} clients with analyzed tickets")
        
        if not client_ids:
            logger.warning("⚠️  No clients found with analyzed tickets. Run sentiment analysis first.")
            sys.exit(1)
        
        success_count = 0
        failed_count = 0
        
        for i, client_id in enumerate(client_ids, 1):
            logger.info(f"[{i}/{len(client_ids)}] Processing {client_id}...")
            if process_client_sentiment(client_id, period_start, period_end):
                success_count += 1
            else:
                failed_count += 1
        
        logger.info("="*80)
        logger.info("✅ AGGREGATION COMPLETED")
        logger.info(f"   Success: {success_count}")
        logger.info(f"   Failed: {failed_count}")
        logger.info("="*80)


if __name__ == "__main__":
    main()

