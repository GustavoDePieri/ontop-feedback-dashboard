"""
Sentiment Analysis for Zendesk Conversations - Filtered by Client List

This script processes conversations from Supabase for specific clients
defined in target_accounts.json and analyzes sentiment using the 
Hugging Face twitter-xlm-roberta-base-sentiment model.

Usage:
    python sentiment_analyzer_clients.py                    # Process 50 tickets from target clients
    python sentiment_analyzer_clients.py --batch-size 100   # Process 100 tickets
    python sentiment_analyzer_clients.py --test             # Test with first 2 clients only
    python sentiment_analyzer_clients.py --re-analyze       # Re-analyze already processed tickets
"""

import os
import sys
import json
import argparse
import logging
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
from dotenv import load_dotenv

# Import issue category extractor
try:
    from issue_category_extractor import (
        extract_issue_category, 
        extract_all_categories,
        extract_ontop_aspects,
        get_primary_ontop_aspect
    )
    ISSUE_CATEGORY_AVAILABLE = True
except ImportError:
    ISSUE_CATEGORY_AVAILABLE = False
    # Logger not initialized yet, will log later if needed

# Load environment variables
load_dotenv()

# Try to import required libraries
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

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")
MODEL_NAME = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
TARGET_ACCOUNTS_FILE = "target_accounts.json"

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================
# CLIENT LIST LOADING
# ============================================================
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
            logger.error(f"❌ File not found: {file_path}")
            logger.error(f"   Current directory: {os.getcwd()}")
            logger.error(f"   Please ensure {file_path} exists in the project root")
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
        logger.info(f"   First 5 clients: {client_ids[:5]}")
        
        return client_ids
    
    except json.JSONDecodeError as e:
        logger.error(f"❌ Invalid JSON in {file_path}: {e}")
        return []
    except Exception as e:
        logger.error(f"❌ Error loading {file_path}: {e}")
        return []

# ============================================================
# MODEL INITIALIZATION
# ============================================================
sentiment_task = None

def initialize_model():
    """Initialize the sentiment analysis model (load once, reuse)."""
    global sentiment_task
    
    if not TRANSFORMERS_AVAILABLE:
        raise ImportError("transformers library not available")
    
    if sentiment_task is None:
        logger.info(f"🔄 Loading sentiment model: {MODEL_NAME}")
        logger.info("   (First run will download ~500MB, subsequent runs are fast)")
        
        try:
            # Try loading tokenizer and model separately to avoid fast tokenizer issues
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
            
            logger.info("   Loading tokenizer and model...")
            tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_fast=False)
            model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
            
            sentiment_task = pipeline(
                "sentiment-analysis",
                model=model,
                tokenizer=tokenizer
            )
            
        except Exception as e:
            logger.error(f"❌ Error loading model: {e}")
            logger.info("   Trying alternative approach...")
            # Fallback: try with pipeline directly but force slow tokenizer
            from transformers import XLMRobertaTokenizer, XLMRobertaForSequenceClassification
            
            tokenizer = XLMRobertaTokenizer.from_pretrained(MODEL_NAME)
            model = XLMRobertaForSequenceClassification.from_pretrained(MODEL_NAME)
            
            sentiment_task = pipeline(
                "sentiment-analysis",
                model=model,
                tokenizer=tokenizer
            )
        
        logger.info("✅ Model loaded successfully")
    
    return sentiment_task

# ============================================================
# TEXT PREPROCESSING
# ============================================================
def preprocess_text(text: str) -> str:
    """
    Preprocess text for sentiment analysis.
    Replaces @mentions and URLs as per model documentation.
    """
    if not text:
        return ""
    
    new_text = []
    for t in text.split(" "):
        # Replace @mentions with @user
        if t.startswith('@') and len(t) > 1:
            t = '@user'
        # Replace URLs with http
        elif t.startswith('http'):
            t = 'http'
        new_text.append(t)
    
    return " ".join(new_text)

# ============================================================
# SENTIMENT ANALYSIS FUNCTIONS
# ============================================================
def analyze_message(message_text: str) -> Optional[Dict]:
    """
    Analyze sentiment of a single message.
    
    Args:
        message_text: The text to analyze
        
    Returns:
        Dict with 'label' (Positive/Neutral/Negative) and 'score' (0.0-1.0)
        Returns None if message is empty or invalid
    """
    if not message_text or len(message_text.strip()) == 0:
        return None
    
    try:
        # Preprocess text
        cleaned_text = preprocess_text(message_text)
        
        if not cleaned_text or len(cleaned_text.strip()) == 0:
            return None
        
        # Run sentiment analysis
        result = sentiment_task(cleaned_text)[0]
        
        # Map model labels to our labels (capitalize for consistency)
        # The model returns lowercase: 'positive', 'negative', 'neutral'
        # Or sometimes: LABEL_0=Negative, LABEL_1=Neutral, LABEL_2=Positive
        original_label = result['label']
        
        # Normalize to title case
        label_lower = original_label.lower()
        if 'label_0' in label_lower or 'negative' in label_lower:
            mapped_label = 'Negative'
        elif 'label_1' in label_lower or 'neutral' in label_lower:
            mapped_label = 'Neutral'
        elif 'label_2' in label_lower or 'positive' in label_lower:
            mapped_label = 'Positive'
        else:
            # Default to Neutral if unknown
            mapped_label = 'Neutral'
        
        return {
            'label': mapped_label,
            'score': round(result['score'], 4),  # Confidence score 0.0-1.0
            'original_label': original_label  # Keep original for debugging
        }
    except Exception as e:
        logger.warning(f"Error analyzing message: {e}")
        return None

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
        Tuple of (adjusted_sentiment_label, adjusted_score)
    """
    adjusted_sentiment = overall_sentiment
    adjusted_score = sentiment_score
    
    # Collect conversation text for keyword detection
    conversation_text = ' '.join([
        msg.get('message_text', '') or msg.get('body', '')
        for msg in conversation
    ]).lower()
    
    # Rule 1: Billing/Payment issues are negative
    negative_indicators = [
        'refund', 'reembolso', 'reembolsen', 'reembolsar', 'reimbursement', 
        'billing error', 'overcharge', 'wrong charge', 'incorrect charge', 
        'billing problem', 'payment issue', 'charged incorrectly', 
        'cobro incorrecto', 'cargo incorrecto', 'se cargo', 'se cobro',
        'reembolsen estos fondos', 'reembolso de', 'reembolsar fondos',
        'cargo a nuestra tarjeta', 'cobro a nuestra tarjeta'
    ]
    
    has_negative_indicator = any(indicator in conversation_text for indicator in negative_indicators)
    
    # Rule 2: High confidence in payments/card_wallet aspects with issues
    payments_issue = ontop_aspects.get('payments', 0) > 0.5
    card_wallet_issue = ontop_aspects.get('card_wallet', 0) > 0.5
    
    # Rule 3: Issue category indicates problem
    problem_categories = ['payment', 'refund', 'billing', 'complaint']
    is_problem_category = issue_category and issue_category.lower() in problem_categories
    
    # Rule 4: Technical/access support tickets (polite requests for help)
    # These should be neutral, not highly negative
    technical_keywords = ['error', 'bug', 'not working', 'can\'t', 'cannot', 'issue', 'problem']
    polite_indicators = ['consulta', 'pregunta', 'question', 'help', 'ayuda', 'support', 
                        'hola', 'buenas', 'please', 'por favor', 'gracias', 'thank you']
    is_technical_issue = issue_category and issue_category.lower() in ['technical', 'account']
    has_polite_language = any(indicator in conversation_text for indicator in polite_indicators)
    has_technical_keyword = any(keyword in conversation_text for keyword in technical_keywords)
    
    # If it's a polite technical support request, don't make it highly negative
    if is_technical_issue and has_polite_language and has_technical_keyword:
        # It's a polite request for help, not a complaint
        if adjusted_sentiment == 'negative' and adjusted_score < -0.5:
            # Adjust to neutral or slightly negative
            adjusted_sentiment = 'neutral'
            adjusted_score = max(adjusted_score, -0.2)  # Cap at -0.2 (slightly negative)
        elif adjusted_score < -0.7:
            # Very negative scores for polite tech support should be less negative
            adjusted_score = max(adjusted_score, -0.3)
    
    # Apply adjustments for billing issues
    if has_negative_indicator or (payments_issue and is_problem_category):
        # Force negative sentiment for billing issues
        if adjusted_sentiment == 'positive':
            adjusted_sentiment = 'negative'
            adjusted_score = min(adjusted_score, -0.3)  # Cap at -0.3 minimum
        elif adjusted_sentiment == 'neutral':
            adjusted_sentiment = 'negative'
            adjusted_score = -0.2
    
    if card_wallet_issue and adjusted_score > 0:
        # Card/wallet issues are typically negative
        adjusted_score = max(adjusted_score - 0.2, -0.5)
        if adjusted_score < 0:
            adjusted_sentiment = 'negative'
    
    return adjusted_sentiment, round(adjusted_score, 4)


def calculate_aspect_sentiment(
    sentiment_results: List[Dict],
    ontop_aspects: Dict[str, float],
    conversation: List[Dict]
) -> Dict[str, float]:
    """
    Calculate sentiment score per Ontop aspect.
    
    Args:
        sentiment_results: List of sentiment analysis results
        ontop_aspects: Dict of detected aspects with confidence scores
        conversation: Full conversation for context
        
    Returns:
        Dict mapping aspect names to sentiment scores (-1.0 to 1.0)
    """
    if not ontop_aspects:
        return {}
    
    # Get overall sentiment score
    overall_score = calculate_numerical_sentiment_score(sentiment_results)
    
    # Collect conversation text
    conversation_text = ' '.join([
        msg.get('message_text', '') or msg.get('body', '')
        for msg in conversation
    ]).lower()
    
    aspect_sentiment = {}
    
    # For each detected aspect, calculate its sentiment
    for aspect, aspect_confidence in ontop_aspects.items():
        if aspect_confidence < 0.3:  # Skip low-confidence aspects
            continue
        
        # Start with overall sentiment
        aspect_score = overall_score
        
        # Adjust based on aspect-specific keywords
        if aspect == 'payments':
            # Payment-related negative indicators
            payment_negative = ['refund', 'reembolso', 'overcharge', 'wrong charge', 'billing error']
            if any(ind in conversation_text for ind in payment_negative):
                aspect_score = min(aspect_score, -0.4)
        elif aspect == 'card_wallet':
            # Card/wallet issues are typically negative
            card_negative = ['declined', 'blocked', 'not working', 'error', 'issue']
            if any(ind in conversation_text for ind in card_negative):
                aspect_score = min(aspect_score, -0.3)
        elif aspect == 'contracts':
            # Contract issues can be neutral or slightly negative
            contract_negative = ['problem', 'issue', 'error', 'wrong']
            if any(ind in conversation_text for ind in contract_negative):
                aspect_score = min(aspect_score, -0.1)
        
        aspect_sentiment[aspect] = round(aspect_score, 4)
    
    return aspect_sentiment


def calculate_overall_sentiment(sentiment_results: List[Dict]) -> str:
    """
    Calculate aggregate sentiment for the ticket.
    Uses weighted scoring to avoid too many "mixed" results.
    
    Returns:
        'positive', 'negative', 'neutral', 'mixed', or 'no_customer_messages'
    """
    if not sentiment_results:
        return 'no_customer_messages'
    
    labels = [r['sentiment']['label'] for r in sentiment_results]
    scores = [r['sentiment']['score'] for r in sentiment_results]
    
    positive_count = labels.count('Positive')
    negative_count = labels.count('Negative')
    neutral_count = labels.count('Neutral')
    
    total = len(labels)
    
    # Calculate weighted scores (weight by confidence)
    positive_weighted = sum(scores[i] for i, label in enumerate(labels) if label == 'Positive')
    negative_weighted = sum(scores[i] for i, label in enumerate(labels) if label == 'Negative')
    neutral_weighted = sum(scores[i] for i, label in enumerate(labels) if label == 'Neutral')
    
    # Use majority rule with weighted scores
    # If one sentiment has >50% of messages AND highest weighted score, use that
    if positive_count / total >= 0.5 and positive_weighted >= max(negative_weighted, neutral_weighted):
        return 'positive'
    elif negative_count / total >= 0.5 and negative_weighted >= max(positive_weighted, neutral_weighted):
        return 'negative'
    elif neutral_count / total >= 0.5 and neutral_weighted >= max(positive_weighted, negative_weighted):
        return 'neutral'
    # If no clear majority, use weighted scores
    elif positive_weighted > negative_weighted and positive_weighted > neutral_weighted:
        return 'positive'
    elif negative_weighted > positive_weighted and negative_weighted > neutral_weighted:
        return 'negative'
    elif neutral_weighted > positive_weighted and neutral_weighted > negative_weighted:
        return 'neutral'
    else:
        return 'mixed'

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

def get_tickets_all_clients(
    limit: int = 50, 
    re_analyze: bool = False,
    is_external: Optional[bool] = None
) -> List[Dict]:
    """
    Get tickets for ALL clients (not filtered by target list).
    Filters by: is_external and client_id IS NOT NULL.
    
    Args:
        limit: Maximum number of tickets to fetch
        re_analyze: If True, include already analyzed tickets
        is_external: If True, only external tickets. If False, only internal. If None, all tickets.
        
    Returns:
        List of ticket dicts with ticket_id, client_id, and conversation
    """
    try:
        query = supabase.table('zendesk_conversations')\
            .select('ticket_id, client_id, conversation, sentiment_analyzed_at, is_external')\
            .not_.is_('conversation', 'null')\
            .not_.is_('client_id', 'null')
        
        # Filter by is_external if specified
        if is_external is not None:
            query = query.eq('is_external', is_external)
        
        # Only get unanalyzed tickets unless re_analyze=True
        if not re_analyze:
            query = query.is_('sentiment_analyzed_at', 'null')
        
        result = query.limit(limit).execute()
        
        return result.data or []
    
    except Exception as e:
        logger.error(f"Error fetching tickets: {e}")
        return []


def get_tickets_by_clients(
    client_ids: List[str], 
    limit: int = 50, 
    re_analyze: bool = False,
    is_external: Optional[bool] = None
) -> List[Dict]:
    """
    Get tickets for specific clients that need sentiment analysis.
    
    Args:
        client_ids: List of client IDs to filter by
        limit: Maximum number of tickets to fetch
        re_analyze: If True, include already analyzed tickets
        is_external: If True, only external tickets. If False, only internal. If None, all tickets.
        
    Returns:
        List of ticket dicts with ticket_id, client_id, and conversation
    """
    try:
        query = supabase.table('zendesk_conversations')\
            .select('ticket_id, client_id, conversation, sentiment_analyzed_at, is_external')\
            .in_('client_id', client_ids)\
            .not_.is_('conversation', 'null')
        
        # Filter by is_external if specified
        if is_external is not None:
            query = query.eq('is_external', is_external)
        
        # Only get unanalyzed tickets unless re_analyze=True
        if not re_analyze:
            query = query.is_('sentiment_analyzed_at', 'null')
        
        result = query.limit(limit).execute()
        
        return result.data or []
    
    except Exception as e:
        logger.error(f"Error fetching tickets by clients: {e}")
        return []

def get_ticket_count_by_clients(
    client_ids: List[str], 
    re_analyze: bool = False,
    is_external: Optional[bool] = None
) -> Dict:
    """
    Get statistics about tickets for the client list.
    
    Args:
        client_ids: List of client IDs
        re_analyze: If True, include already analyzed tickets
        is_external: If True, only external tickets. If False, only internal. If None, all tickets.
    
    Returns:
        Dict with total_count, unanalyzed_count, analyzed_count
    """
    try:
        # Build base query
        base_query = supabase.table('zendesk_conversations')\
            .select('ticket_id', count='exact')\
            .in_('client_id', client_ids)\
            .not_.is_('conversation', 'null')
        
        # Filter by is_external if specified
        if is_external is not None:
            base_query = base_query.eq('is_external', is_external)
        
        # Total tickets for these clients
        total_result = base_query.execute()
        total_count = total_result.count or 0
        
        # Unanalyzed tickets
        unanalyzed_query = supabase.table('zendesk_conversations')\
            .select('ticket_id', count='exact')\
            .in_('client_id', client_ids)\
            .is_('sentiment_analyzed_at', 'null')\
            .not_.is_('conversation', 'null')
        
        if is_external is not None:
            unanalyzed_query = unanalyzed_query.eq('is_external', is_external)
        
        unanalyzed_result = unanalyzed_query.execute()
        unanalyzed_count = unanalyzed_result.count or 0
        analyzed_count = total_count - unanalyzed_count
        
        return {
            'total_count': total_count,
            'unanalyzed_count': unanalyzed_count,
            'analyzed_count': analyzed_count
        }
    
    except Exception as e:
        logger.error(f"Error getting ticket counts: {e}")
        return {
            'total_count': 0,
            'unanalyzed_count': 0,
            'analyzed_count': 0
        }

def update_ticket_sentiment(
    ticket_id: int, 
    overall_sentiment: str, 
    sentiment_scores: List[Dict], 
    issue_category: Optional[str] = None,
    sentiment_score: Optional[float] = None,
    aspect_sentiment: Optional[Dict[str, float]] = None
) -> bool:
    """
    Update ticket with sentiment analysis results, issue category, numerical score, and aspect sentiment.
    
    Args:
        ticket_id: The ticket ID
        overall_sentiment: Aggregate sentiment label
        sentiment_scores: List of per-message sentiment results
        issue_category: Extracted issue category (optional)
        sentiment_score: Numerical sentiment score from -1.0 to 1.0 (optional)
        aspect_sentiment: Dict of aspect sentiment scores (optional)
        
    Returns:
        True if successful, False otherwise
    """
    try:
        update_data = {
            'sentiment_analyzed_at': datetime.utcnow().isoformat(),
            'overall_sentiment': overall_sentiment,
            'sentiment_scores': sentiment_scores
        }
        
        # Add issue category if available
        if issue_category:
            update_data['issue_category'] = issue_category
        
        # Add numerical sentiment score if available
        if sentiment_score is not None:
            update_data['sentiment_score'] = float(sentiment_score)
        
        # Add aspect sentiment if available
        if aspect_sentiment:
            update_data['aspect_sentiment'] = aspect_sentiment
        
        supabase.table('zendesk_conversations')\
            .update(update_data)\
            .eq('ticket_id', ticket_id)\
            .execute()
        
        return True
    except Exception as e:
        logger.error(f"Error updating ticket {ticket_id}: {e}")
        return False

# ============================================================
# MAIN PROCESSING FUNCTIONS
# ============================================================
def process_ticket_sentiment(ticket_id: int, conversation: List[Dict], analyze_all: bool = False) -> Dict:
    """
    Process a single ticket's conversation for sentiment, issue category, and Ontop aspects.
    
    Args:
        ticket_id: The ticket ID
        conversation: List of messages from the conversation JSONB
        analyze_all: Whether to analyze all messages or just customer messages
        
    Returns:
        Dict with processing results
    """
    # Analyze conversation
    sentiment_results = analyze_conversation(conversation, analyze_all=analyze_all)
    
    # Calculate base overall sentiment
    overall = calculate_overall_sentiment(sentiment_results)
    
    # Calculate numerical sentiment score
    sentiment_score = calculate_numerical_sentiment_score(sentiment_results)
    
    # Extract issue category
    issue_category = None
    if ISSUE_CATEGORY_AVAILABLE:
        issue_category = extract_issue_category(conversation, analyze_all=analyze_all)
    
    # Extract Ontop-specific aspects
    ontop_aspects = {}
    aspect_sentiment = {}
    if ISSUE_CATEGORY_AVAILABLE:
        ontop_aspects = extract_ontop_aspects(conversation, analyze_all=analyze_all)
        aspect_sentiment = calculate_aspect_sentiment(sentiment_results, ontop_aspects, conversation)
    
    # Apply business-aware sentiment adjustments
    overall, sentiment_score = apply_business_aware_sentiment(
        overall, sentiment_score, issue_category, ontop_aspects, conversation
    )
    
    # Update database
    success = update_ticket_sentiment(
        ticket_id, 
        overall, 
        sentiment_results, 
        issue_category=issue_category,
        sentiment_score=sentiment_score,
        aspect_sentiment=aspect_sentiment if aspect_sentiment else None
    )
    
    return {
        'ticket_id': ticket_id,
        'success': success,
        'messages_analyzed': len(sentiment_results),
        'overall_sentiment': overall,
        'sentiment_score': sentiment_score,
        'issue_category': issue_category,
        'aspect_sentiment': aspect_sentiment,
        'positive_count': sum(1 for r in sentiment_results if r['sentiment']['label'] == 'Positive'),
        'negative_count': sum(1 for r in sentiment_results if r['sentiment']['label'] == 'Negative'),
        'neutral_count': sum(1 for r in sentiment_results if r['sentiment']['label'] == 'Neutral')
    }

def run_sentiment_analysis_all_clients(
    batch_size: int = 50,
    analyze_all: bool = False,
    re_analyze: bool = False,
    is_external: Optional[bool] = True  # Default to external only
):
    """
    Process sentiment analysis for ALL external tickets with client_id.
    Not filtered by target_accounts.json.
    
    Args:
        batch_size: Number of tickets to process
        analyze_all: Whether to analyze all messages or just customer messages
        re_analyze: If True, re-analyze already processed tickets
        is_external: If True, only external tickets. If False, only internal. If None, all tickets.
    """
    logger.info("="*80)
    logger.info("STARTING SENTIMENT ANALYSIS - ALL CLIENTS")
    logger.info("="*80)
    
    logger.info("\n📋 Processing ALL external tickets with client_id")
    logger.info("   Filter: is_external = true, client_id IS NOT NULL")
    
    # Log filter settings
    if is_external is not None:
        filter_type = "external" if is_external else "internal"
        logger.info(f"🔍 Filter: Only {filter_type} tickets (is_external={is_external})")
    else:
        logger.info(f"🔍 Filter: All tickets (external + internal)")
    
    # Initialize
    initialize_model()
    initialize_supabase()
    
    # Get statistics
    base_query = supabase.table('zendesk_conversations')\
        .select('ticket_id', count='exact')\
        .not_.is_('conversation', 'null')\
        .not_.is_('client_id', 'null')
    
    if is_external is not None:
        base_query = base_query.eq('is_external', is_external)
    
    total_result = base_query.execute()
    total_count = total_result.count or 0
    
    unanalyzed_query = supabase.table('zendesk_conversations')\
        .select('ticket_id', count='exact')\
        .not_.is_('conversation', 'null')\
        .not_.is_('client_id', 'null')\
        .is_('sentiment_analyzed_at', 'null')
    
    if is_external is not None:
        unanalyzed_query = unanalyzed_query.eq('is_external', is_external)
    
    unanalyzed_result = unanalyzed_query.execute()
    unanalyzed_count = unanalyzed_result.count or 0
    analyzed_count = total_count - unanalyzed_count
    
    logger.info(f"\n📊 Ticket Statistics:")
    logger.info(f"   Total tickets: {total_count}")
    logger.info(f"   Already analyzed: {analyzed_count}")
    logger.info(f"   Need analysis: {unanalyzed_count}")
    
    if not re_analyze and unanalyzed_count == 0:
        logger.info("\n✅ All tickets have been analyzed!")
        logger.info("   Use --re-analyze to re-process them")
        return
    
    # Get tickets
    logger.info(f"\n🔍 Fetching up to {batch_size} tickets...")
    tickets = get_tickets_all_clients(limit=batch_size, re_analyze=re_analyze, is_external=is_external)
    
    if not tickets:
        logger.info("✅ No tickets found matching the criteria")
        return
    
    logger.info(f"✅ Found {len(tickets)} tickets to process\n")
    
    # Process tickets
    success = 0
    failed = 0
    client_summary = {}
    
    for i, ticket in enumerate(tickets, 1):
        ticket_id = ticket.get('ticket_id')
        client_id = ticket.get('client_id', 'Unknown')
        conversation = ticket.get('conversation', [])
        
        logger.info(f"[{i}/{len(tickets)}] Processing ticket #{ticket_id} (Client: {client_id})...")
        
        try:
            result = process_ticket_sentiment(ticket_id, conversation, analyze_all=analyze_all)
            
            if result['success']:
                category_info = f" [{result.get('issue_category', 'N/A')}]" if result.get('issue_category') else ""
                logger.info(
                    f"  ✅ {result['overall_sentiment']}{category_info} "
                    f"({result['messages_analyzed']} messages: "
                    f"+{result['positive_count']} / "
                    f"-{result['negative_count']} / "
                    f"~{result['neutral_count']})"
                )
                success += 1
                
                # Track by client
                if client_id not in client_summary:
                    client_summary[client_id] = {'total': 0, 'positive': 0, 'negative': 0, 'neutral': 0, 'mixed': 0}
                client_summary[client_id]['total'] += 1
                sentiment_key = result['overall_sentiment'].replace('mostly_', '')
                if sentiment_key in client_summary[client_id]:
                    client_summary[client_id][sentiment_key] += 1
            else:
                logger.warning(f"  ⚠️  Failed to update database")
                failed += 1
        except Exception as e:
            logger.error(f"  ❌ Error processing ticket {ticket_id}: {e}")
            failed += 1
    
    # Summary
    logger.info("="*80)
    logger.info(f"✅ ANALYSIS COMPLETED")
    logger.info(f"   Processed: {success}")
    logger.info(f"   Failed: {failed}")
    logger.info(f"   Success Rate: {(success/(success+failed)*100) if (success+failed) > 0 else 0:.1f}%")
    
    if client_summary:
        logger.info(f"\n📊 Summary by Client:")
        for client_id, summary in sorted(client_summary.items()):
            logger.info(f"   {client_id}: {summary['total']} tickets (+{summary['positive']} / -{summary['negative']} / ~{summary['neutral']} / ?{summary['mixed']})")
    logger.info("="*80)


def run_sentiment_analysis_for_clients(
    batch_size: int = 50, 
    analyze_all: bool = False,
    test_mode: bool = False,
    re_analyze: bool = False,
    clients_file: str = TARGET_ACCOUNTS_FILE,
    is_external: Optional[bool] = None
):
    """
    Main function to process tickets for target clients.
    
    Args:
        batch_size: Number of tickets to process
        analyze_all: Whether to analyze all messages or just customer messages
        test_mode: If True, only use first 2 clients for testing
        re_analyze: If True, re-analyze already processed tickets
        clients_file: Path to the client list JSON file
        is_external: If True, only process external tickets. If False, only internal. If None, all tickets.
    """
    logger.info("="*80)
    logger.info("STARTING SENTIMENT ANALYSIS - CLIENT FILTERED")
    logger.info("="*80)
    
    # Load client list
    client_ids = load_client_list(clients_file)
    
    if not client_ids:
        logger.error("❌ No client IDs loaded. Exiting.")
        return
    
    # Test mode: only use first 2 clients
    if test_mode:
        logger.info("🧪 TEST MODE: Using only first 2 clients")
        client_ids = client_ids[:2]
    
    logger.info(f"\n📋 Processing tickets for {len(client_ids)} clients")
    if test_mode:
        logger.info(f"   Test mode: {client_ids}")
    
    # Log filter settings
    if is_external is not None:
        filter_type = "external" if is_external else "internal"
        logger.info(f"🔍 Filter: Only {filter_type} tickets (is_external={is_external})")
    else:
        logger.info(f"🔍 Filter: All tickets (external + internal)")
    
    # Initialize
    initialize_model()
    initialize_supabase()
    
    # Get statistics
    stats = get_ticket_count_by_clients(client_ids, re_analyze=re_analyze, is_external=is_external)
    logger.info(f"\n📊 Ticket Statistics:")
    logger.info(f"   Total tickets: {stats['total_count']}")
    logger.info(f"   Already analyzed: {stats['analyzed_count']}")
    logger.info(f"   Need analysis: {stats['unanalyzed_count']}")
    
    if not re_analyze and stats['unanalyzed_count'] == 0:
        logger.info("\n✅ All tickets for these clients have been analyzed!")
        logger.info("   Use --re-analyze to re-process them")
        return
    
    # Get tickets
    logger.info(f"\n🔍 Fetching up to {batch_size} tickets...")
    tickets = get_tickets_by_clients(client_ids, limit=batch_size, re_analyze=re_analyze, is_external=is_external)
    
    if not tickets:
        logger.info("✅ No tickets found matching the criteria")
        return
        logger.info("✅ No tickets found for these clients")
        return
    
    logger.info(f"✅ Found {len(tickets)} tickets to process\n")
    
    # Process each ticket
    processed = 0
    failed = 0
    client_summary = {}
    
    for i, ticket in enumerate(tickets, 1):
        ticket_id = ticket['ticket_id']
        client_id = ticket.get('client_id', 'Unknown')
        conversation = ticket.get('conversation', [])
        
        logger.info(f"[{i}/{len(tickets)}] Processing ticket #{ticket_id} (Client: {client_id})...")
        
        try:
            result = process_ticket_sentiment(ticket_id, conversation, analyze_all=analyze_all)
            
            if result['success']:
                category_info = f" [{result.get('issue_category', 'N/A')}]" if result.get('issue_category') else ""
                logger.info(
                    f"  ✅ {result['overall_sentiment']}{category_info} "
                    f"({result['messages_analyzed']} messages: "
                    f"+{result['positive_count']} / "
                    f"-{result['negative_count']} / "
                    f"~{result['neutral_count']})"
                )
                processed += 1
                
                # Track by client
                if client_id not in client_summary:
                    client_summary[client_id] = {'total': 0, 'positive': 0, 'negative': 0, 'neutral': 0, 'mixed': 0}
                client_summary[client_id]['total'] += 1
                sentiment_key = result['overall_sentiment'].replace('mostly_', '')
                if sentiment_key in client_summary[client_id]:
                    client_summary[client_id][sentiment_key] += 1
            else:
                logger.warning(f"  ⚠️  Failed to update database")
                failed += 1
        except Exception as e:
            logger.error(f"  ❌ Error processing ticket {ticket_id}: {e}")
            failed += 1
    
    # Summary
    logger.info("="*80)
    logger.info(f"✅ ANALYSIS COMPLETED")
    logger.info(f"   Processed: {processed}")
    logger.info(f"   Failed: {failed}")
    logger.info(f"   Success Rate: {processed/(processed+failed)*100:.1f}%" if (processed+failed) > 0 else "N/A")
    
    if client_summary:
        logger.info(f"\n📊 Summary by Client:")
        for client_id, summary in sorted(client_summary.items()):
            logger.info(f"   {client_id}: {summary['total']} tickets "
                       f"(+{summary.get('positive', 0)} / -{summary.get('negative', 0)} / "
                       f"~{summary.get('neutral', 0)} / ?{summary.get('mixed', 0)})")
    
    logger.info("="*80)

# ============================================================
# MAIN EXECUTION
# ============================================================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='Sentiment Analysis for Zendesk Conversations - Filtered by Client List',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Test with first 2 clients, 10 tickets
  python sentiment_analyzer_clients.py --test --batch-size 10
  
  # Process 50 tickets from all target clients
  python sentiment_analyzer_clients.py --batch-size 50
  
  # Re-analyze already processed tickets
  python sentiment_analyzer_clients.py --re-analyze --batch-size 20
        """
    )
    parser.add_argument('--batch-size', type=int, default=50,
                       help='Number of tickets to process (default: 50)')
    parser.add_argument('--analyze-all', action='store_true',
                       help='Analyze all messages (default: only customer messages)')
    parser.add_argument('--test', action='store_true',
                       help='Test mode: only use first 2 clients from target_accounts.json')
    parser.add_argument('--re-analyze', action='store_true',
                       help='Re-analyze tickets that were already processed')
    parser.add_argument('--clients-file', type=str, default=TARGET_ACCOUNTS_FILE,
                       help=f'Path to client list JSON file (default: {TARGET_ACCOUNTS_FILE})')
    parser.add_argument('--external-only', action='store_true',
                       help='Only process external tickets (is_external=true)')
    parser.add_argument('--internal-only', action='store_true',
                       help='Only process internal tickets (is_external=false)')
    parser.add_argument('--all-clients', action='store_true',
                       help='Process ALL clients (not just target_accounts.json). Filters: is_external=true, client_id IS NOT NULL')
    
    args = parser.parse_args()
    
    # Determine is_external filter
    if args.external_only and args.internal_only:
        logger.error("❌ Cannot use both --external-only and --internal-only")
        sys.exit(1)
    
    is_external = None
    if args.external_only:
        is_external = True
    elif args.internal_only:
        is_external = False
    
    # If --all-clients is set, process all external tickets with client_id
    if args.all_clients:
        try:
            run_sentiment_analysis_all_clients(
                batch_size=args.batch_size,
                analyze_all=args.analyze_all,
                re_analyze=args.re_analyze,
                is_external=is_external if is_external is not None else True  # Default to external
            )
        except KeyboardInterrupt:
            logger.info("\n⚠️  Interrupted by user")
            sys.exit(1)
        except Exception as e:
            logger.error(f"❌ Fatal error: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
    else:
        try:
            run_sentiment_analysis_for_clients(
                batch_size=args.batch_size,
                analyze_all=args.analyze_all,
                test_mode=args.test,
                re_analyze=args.re_analyze,
                clients_file=args.clients_file,
                is_external=is_external
            )
        except KeyboardInterrupt:
            logger.info("\n⚠️  Interrupted by user")
            sys.exit(1)
        except Exception as e:
            logger.error(f"❌ Fatal error: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

