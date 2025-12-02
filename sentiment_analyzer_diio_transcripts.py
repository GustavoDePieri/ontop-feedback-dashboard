"""
Sentiment Analysis for DIIO Transcripts

This script processes meeting transcripts from Supabase (diio_transcripts table)
and analyzes sentiment using the Hugging Face twitter-xlm-roberta-base-sentiment model.
The model runs locally on your machine.

The script:
- Downloads the Roberta model locally (first run only)
- Analyzes all transcripts in diio_transcripts table
- Updates sentiment (positive/neutral/negative) and sentiment_score columns

Usage:
    python sentiment_analyzer_diio_transcripts.py                    # Process 50 transcripts
    python sentiment_analyzer_diio_transcripts.py --batch-size 100  # Process 100 transcripts
    python sentiment_analyzer_diio_transcripts.py --re-analyze      # Re-analyze already processed transcripts
    python sentiment_analyzer_diio_transcripts.py --all              # Process ALL transcripts without limit
"""

import os
import sys
import argparse
import logging
from datetime import datetime
from typing import Optional, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try to import required libraries
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
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
SUPABASE_URL = os.getenv("NUXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("NUXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY")
MODEL_NAME = "cardiffnlp/twitter-xlm-roberta-base-sentiment"

    # Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Enable debug logging for first few transcripts to see label mapping
DEBUG_LABELS = False  # Set to True to see raw model labels

# ============================================================
# MODEL INITIALIZATION
# ============================================================
sentiment_task = None

def initialize_model():
    """Initialize the sentiment analysis model (load once, reuse)."""
    global sentiment_task
    
    if not TRANSFORMERS_AVAILABLE:
        raise ImportError("transformers library not available. Install with: pip install transformers torch scipy")
    
    if sentiment_task is None:
        logger.info(f"🔄 Loading sentiment model: {MODEL_NAME}")
        logger.info("   (First run will download ~500MB to your machine, subsequent runs are fast)")
        logger.info("   Model will be cached locally for future use")
        
        try:
            # Load tokenizer and model separately
            logger.info("   Loading tokenizer and model...")
            tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_fast=False)
            model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
            
            sentiment_task = pipeline(
                "sentiment-analysis",
                model=model,
                tokenizer=tokenizer
            )
            
            logger.info("✅ Model loaded successfully and cached locally")
        
        except Exception as e:
            logger.error(f"❌ Error loading model: {e}")
            logger.info("   Trying alternative approach...")
            # Fallback: try with XLMRoberta classes directly
            try:
                from transformers import XLMRobertaTokenizer, XLMRobertaForSequenceClassification
                
                tokenizer = XLMRobertaTokenizer.from_pretrained(MODEL_NAME)
                model = XLMRobertaForSequenceClassification.from_pretrained(MODEL_NAME)
                
                sentiment_task = pipeline(
                    "sentiment-analysis",
                    model=model,
                    tokenizer=tokenizer
                )
                
                logger.info("✅ Model loaded successfully (fallback method)")
            except Exception as e2:
                logger.error(f"❌ Failed to load model with fallback: {e2}")
                raise
    
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
def analyze_transcript(transcript_text: str) -> Optional[Dict]:
    """
    Analyze sentiment of a transcript.
    
    Args:
        transcript_text: The transcript text to analyze
        
    Returns:
        Dict with 'label' (Positive/Neutral/Negative) and 'score' (0.0-1.0)
        Returns None if transcript is empty or invalid
    """
    if not transcript_text or len(transcript_text.strip()) == 0:
        return None
    
    try:
        # Preprocess text
        cleaned_text = preprocess_text(transcript_text)
        
        if not cleaned_text or len(cleaned_text.strip()) == 0:
            return None
        
        # Get the tokenizer to properly handle truncation
        # Roberta model has max_length of 512 tokens
        max_tokens = 512
        tokenizer = sentiment_task.tokenizer
        
        # Check if text needs truncation
        # Tokenize without truncation to check length
        full_tokens = tokenizer.encode(cleaned_text, truncation=False, add_special_tokens=False)
        is_long = len(full_tokens) > max_tokens
        
        if is_long:
            # Text is too long, analyze in chunks
            logger.debug(f"   Transcript is long ({len(full_tokens)} tokens), analyzing in chunks...")
            
            # Split into chunks using tokenizer
            chunk_results = []
            chunk_size = max_tokens - 10  # Leave room for special tokens
            
            # Process in chunks
            for i in range(0, len(full_tokens), chunk_size):
                chunk_tokens = full_tokens[i:i + chunk_size]
                # Decode chunk back to text for analysis
                chunk_text = tokenizer.decode(chunk_tokens, skip_special_tokens=True)
                
                if chunk_text.strip():
                    try:
                        # Analyze chunk (pipeline will handle truncation if needed)
                        result = sentiment_task(chunk_text)[0]
                        chunk_results.append(result)
                    except Exception as e:
                        logger.debug(f"   Error analyzing chunk {i//chunk_size + 1}: {e}")
                        continue
            
            # Aggregate results (weighted average)
            if not chunk_results:
                return None
            
            # Calculate weighted average
            label_scores = {'Positive': 0.0, 'Negative': 0.0, 'Neutral': 0.0}
            total_score = 0.0
            
            for result in chunk_results:
                original_label = result['label']
                score = result['score']
                
                # Map to our labels
                label_lower = str(original_label).lower()
                if 'label_0' in label_lower or 'negative' in label_lower:
                    mapped_label = 'Negative'
                elif 'label_1' in label_lower or 'neutral' in label_lower:
                    mapped_label = 'Neutral'
                elif 'label_2' in label_lower or 'positive' in label_lower:
                    mapped_label = 'Positive'
                else:
                    logger.warning(f"   Unknown chunk label format: {original_label}, defaulting to Neutral")
                    mapped_label = 'Neutral'
                
                label_scores[mapped_label] += score
                total_score += score
            
            # Get the label with highest weighted score
            best_label = max(label_scores, key=label_scores.get)
            best_score = label_scores[best_label] / total_score if total_score > 0 else 0.0
            
            return {
                'label': best_label,
                'score': round(best_score, 4),
                'original_label': f'aggregated_from_{len(chunk_results)}_chunks'
            }
        else:
            # Short transcript, analyze directly
            # Truncate text properly using tokenizer to ensure it fits
            truncated_tokens = tokenizer.encode(cleaned_text, max_length=max_tokens, truncation=True, add_special_tokens=False)
            truncated_text = tokenizer.decode(truncated_tokens, skip_special_tokens=True)
            
            result = sentiment_task(truncated_text)[0]
            
            # Map model labels to our labels
            # The twitter-xlm-roberta-base-sentiment model returns:
            # - LABEL_0 = Negative
            # - LABEL_1 = Neutral  
            # - LABEL_2 = Positive
            original_label = result['label']
            label_lower = str(original_label).lower()
            
            # Debug: log the original label to see what we're getting
            if DEBUG_LABELS:
                logger.info(f"   Model returned label: {original_label} (type: {type(original_label)}), score: {result['score']}")
            
            if 'label_0' in label_lower or 'negative' in label_lower:
                mapped_label = 'Negative'
            elif 'label_1' in label_lower or 'neutral' in label_lower:
                mapped_label = 'Neutral'
            elif 'label_2' in label_lower or 'positive' in label_lower:
                mapped_label = 'Positive'
            else:
                # Default fallback - check the actual label string
                logger.warning(f"   Unknown label format: {original_label}, defaulting to Neutral")
                mapped_label = 'Neutral'
            
            return {
                'label': mapped_label,
                'score': round(result['score'], 4),
                'original_label': original_label
            }
    
    except Exception as e:
        logger.warning(f"Error analyzing transcript: {e}")
        return None

def calculate_numerical_sentiment_score(sentiment_result: Dict) -> float:
    """
    Calculate numerical sentiment score from -1.0 (negative) to 1.0 (positive).
    Uses the same scoring methodology as the original script.
    
    Args:
        sentiment_result: Dict with 'label' and 'score' from analyze_transcript
        
    Returns:
        Float score from -1.0 to 1.0
    """
    if not sentiment_result:
        return 0.0
    
    label = sentiment_result['label']
    confidence = sentiment_result['score']
    
    # Map labels to numerical values (same as original script)
    if label == 'Positive':
        value = 1.0
    elif label == 'Negative':
        value = -1.0
    else:  # Neutral
        value = 0.0
    
    # Weight by confidence (same methodology)
    score = value * confidence
    
    # Normalize to -1.0 to 1.0 range
    return round(max(-1.0, min(1.0, score)), 4)

def map_sentiment_label(label: str) -> str:
    """
    Map sentiment label to database format (lowercase: positive/neutral/negative).
    
    Args:
        label: Label from model (Positive/Negative/Neutral)
        
    Returns:
        Lowercase label for database
    """
    label_lower = label.lower()
    if 'positive' in label_lower:
        return 'positive'
    elif 'negative' in label_lower:
        return 'negative'
    else:
        return 'neutral'

# ============================================================
# SUPABASE INTEGRATION
# ============================================================
supabase: Optional[Client] = None

def initialize_supabase():
    """Initialize Supabase client."""
    global supabase
    
    if not SUPABASE_AVAILABLE:
        raise ImportError("supabase library not available. Install with: pip install supabase")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")
    
    if supabase is None:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("✅ Supabase client initialized")
    
    return supabase

def get_transcripts(
    limit: Optional[int] = None,
    re_analyze: bool = False
) -> list:
    """
    Get transcripts from diio_transcripts table that need sentiment analysis.
    
    Args:
        limit: Maximum number of transcripts to fetch (None = all)
        re_analyze: If True, include already analyzed transcripts
        
    Returns:
        List of transcript dicts with id, transcript_text, sentiment, sentiment_score
    """
    try:
        query = supabase.table('diio_transcripts')\
            .select('id, diio_transcript_id, transcript_text, source_name, sentiment, sentiment_score, confidence_score')\
            .not_.is_('transcript_text', 'null')
        
        # Only get unanalyzed transcripts unless re_analyze=True
        if not re_analyze:
            query = query.or_('sentiment.is.null,sentiment_score.is.null,confidence_score.is.null')
        
        if limit:
            query = query.limit(limit)
        
        result = query.execute()
        
        return result.data or []
    
    except Exception as e:
        logger.error(f"Error fetching transcripts: {e}")
        return []

def get_transcript_count(re_analyze: bool = False) -> Dict:
    """
    Get statistics about transcripts.
    
    Args:
        re_analyze: If True, include already analyzed transcripts
    
    Returns:
        Dict with total_count, unanalyzed_count, analyzed_count
    """
    try:
        # Total transcripts with text
        total_query = supabase.table('diio_transcripts')\
            .select('id', count='exact')\
            .not_.is_('transcript_text', 'null')
        
        total_result = total_query.execute()
        total_count = total_result.count or 0
        
        # Unanalyzed transcripts
        unanalyzed_query = supabase.table('diio_transcripts')\
            .select('id', count='exact')\
            .not_.is_('transcript_text', 'null')\
            .or_('sentiment.is.null,sentiment_score.is.null,confidence_score.is.null')
        
        unanalyzed_result = unanalyzed_query.execute()
        unanalyzed_count = unanalyzed_result.count or 0
        analyzed_count = total_count - unanalyzed_count
        
        return {
            'total_count': total_count,
            'unanalyzed_count': unanalyzed_count,
            'analyzed_count': analyzed_count
        }
    
    except Exception as e:
        logger.error(f"Error getting transcript counts: {e}")
        return {
            'total_count': 0,
            'unanalyzed_count': 0,
            'analyzed_count': 0
        }

def update_transcript_sentiment(
    transcript_id: str,
    sentiment: str,
    sentiment_score: float,
    confidence_score: float
) -> bool:
    """
    Update transcript with sentiment analysis results.
    
    Args:
        transcript_id: The transcript UUID
        sentiment: Sentiment label (positive/neutral/negative)
        sentiment_score: Numerical sentiment score from -1.0 to 1.0
        confidence_score: Model confidence score from 0.0 to 1.0
        
    Returns:
        True if successful, False otherwise
    """
    try:
        update_data = {
            'sentiment': sentiment,
            'sentiment_score': float(sentiment_score),
            'confidence_score': float(confidence_score),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        supabase.table('diio_transcripts')\
            .update(update_data)\
            .eq('id', transcript_id)\
            .execute()
        
        return True
    except Exception as e:
        logger.error(f"Error updating transcript {transcript_id}: {e}")
        return False

# ============================================================
# MAIN PROCESSING FUNCTIONS
# ============================================================
def process_transcript_sentiment(transcript_id: str, transcript_text: str) -> Dict:
    """
    Process a single transcript for sentiment analysis.
    
    Args:
        transcript_id: The transcript UUID
        transcript_text: The transcript text to analyze
        
    Returns:
        Dict with processing results
    """
    # Analyze transcript
    sentiment_result = analyze_transcript(transcript_text)
    
    if not sentiment_result:
        return {
            'transcript_id': transcript_id,
            'success': False,
            'error': 'No sentiment result (empty or invalid transcript)'
        }
    
    # Calculate numerical sentiment score (same methodology as original)
    sentiment_score = calculate_numerical_sentiment_score(sentiment_result)
    
    # Map label to database format (lowercase)
    sentiment_label = map_sentiment_label(sentiment_result['label'])
    
    # Get confidence score from model result (this is the raw model confidence 0.0-1.0)
    confidence_score = sentiment_result['score']
    
    # Debug: Log the values to verify they're different
    if DEBUG_LABELS or sentiment_label != 'neutral':
        logger.info(f"   📊 Label: {sentiment_label}, Sentiment Score: {sentiment_score:.4f}, Confidence: {confidence_score:.4f}")
    
    # Update database
    success = update_transcript_sentiment(transcript_id, sentiment_label, sentiment_score, confidence_score)
    
    return {
        'transcript_id': transcript_id,
        'success': success,
        'sentiment': sentiment_label,
        'sentiment_score': sentiment_score,
        'confidence': confidence_score
    }

def run_sentiment_analysis(
    batch_size: Optional[int] = None,
    re_analyze: bool = False
):
    """
    Main function to process transcripts for sentiment analysis.
    
    Args:
        batch_size: Number of transcripts to process (None = all)
        re_analyze: If True, re-analyze already processed transcripts
    """
    logger.info("="*80)
    logger.info("STARTING SENTIMENT ANALYSIS FOR DIIO TRANSCRIPTS")
    logger.info("="*80)
    
    logger.info("\n📋 Processing DIIO meeting transcripts")
    logger.info(f"   Model: {MODEL_NAME} (running locally)")
    
    # Initialize
    logger.info("\n🔄 Initializing model and database connections...")
    initialize_model()
    initialize_supabase()
    
    # Test the model with a sample text to verify label format
    logger.info("\n🧪 Testing model with sample texts...")
    test_texts = [
        "I love this product! It's amazing!",
        "This is terrible. I hate it.",
        "The meeting was scheduled for tomorrow."
    ]
    for test_text in test_texts:
        try:
            test_result = sentiment_task(test_text)[0]
            logger.info(f"   Test: '{test_text[:30]}...' → Label: {test_result['label']}, Score: {test_result['score']:.4f}")
        except Exception as e:
            logger.warning(f"   Test failed: {e}")
    logger.info("")
    
    # Get statistics
    stats = get_transcript_count(re_analyze=re_analyze)
    logger.info(f"\n📊 Transcript Statistics:")
    logger.info(f"   Total transcripts: {stats['total_count']}")
    logger.info(f"   Already analyzed: {stats['analyzed_count']}")
    logger.info(f"   Need analysis: {stats['unanalyzed_count']}")
    
    if not re_analyze and stats['unanalyzed_count'] == 0:
        logger.info("\n✅ All transcripts have been analyzed!")
        logger.info("   Use --re-analyze to re-process them")
        return
    
    # Get transcripts
    if batch_size:
        logger.info(f"\n🔍 Fetching up to {batch_size} transcripts...")
    else:
        logger.info(f"\n🔍 Fetching ALL transcripts...")
    
    transcripts = get_transcripts(limit=batch_size, re_analyze=re_analyze)
    
    if not transcripts:
        logger.info("✅ No transcripts found matching the criteria")
        return
    
    logger.info(f"✅ Found {len(transcripts)} transcripts to process\n")
    
    # Process transcripts
    success = 0
    failed = 0
    sentiment_summary = {'positive': 0, 'negative': 0, 'neutral': 0}
    
    for i, transcript in enumerate(transcripts, 1):
        transcript_id = transcript.get('id')
        diio_transcript_id = transcript.get('diio_transcript_id', 'Unknown')
        source_name = transcript.get('source_name', 'Unknown')
        transcript_text = transcript.get('transcript_text', '')
        
        logger.info(f"[{i}/{len(transcripts)}] Processing transcript {diio_transcript_id} ({source_name[:50]}...)")
        
        try:
            result = process_transcript_sentiment(transcript_id, transcript_text)
            
            if result['success']:
                # Always show both scores to clarify the difference
                logger.info(
                    f"  ✅ {result['sentiment']} "
                    f"(sentiment_score: {result['sentiment_score']:.4f}, "
                    f"confidence_score: {result['confidence']:.4f})"
                )
                success += 1
                sentiment_summary[result['sentiment']] += 1
            else:
                logger.warning(f"  ⚠️  Failed: {result.get('error', 'Unknown error')}")
                failed += 1
        except Exception as e:
            logger.error(f"  ❌ Error processing transcript {diio_transcript_id}: {e}")
            failed += 1
    
    # Summary
    logger.info("="*80)
    logger.info(f"✅ ANALYSIS COMPLETED")
    logger.info(f"   Processed: {success}")
    logger.info(f"   Failed: {failed}")
    logger.info(f"   Success Rate: {(success/(success+failed)*100) if (success+failed) > 0 else 0:.1f}%")
    
    if sentiment_summary:
        logger.info(f"\n📊 Sentiment Distribution:")
        logger.info(f"   Positive: {sentiment_summary['positive']}")
        logger.info(f"   Neutral: {sentiment_summary['neutral']}")
        logger.info(f"   Negative: {sentiment_summary['negative']}")
    
    logger.info("="*80)

# ============================================================
# MAIN EXECUTION
# ============================================================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='Sentiment Analysis for DIIO Transcripts using Roberta model (runs locally)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process 50 transcripts
  python sentiment_analyzer_diio_transcripts.py --batch-size 50
  
  # Process ALL transcripts
  python sentiment_analyzer_diio_transcripts.py --all
  
  # Re-analyze already processed transcripts
  python sentiment_analyzer_diio_transcripts.py --re-analyze --batch-size 100
        """
    )
    parser.add_argument('--batch-size', type=int, default=50,
                       help='Number of transcripts to process (default: 50)')
    parser.add_argument('--re-analyze', action='store_true',
                       help='Re-analyze transcripts that were already processed')
    parser.add_argument('--all', action='store_true',
                       help='Process ALL transcripts without limit')
    
    args = parser.parse_args()
    
    try:
        batch_size = None if args.all else args.batch_size
        run_sentiment_analysis(
            batch_size=batch_size,
            re_analyze=args.re_analyze
        )
    except KeyboardInterrupt:
        logger.info("\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
