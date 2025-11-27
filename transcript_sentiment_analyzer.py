"""
Transcript Sentiment Analyzer
Runs the cardiffnlp/twitter-xlm-roberta-base-sentiment model on DIIO transcripts,
applies Ontop business-aware rules, and caches the per-chunk scores in Supabase.

Usage:
    python transcript_sentiment_analyzer.py                       # Process 50 pending transcripts
    python transcript_sentiment_analyzer.py --limit 20           # Process 20 transcripts
    python transcript_sentiment_analyzer.py --client CL005639    # Only analyze one account
    python transcript_sentiment_analyzer.py --re-analyze         # Re-run already analyzed transcripts
"""

import os
import sys
import json
import argparse
import logging
import re
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path

from dotenv import load_dotenv

try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("⚠️  transformers not installed. Install with: pip install transformers torch scipy")

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("⚠️  supabase not installed. Install with: pip install supabase")

try:
    from issue_category_extractor import (
        extract_issue_category,
        extract_ontop_aspects
    )
    ISSUE_CATEGORY_AVAILABLE = True
except ImportError:
    ISSUE_CATEGORY_AVAILABLE = False
    print("⚠️  issue_category_extractor not found. Install or copy it into the project root.")

# Load environment
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
MODEL_NAME = "cardiffnlp/twitter-xlm-roberta-base-sentiment"

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Globals
sentiment_task = None
supabase: Optional[Client] = None

def initialize_model():
    """Load the HuggingFace sentiment model once."""
    global sentiment_task

    if not TRANSFORMERS_AVAILABLE:
        raise ImportError("transformers library is required for sentiment analysis")

    if sentiment_task is None:
        logger.info(f"🔄 Loading sentiment model: {MODEL_NAME}")

        try:
            from transformers import AutoTokenizer, AutoModelForSequenceClassification

            tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_fast=False)
            model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
            sentiment_task = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)
        except Exception as exc:
            logger.warning("❌ Failed to initialize tokenizer/model individually, falling back to pipeline directly")
            from transformers import XLMRobertaTokenizer, XLMRobertaForSequenceClassification

            tokenizer = XLMRobertaTokenizer.from_pretrained(MODEL_NAME)
            model = XLMRobertaForSequenceClassification.from_pretrained(MODEL_NAME)
            sentiment_task = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)

        logger.info("✅ Sentiment model loaded")

    return sentiment_task

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

def chunk_transcript_text(text: str, max_chars: int = 400) -> List[str]:
    """
    Split transcript text into digestible chunks for the sentiment model.
    Keeps chunks under `max_chars` while staying sentence-aware.
    """
    if not text:
        return []

    paragraphs = [line.strip() for line in text.splitlines() if line.strip()]

    # Fall back to sentence splitting if there are no explicit line breaks
    if not paragraphs:
        paragraphs = re.split(r'(?<=[.!?])\s+', text)

    chunks: List[str] = []
    current = ""

    for fragment in paragraphs:
        if len(current) + len(fragment) + 1 <= max_chars:
            current = f"{current} {fragment}".strip() if current else fragment
        else:
            if current:
                chunks.append(current)
            current = fragment

    if current:
        chunks.append(current)

    # Guarantee at least one chunk
    if not chunks and text.strip():
        chunks.append(text.strip())

    return chunks

def preprocess_text(text: str) -> str:
    """Preprocess text to match the model expectations."""
    if not text:
        return ""

    tokens = []
    for word in text.split():
        if word.startswith('@') and len(word) > 1:
            tokens.append('@user')
        elif word.startswith('http'):
            tokens.append('http')
        else:
            tokens.append(word)

    return " ".join(tokens)

def analyze_chunk(chunk: str) -> Optional[Dict]:
    """Return sentiment for a single chunk."""
    if not chunk:
        return None

    cleaned = preprocess_text(chunk)
    if not cleaned:
        return None

    result = sentiment_task(cleaned)[0]
    label = result['label']
    score = round(result['score'], 4)

    normalized_label = label.lower()
    if 'negative' in normalized_label or 'label_0' in normalized_label:
        label_out = 'Negative'
    elif 'positive' in normalized_label or 'label_2' in normalized_label:
        label_out = 'Positive'
    else:
        label_out = 'Neutral'

    return {
        'chunk': chunk,
        'sentiment': {
            'label': label_out,
            'score': score,
            'original_label': label
        }
    }

def calculate_numerical_sentiment_score(sentiment_results: List[Dict]) -> float:
    """Aggregate chunk sentiments into a -1.0 to +1.0 score."""
    if not sentiment_results:
        return 0.0

    total_score = 0.0
    total_weight = 0.0

    for result in sentiment_results:
        label = result['sentiment']['label']
        confidence = result['sentiment']['score']

        if label == 'Positive':
            value = 1.0
        elif label == 'Negative':
            value = -1.0
        else:
            value = 0.0

        total_score += value * confidence
        total_weight += confidence

    if total_weight == 0:
        return 0.0

    return round(max(-1.0, min(1.0, total_score / total_weight)), 4)

def build_conversation(chunks: List[str]) -> List[Dict]:
    """Build a pseudo conversation structure for issue categorization."""
    return [
        {
            'message_text': chunk,
            'author_type': 'end-user',
            'author_name': 'Customer'
        }
        for chunk in chunks
    ]


def calculate_overall_sentiment(sentiment_results: List[Dict]) -> str:
    """Replicates the logic from Zendesk sentiment processing."""
    if not sentiment_results:
        return 'no_customer_messages'

    labels = [r['sentiment']['label'] for r in sentiment_results]
    scores = [r['sentiment']['score'] for r in sentiment_results]

    positive_count = labels.count('Positive')
    negative_count = labels.count('Negative')
    neutral_count = labels.count('Neutral')

    total = len(labels)
    positive_weighted = sum(scores[i] for i, label in enumerate(labels) if label == 'Positive')
    negative_weighted = sum(scores[i] for i, label in enumerate(labels) if label == 'Negative')
    neutral_weighted = sum(scores[i] for i, label in enumerate(labels) if label == 'Neutral')

    if positive_count / total >= 0.5 and positive_weighted >= max(negative_weighted, neutral_weighted):
        return 'positive'
    elif negative_count / total >= 0.5 and negative_weighted >= max(positive_weighted, neutral_weighted):
        return 'negative'
    elif neutral_count / total >= 0.5 and neutral_weighted >= max(positive_weighted, negative_weighted):
        return 'neutral'
    elif positive_weighted > negative_weighted and positive_weighted > neutral_weighted:
        return 'positive'
    elif negative_weighted > positive_weighted and negative_weighted > neutral_weighted:
        return 'negative'
    elif neutral_weighted > positive_weighted and neutral_weighted > negative_weighted:
        return 'neutral'
    else:
        return 'mixed'


def calculate_aspect_sentiment(
    sentiment_results: List[Dict],
    ontop_aspects: Dict[str, float],
    conversation: List[Dict]
) -> Dict[str, float]:
    """Copy of the aspect score logic used by ticket sentiment analysis."""
    if not ontop_aspects:
        return {}

    overall_score = calculate_numerical_sentiment_score(sentiment_results)
    conversation_text = ' '.join([
        msg.get('message_text', '') or msg.get('body', '')
        for msg in conversation
    ]).lower()

    aspect_sentiment = {}

    for aspect, aspect_confidence in ontop_aspects.items():
        if aspect_confidence < 0.3:
            continue

        aspect_score = overall_score

        if aspect == 'payments':
            payment_negative = ['refund', 'reembolso', 'overcharge', 'wrong charge', 'billing error']
            if any(ind in conversation_text for ind in payment_negative):
                aspect_score = min(aspect_score, -0.4)
        elif aspect == 'card_wallet':
            card_negative = ['declined', 'blocked', 'not working', 'error', 'issue']
            if any(ind in conversation_text for ind in card_negative):
                aspect_score = min(aspect_score, -0.3)
        elif aspect == 'contracts':
            contract_negative = ['problem', 'issue', 'error', 'wrong']
            if any(ind in conversation_text for ind in contract_negative):
                aspect_score = min(aspect_score, -0.1)

        aspect_sentiment[aspect] = round(aspect_score, 4)

    return aspect_sentiment


def apply_business_aware_sentiment(
    overall_sentiment: str,
    sentiment_score: float,
    issue_category: Optional[str],
    ontop_aspects: Dict[str, float],
    conversation: List[Dict]
) -> tuple[str, float]:
    """Reuses Ontop-specific rules defined in the Zendesk flow."""
    adjusted_sentiment = overall_sentiment
    adjusted_score = sentiment_score

    conversation_text = ' '.join([
        msg.get('message_text', '') or msg.get('body', '')
        for msg in conversation
    ]).lower()

    negative_indicators = [
        'refund', 'reembolso', 'billing', 'payment issue', 'overcharge', 'charged incorrectly'
    ]

    has_negative_indicator = any(indicator in conversation_text for indicator in negative_indicators)
    payments_issue = ontop_aspects.get('payments', 0) > 0.5
    card_wallet_issue = ontop_aspects.get('card_wallet', 0) > 0.5
    problem_categories = ['payment', 'refund', 'billing', 'complaint']
    is_problem_category = issue_category and issue_category.lower() in problem_categories
    technical_keywords = ['error', 'bug', 'not working', "can't", 'cannot', 'issue', 'problem']
    polite_indicators = ['please', 'gracias', 'thank you']
    is_technical_issue = issue_category and issue_category.lower() in ['technical', 'account']
    has_polite_language = any(indicator in conversation_text for indicator in polite_indicators)
    has_technical_keyword = any(keyword in conversation_text for keyword in technical_keywords)

    if is_technical_issue and has_polite_language and has_technical_keyword:
        if adjusted_sentiment == 'negative' and adjusted_score < -0.5:
            adjusted_sentiment = 'neutral'
            adjusted_score = max(adjusted_score, -0.2)
        elif adjusted_score < -0.7:
            adjusted_score = max(adjusted_score, -0.3)

    if has_negative_indicator or (payments_issue and is_problem_category):
        if adjusted_sentiment == 'positive':
            adjusted_sentiment = 'negative'
            adjusted_score = min(adjusted_score, -0.3)
        elif adjusted_sentiment == 'neutral':
            adjusted_sentiment = 'negative'
            adjusted_score = -0.2

    if card_wallet_issue and adjusted_score > 0:
        adjusted_score = max(adjusted_score - 0.2, -0.5)
        if adjusted_score < 0:
            adjusted_sentiment = 'negative'

    return adjusted_sentiment, round(adjusted_score, 4)

def analyze_transcript(
    transcript: Dict,
    chunk_size: int = 400
) -> Optional[Dict]:
    """Run the full transcript analysis and return the cached payload."""
    transcript_text = transcript.get('transcript_text')
    if not transcript_text:
        logger.warning("Transcript without text, skipping")
        return None

    if isinstance(transcript_text, (list, tuple)):
        transcript_text = "\n".join(str(item) for item in transcript_text)
    else:
        transcript_text = str(transcript_text)

    chunks = chunk_transcript_text(transcript_text, max_chars=chunk_size)
    if not chunks:
        logger.warning("No chunks produced for transcript, skipping")
        return None

    sentiment_results = []
    for idx, chunk in enumerate(chunks, 1):
        analysis = analyze_chunk(chunk)
        if analysis:
            analysis['chunk_index'] = idx
            sentiment_results.append(analysis)

    overall_sentiment = calculate_overall_sentiment([{'sentiment': r['sentiment']} for r in sentiment_results])
    numerical_score = calculate_numerical_sentiment_score(sentiment_results)

    conversation = build_conversation(chunks)

    issue_category = None
    ontop_aspects = {}
    aspect_sentiment = {}

    if ISSUE_CATEGORY_AVAILABLE:
        issue_category = extract_issue_category(conversation, analyze_all=True)
        ontop_aspects = extract_ontop_aspects(conversation, analyze_all=True)
        aspect_sentiment = calculate_aspect_sentiment(sentiment_results, ontop_aspects, conversation)

    if ISSUE_CATEGORY_AVAILABLE:
        overall_sentiment, numerical_score = apply_business_aware_sentiment(
            overall_sentiment,
            numerical_score,
            issue_category,
            ontop_aspects,
            conversation
        )

    payload = {
        'overallSentiment': overall_sentiment.lower(),
        'sentimentScore': float(numerical_score),
        'sentimentResults': sentiment_results,
        'issueCategory': issue_category,
        'ontopAspects': ontop_aspects,
        'aspectSentiment': aspect_sentiment,
        'analyzedAt': datetime.utcnow().isoformat()
    }

    return payload

def get_transcripts(limit: int = 50, re_analyze: bool = False, client_id: Optional[str] = None):
    """Fetch transcripts that still need sentiment analysis."""
    query = supabase.table('diio_transcripts') \
        .select('id, client_platform_id, transcript_text, source_name, transcript_type, occurred_at') \
        .not_.is_('transcript_text', 'null') \
        .not_.is_('client_platform_id', 'null')

    if client_id:
        query = query.eq('client_platform_id', client_id)

    if not re_analyze:
        query = query.is_('ai_analysis', 'null')

    if limit > 0:
        query = query.limit(limit)

    result = query.order('occurred_at', desc=True).execute()
    return result.data or []

def update_transcript_analysis(transcript_id: str, analysis: Dict):
    """Persist the analysis back to Supabase."""
    try:
        supabase.table('diio_transcripts') \
            .update({
                'ai_analysis': analysis,
                'ai_analysis_date': datetime.utcnow().isoformat(),
                'analyzed_status': 'finished',
                'updated_at': datetime.utcnow().isoformat()
            }) \
            .eq('id', transcript_id) \
            .execute()
        return True
    except Exception as exc:
        logger.error(f"Failed to update transcript {transcript_id}: {exc}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Analyze DIIO transcripts with cardiffnlp/twitter-xlm-roberta-base-sentiment")
    parser.add_argument('--limit', type=int, default=50, help='Maximum transcripts to analyze')
    parser.add_argument('--client', type=str, help='Filter by client_platform_id')
    parser.add_argument('--re-analyze', action='store_true', help='Re-run analysis even if ai_analysis already exists')
    parser.add_argument('--chunk-size', type=int, default=400, help='Target characters per chunk sent to the model')
    args = parser.parse_args()

    try:
        initialize_model()
        initialize_supabase()
    except Exception as exc:
        logger.error(f"Initialization failed: {exc}")
        sys.exit(1)

    transcripts = get_transcripts(limit=args.limit, re_analyze=args.re_analyze, client_id=args.client)
    if not transcripts:
        logger.info("No transcripts to analyze")
        return

    processed = 0
    failed = 0

    for transcript in transcripts:
        transcript_id = transcript.get('id')
        account_id = transcript.get('client_platform_id')
        logger.info(f"📄 Processing transcript {transcript_id} for client {account_id}")
        analysis = analyze_transcript(transcript, chunk_size=args.chunk_size)

        if not analysis:
            failed += 1
            continue

        if update_transcript_analysis(transcript_id, analysis):
            processed += 1
        else:
            failed += 1

    logger.info("=" * 40)
    logger.info(f"Processed: {processed}")
    logger.info(f"Failed: {failed}")

if __name__ == "__main__":
    main()

