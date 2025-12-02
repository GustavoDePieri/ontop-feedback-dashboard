"""
Sentiment Analysis for Zendesk Conversations - Using HuggingFace API

This script processes conversations from Supabase and analyzes sentiment using the 
Hugging Face API (twitter-xlm-roberta-base-sentiment model).

Modified to use HuggingFace Inference API instead of loading model locally.

Usage:
    python zendesk_sentiment_analyzer.py                    # Process 50 tickets
    python zendesk_sentiment_analyzer.py --batch-size 100   # Process 100 tickets
    python zendesk_sentiment_analyzer.py --all-clients       # Process all external tickets
    python zendesk_sentiment_analyzer.py --external-only    # Only external tickets
"""

import os
import sys
import json
import argparse
import logging
import requests
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
from dotenv import load_dotenv

# Import issue category extractor
try:
    # Try relative import first (if in same directory)
    from issue_category_extractor import (
        extract_issue_category, 
        extract_all_categories,
        extract_ontop_aspects,
        get_primary_ontop_aspect
    )
    ISSUE_CATEGORY_AVAILABLE = True
except ImportError:
    # Try absolute import
    try:
        sys.path.append(os.path.dirname(__file__))
        from issue_category_extractor import (
            extract_issue_category, 
            extract_all_categories,
            extract_ontop_aspects,
            get_primary_ontop_aspect
        )
        ISSUE_CATEGORY_AVAILABLE = True
    except ImportError:
        ISSUE_CATEGORY_AVAILABLE = False
        print("⚠️  issue_category_extractor not available")

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
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")  # Support both variable names
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
MODEL_NAME = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
# Use the inference API endpoint (router endpoint may require different format)
HUGGINGFACE_API_URL = f"https://router.huggingface.co/models/{MODEL_NAME}"

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================
# HUGGINGFACE API INTEGRATION
# ============================================================

def analyze_sentiment_with_api(text: str) -> Optional[Dict]:
    """
    Analyze sentiment using HuggingFace Inference API.
    
    Args:
        text: Text to analyze
        
    Returns:
        Dict with 'label' and 'score', or None if error
    """
    if not text or len(text.strip()) == 0:
        return None
    
    if not HUGGINGFACE_API_KEY:
        logger.error("HUGGINGFACE_API_KEY not set in environment")
        return None
    
    try:
        # Preprocess text (truncate to 512 tokens max for API)
        cleaned_text = preprocess_text(text)
        if not cleaned_text or len(cleaned_text.strip()) == 0:
            return None
        
        # Truncate to reasonable length (API has limits)
        max_length = 1000  # Characters, not tokens
        if len(cleaned_text) > max_length:
            cleaned_text = cleaned_text[:max_length]
        
        # Call HuggingFace Inference API
        headers = {
            "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": cleaned_text
        }
        
        response = requests.post(
            HUGGINGFACE_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code != 200:
            logger.warning(f"HuggingFace API error: {response.status_code} - {response.text}")
            return None
        
        result = response.json()
        
        # Handle API response format
        # API returns: [{"label": "POSITIVE", "score": 0.99}, ...]
        if isinstance(result, list) and len(result) > 0:
            top_result = result[0]
        elif isinstance(result, dict):
            top_result = result
        else:
            logger.warning(f"Unexpected API response format: {result}")
            return None
        
        # Map labels to our format
        label = top_result.get('label', '').upper()
        score = float(top_result.get('score', 0.0))
        
        # Normalize label
        if 'POSITIVE' in label or 'LABEL_2' in label:
            mapped_label = 'Positive'
        elif 'NEGATIVE' in label or 'LABEL_0' in label:
            mapped_label = 'Negative'
        else:
            mapped_label = 'Neutral'
        
        return {
            'label': mapped_label,
            'score': round(score, 4),
            'original_label': label
        }
        
    except requests.exceptions.Timeout:
        logger.warning(f"Timeout analyzing text (truncated): {text[:100]}...")
        return None
    except Exception as e:
        logger.warning(f"Error analyzing sentiment with API: {e}")
        return None

def preprocess_text(text: str) -> str:
    """
    Preprocess text for sentiment analysis.
    
    Args:
        text: Raw text
        
    Returns:
        Cleaned text
    """
    if not text:
        return ""
    
    # Basic cleaning
    text = text.strip()
    
    # Remove excessive whitespace
    import re
    text = re.sub(r'\s+', ' ', text)
    
    return text

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
# SENTIMENT ANALYSIS FUNCTIONS
# ============================================================

def analyze_message(message_text: str) -> Optional[Dict]:
    """
    Analyze sentiment of a single message using HuggingFace API.
    
    Args:
        message_text: Message text to analyze
        
    Returns:
        Dict with sentiment analysis result or None
    """
    return analyze_sentiment_with_api(message_text)

def analyze_conversation(conversation: List[Dict], analyze_all: bool = False) -> List[Dict]:
    """
    Analyze all messages in a conversation.
    
    Args:
        conversation: List of message dicts from Supabase
        analyze_all: If True, analyze all messages. If False, only customer messages.
        
    Returns:
        List of sentiment results with message metadata
    """
    if not conversation:
        return []
    
    sentiment_results = []
    
    for message in conversation:
        message_text = message.get('message_text', '')
        author_type = message.get('author_type', '')
        message_id = message.get('message_id')
        timestamp = message.get('timestamp')
        
        # Skip if no text
        if not message_text:
            continue
        
        # Filter: Only analyze customer messages unless analyze_all=True
        if not analyze_all and author_type != 'end-user':
            continue
        
        # Analyze message
        sentiment = analyze_message(message_text)
        
        if sentiment:
            sentiment_results.append({
                'message_id': message_id,
                'message_text': message_text[:200],  # Truncate for storage
                'author_type': author_type,
                'author_name': message.get('author_name'),
                'timestamp': timestamp,
                'sentiment': sentiment
            })
    
    return sentiment_results

def calculate_numerical_sentiment_score(sentiment_results: List[Dict]) -> float:
    """
    Calculate numerical sentiment score from -1.0 (negative) to 1.0 (positive).
    
    Args:
        sentiment_results: List of sentiment analysis results
        
    Returns:
        Float score from -1.0 to 1.0
    """
    if not sentiment_results:
        return 0.0
    
    total_score = 0.0
    total_weight = 0.0
    
    for result in sentiment_results:
        label = result['sentiment']['label']
        confidence = result['sentiment']['score']
        
        # Map labels to numerical values
        if label == 'Positive':
            value = 1.0
        elif label == 'Negative':
            value = -1.0
        else:  # Neutral
            value = 0.0
        
        # Weight by confidence
        total_score += value * confidence
        total_weight += confidence
    
    if total_weight == 0:
        return 0.0
    
    # Normalize to -1.0 to 1.0 range
    score = total_score / total_weight
    return round(max(-1.0, min(1.0, score)), 4)

def apply_business_aware_sentiment(
    overall_sentiment: str,
    sentiment_score: float,
    issue_category: Optional[str],
    ontop_aspects: Dict[str, float],
    conversation: List[Dict]
) -> tuple[str, float]:
    """
    Apply Ontop business-aware sentiment adjustments.
    
    Business Rules:
    - Billing/payment issues should be negative even if polite
    - Refund requests indicate negative sentiment
    - Contract/compliance issues may be neutral or negative
    - Card/wallet problems are typically negative
    
    Args:
        overall_sentiment: Current sentiment label
        sentiment_score: Current numerical score
        issue_category: Extracted issue category
        ontop_aspects: Dict of Ontop aspects with confidence scores
        conversation: Full conversation for context
        
    Returns:
        Tuple of (adjusted_sentiment, adjusted_score)
    """
    adjusted_sentiment = overall_sentiment
    adjusted_score = sentiment_score
    
    # Check for billing/payment issues
    if issue_category == 'payment' or 'payments' in ontop_aspects:
        if sentiment_score > -0.3:  # Not already strongly negative
            adjusted_sentiment = 'negative'
            adjusted_score = min(-0.3, sentiment_score - 0.3)
    
    # Check for refund requests
    conversation_text = ' '.join([msg.get('message_text', '') for msg in conversation]).lower()
    if 'refund' in conversation_text or 'money back' in conversation_text:
        if sentiment_score > -0.2:
            adjusted_sentiment = 'negative'
            adjusted_score = min(-0.2, sentiment_score - 0.2)
    
    # Check for card/wallet issues
    if 'card_wallet' in ontop_aspects or issue_category == 'card_wallet':
        if sentiment_score > -0.2:
            adjusted_sentiment = 'negative'
            adjusted_score = min(-0.2, sentiment_score - 0.2)
    
    return adjusted_sentiment, adjusted_score

def calculate_overall_sentiment(sentiment_results: List[Dict]) -> str:
    """
    Calculate overall sentiment from message-level results.
    Ensures we never return 'mixed' - always returns 'positive', 'neutral', or 'negative'.
    
    Args:
        sentiment_results: List of sentiment analysis results
        
    Returns:
        'positive', 'neutral', or 'negative'
    """
    if not sentiment_results:
        return 'neutral'
    
    # Count weighted sentiment
    positive_weighted = 0.0
    negative_weighted = 0.0
    neutral_weighted = 0.0
    
    for result in sentiment_results:
        label = result['sentiment']['label']
        confidence = result['sentiment']['score']
        
        if label == 'Positive':
            positive_weighted += confidence
        elif label == 'Negative':
            negative_weighted += confidence
        else:
            neutral_weighted += confidence
    
    # Determine overall sentiment (no 'mixed' allowed)
    if positive_weighted > negative_weighted and positive_weighted > neutral_weighted:
        return 'positive'
    elif negative_weighted > positive_weighted and negative_weighted > neutral_weighted:
        return 'negative'
    elif neutral_weighted > positive_weighted and neutral_weighted > negative_weighted:
        return 'neutral'
    else:
        # Fallback to numerical score if all weighted scores are equal
        numerical_score = calculate_numerical_sentiment_score(sentiment_results)
        if numerical_score > 0.1:
            return 'positive'
        elif numerical_score < -0.1:
            return 'negative'
        else:
            return 'neutral'

# ============================================================
# MAIN PROCESSING FUNCTIONS
# ============================================================

def process_ticket(ticket: Dict, analyze_all: bool = False) -> Dict:
    """
    Process a single ticket: analyze sentiment and extract categories.
    
    Args:
        ticket: Ticket dict from Supabase
        analyze_all: Whether to analyze all messages or just customer messages
        
    Returns:
        Dict with sentiment analysis results
    """
    conversation = ticket.get('conversation', [])
    if not conversation:
        return {
            'ticket_id': ticket.get('ticket_id'),
            'error': 'No conversation data'
        }
    
    # Analyze sentiment
    sentiment_results = analyze_conversation(conversation, analyze_all=analyze_all)
    
    if not sentiment_results:
        return {
            'ticket_id': ticket.get('ticket_id'),
            'error': 'No sentiment results'
        }
    
    # Calculate scores
    numerical_score = calculate_numerical_sentiment_score(sentiment_results)
    overall_sentiment = calculate_overall_sentiment(sentiment_results)
    
    # Extract issue categories
    conversation_text = ' '.join([msg.get('message_text', '') for msg in conversation])
    issue_category = None
    ontop_aspects = {}
    
    if ISSUE_CATEGORY_AVAILABLE:
        try:
            issue_category = extract_issue_category(conversation_text)
            ontop_aspects = extract_ontop_aspects(conversation_text)
        except Exception as e:
            logger.warning(f"Error extracting categories: {e}")
    
    # Apply business-aware adjustments
    adjusted_sentiment, adjusted_score = apply_business_aware_sentiment(
        overall_sentiment.lower(),
        numerical_score,
        issue_category,
        ontop_aspects,
        conversation
    )
    
    return {
        'ticket_id': ticket.get('ticket_id'),
        'sentiment_results': sentiment_results,
        'overall_sentiment': adjusted_sentiment,
        'sentiment_score': adjusted_score,
        'issue_category': issue_category,
        'ontop_aspects': ontop_aspects,
        'total_messages_analyzed': len(sentiment_results)
    }

def update_ticket_sentiment(ticket_id: int, analysis_result: Dict):
    """
    Update ticket in Supabase with sentiment analysis results.
    
    Args:
        ticket_id: Zendesk ticket ID
        analysis_result: Result from process_ticket()
    """
    if 'error' in analysis_result:
        logger.warning(f"Skipping update for ticket {ticket_id}: {analysis_result['error']}")
        return
    
    try:
        update_data = {
            'sentiment_analyzed_at': datetime.utcnow().isoformat(),
            'overall_sentiment': analysis_result['overall_sentiment'],
            'sentiment_score': analysis_result['sentiment_score'],
            'sentiment_scores': json.dumps(analysis_result['sentiment_results']),
            'issue_category': analysis_result.get('issue_category')
        }
        
        # Add aspect_sentiment if available
        if analysis_result.get('ontop_aspects'):
            update_data['aspect_sentiment'] = json.dumps(analysis_result['ontop_aspects'])
        
        result = supabase.table('zendesk_conversations')\
            .update(update_data)\
            .eq('ticket_id', ticket_id)\
            .execute()
        
        logger.info(f"✅ Updated ticket {ticket_id}: {analysis_result['overall_sentiment']} ({analysis_result['sentiment_score']})")
        
    except Exception as e:
        logger.error(f"❌ Error updating ticket {ticket_id}: {e}")

def process_tickets_batch(
    tickets: List[Dict],
    batch_size: int = 50,
    analyze_all: bool = False,
    all_clients: bool = False,
    external_only: bool = True
) -> Dict:
    """
    Process a batch of tickets.
    
    Args:
        tickets: List of ticket dicts
        batch_size: Maximum tickets to process
        analyze_all: Analyze all messages or just customer messages
        all_clients: Process all clients (not just target_accounts.json)
        external_only: Only process external tickets
        
    Returns:
        Dict with processing statistics
    """
    stats = {
        'processed': 0,
        'updated': 0,
        'errors': 0,
        'skipped': 0
    }
    
    processed_count = 0
    
    for ticket in tickets:
        if processed_count >= batch_size:
            break
        
        ticket_id = ticket.get('ticket_id')
        client_id = ticket.get('client_id')
        is_external = ticket.get('is_external', True)
        
        # Filtering
        if external_only and not is_external:
            stats['skipped'] += 1
            continue
        
        if not client_id:
            stats['skipped'] += 1
            continue
        
        # Check if already analyzed (unless re-analyzing)
        if ticket.get('sentiment_analyzed_at'):
            stats['skipped'] += 1
            continue
        
        try:
            # Process ticket
            analysis_result = process_ticket(ticket, analyze_all=analyze_all)
            
            if 'error' in analysis_result:
                stats['errors'] += 1
                continue
            
            # Update in database
            update_ticket_sentiment(ticket_id, analysis_result)
            
            stats['processed'] += 1
            stats['updated'] += 1
            processed_count += 1
            
            # Rate limiting for API calls (small delay between requests)
            import time
            time.sleep(0.5)  # 500ms delay to avoid API rate limits
            
        except Exception as e:
            logger.error(f"❌ Error processing ticket {ticket_id}: {e}")
            stats['errors'] += 1
    
    return stats

def main():
    """Main execution function."""
    parser = argparse.ArgumentParser(description='Analyze sentiment for Zendesk conversations')
    parser.add_argument('--batch-size', type=int, default=50, help='Number of tickets to process')
    parser.add_argument('--all-clients', action='store_true', help='Process all external tickets with client_id')
    parser.add_argument('--external-only', action='store_true', default=True, help='Only process external tickets')
    parser.add_argument('--re-analyze', action='store_true', help='Re-analyze already processed tickets')
    
    args = parser.parse_args()
    
    # Initialize
    try:
        initialize_supabase()
    except Exception as e:
        logger.error(f"❌ Failed to initialize: {e}")
        sys.exit(1)
    
    if not HUGGINGFACE_API_KEY:
        logger.error("❌ HUGGINGFACE_API_KEY not set in environment")
        sys.exit(1)
    
    logger.info("🚀 Starting sentiment analysis...")
    logger.info(f"   Batch size: {args.batch_size}")
    logger.info(f"   All clients: {args.all_clients}")
    logger.info(f"   External only: {args.external_only}")
    
    # Fetch tickets
    try:
        query = supabase.table('zendesk_conversations')\
            .select('*')\
            .not_.is_('conversation', 'null')\
            .order('created_at', desc=False)\
            .limit(args.batch_size * 2)  # Fetch more to account for filtering
        
        if args.external_only:
            query = query.eq('is_external', True)
        
        if not args.all_clients:
            query = query.not_.is_('client_id', 'null')
        
        if not args.re_analyze:
            query = query.is_('sentiment_analyzed_at', 'null')
        
        result = query.execute()
        tickets = result.data or []
        
        logger.info(f"📊 Fetched {len(tickets)} tickets from database")
        
    except Exception as e:
        logger.error(f"❌ Error fetching tickets: {e}")
        sys.exit(1)
    
    if not tickets:
        logger.info("✅ No tickets to process")
        return
    
    # Process tickets
    stats = process_tickets_batch(
        tickets,
        batch_size=args.batch_size,
        analyze_all=False,
        all_clients=args.all_clients,
        external_only=args.external_only
    )
    
    # Summary
    logger.info("="*60)
    logger.info("📊 Processing Summary")
    logger.info("="*60)
    logger.info(f"   Processed: {stats['processed']}")
    logger.info(f"   Updated: {stats['updated']}")
    logger.info(f"   Skipped: {stats['skipped']}")
    logger.info(f"   Errors: {stats['errors']}")
    logger.info("="*60)
    logger.info("✅ Sentiment analysis completed!")

if __name__ == '__main__':
    main()

