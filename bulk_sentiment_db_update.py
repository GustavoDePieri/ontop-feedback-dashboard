#!/usr/bin/env python3
"""
Bulk Sentiment Analysis for ALL Transcripts - Update Database
Runs sentiment analysis on all transcripts in diio_transcripts table and updates the database
"""

import os
import json
import csv
from datetime import datetime
from typing import Dict, List, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from supabase import create_client, Client
    import torch
    import numpy as np
    from scipy.special import softmax
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
except ImportError as e:
    print(f"Missing required libraries: {e}")
    print("Install with: pip install supabase torch transformers scipy python-dotenv")
    exit(1)

class LocalSentimentAnalyzer:
    """Local sentiment analysis using HuggingFace transformers"""

    def __init__(self, model_name: str = "cardiffnlp/twitter-xlm-roberta-base-sentiment"):
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.config = None

        self.load_model()

    def load_model(self):
        """Load the sentiment analysis model"""
        print(f"Loading model: {self.model_name}")
        print("(This may take 2-5 minutes on first run - downloading ~1.7GB)")

        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
            self.config = self.model.config

            print("Model loaded and tested successfully!")
            print(f"Labels: {list(self.config.id2label.values())}")

        except Exception as e:
            print(f"Failed to load model: {e}")
            raise

    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of a text"""
        if not text or not text.strip():
            return {
                'label': 'Neutral',
                'score': 0.5,
                'confidence': 0.0,
                'error': 'Empty text'
            }

        try:
            # Preprocess text (remove extra whitespace, limit length)
            processed_text = " ".join(text.split()[:512])  # Limit to ~512 words

            # Tokenize
            encoded_input = self.tokenizer(
                processed_text,
                return_tensors='pt',
                truncation=True,
                max_length=512
            )

            # Run inference
            with torch.no_grad():
                output = self.model(**encoded_input)
                scores = output.logits[0].detach().numpy()
                scores = softmax(scores)

            # Get the ranking
            ranking = np.argsort(scores)[::-1]

            # Return the top result
            top_label_idx = ranking[0]
            top_score = float(scores[top_label_idx])

            # Calculate confidence as the difference between top and second-best scores
            if len(ranking) > 1:
                second_score = float(scores[ranking[1]])
                confidence = top_score - second_score
            else:
                confidence = top_score

            # Map to our labels
            label_mapping = {
                'LABEL_0': 'Negative',
                'LABEL_1': 'Neutral',
                'LABEL_2': 'Positive'
            }

            original_label = self.config.id2label[top_label_idx]
            final_label = label_mapping.get(original_label, original_label)

            return {
                'label': final_label,
                'score': top_score,
                'confidence': confidence,
                'original_label': original_label
            }

        except Exception as e:
            print(f"Error analyzing text: {e}")
            return {
                'label': 'Neutral',
                'score': 0.5,
                'confidence': 0.0,
                'error': str(e)
            }

def get_all_transcripts_batch(supabase: Client, offset: int = 0, batch_size: int = 500) -> List[Dict]:
    """Get a batch of transcripts from the database"""
    try:
        result = supabase.table('diio_transcripts').select(
            'id, diio_transcript_id, transcript_text, source_name, occurred_at, attendees, client_platform_id, account_name, account_status, ai_analysis'
        ).range(offset, offset + batch_size - 1).execute()

        return result.data or []

    except Exception as e:
        print(f"Error fetching batch starting at {offset}: {e}")
        return []

def update_transcript_sentiment(supabase: Client, transcript_id: str, sentiment_data: Dict) -> bool:
    """Update a transcript with sentiment analysis results"""
    try:
        # Prepare the sentiment data for storage
        ai_analysis = {
            'sentiment': sentiment_data['label'],
            'score': sentiment_data['score'],
            'confidence': sentiment_data['confidence'],
            'analyzed_at': datetime.now().isoformat(),
            'model': 'cardiffnlp/twitter-xlm-roberta-base-sentiment'
        }

        # Update the transcript
        supabase.table('diio_transcripts').update({
            'ai_analysis': json.dumps(ai_analysis)
        }).eq('id', transcript_id).execute()

        return True

    except Exception as e:
        print(f"Error updating transcript {transcript_id}: {e}")
        return False

def process_all_transcripts_batch_mode():
    """Process all transcripts in batches and update database"""
    print("Bulk Sentiment Analysis - Update Database")
    print("=" * 50)
    print("This will analyze ALL transcripts and update the database")
    print("Results will be visible on your dashboard!")
    print()

    # Setup hardware
    if torch.cuda.is_available():
        print("CUDA available - using GPU for faster processing")
        device = torch.device("cuda")
    else:
        print("Using CPU (slower but still works)")
        device = torch.device("cpu")

    # Initialize the analyzer
    analyzer = LocalSentimentAnalyzer()
    analyzer.model.to(device)

    # Get Supabase connection
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        print("Supabase credentials not found in environment variables")
        return

    supabase = create_client(supabase_url, supabase_key)

    # Get total count first
    try:
        count_result = supabase.table('diio_transcripts').select('id', count='exact').execute()
        total_transcripts = count_result.count
        print(f"Found {total_transcripts} total transcripts in database")
    except:
        print("Could not get total count, proceeding with batch processing...")
        total_transcripts = "unknown"

    # Process in batches
    batch_size = 500  # Adjust based on your needs
    offset = 0
    processed_count = 0
    updated_count = 0
    error_count = 0

    while True:
        print(f"\nProcessing batch {offset//batch_size + 1} (offset: {offset})...")

        # Get batch of transcripts
        transcripts = get_all_transcripts_batch(supabase, offset, batch_size)

        if not transcripts:
            print("No more transcripts to process")
            break

        print(f"Retrieved {len(transcripts)} transcripts in this batch")

        # Process each transcript in the batch
        for transcript in transcripts:
            processed_count += 1

            transcript_id = transcript.get('id')
            transcript_text = transcript.get('transcript_text', '')
            account_name = transcript.get('account_name', 'Unknown')
            source_name = transcript.get('source_name', 'Unknown')

            # Skip if already has AI analysis (optional - comment out to re-analyze all)
            existing_analysis = transcript.get('ai_analysis')
            if existing_analysis:
                print(f"  Skipping {transcript_id} - already has analysis")
                continue

            # Skip if no transcript text
            if not transcript_text or not transcript_text.strip():
                print(f"  Skipping {transcript_id} - no transcript text")
                continue

            # Handle Unicode characters safely
            safe_account = account_name.encode('ascii', 'ignore').decode('ascii') if account_name else 'Unknown'
            safe_source = source_name.encode('ascii', 'ignore').decode('ascii') if source_name else 'Unknown'
            print(f"  Analyzing: {safe_account} - {safe_source[:50]}...")

            # Run sentiment analysis
            sentiment_result = analyzer.analyze_sentiment(transcript_text)

            # Update database
            success = update_transcript_sentiment(supabase, transcript_id, sentiment_result)

            if success:
                updated_count += 1
                print(f"    Updated with {sentiment_result['label']} (confidence: {sentiment_result['confidence']:.3f})")
            else:
                error_count += 1
                print(f"    Failed to update")

        # Move to next batch
        offset += batch_size

        # Optional: Add a small delay between batches to be gentle on the database
        import time
        time.sleep(0.5)

    # Final summary
    print("\n" + "="*60)
    print("BULK SENTIMENT ANALYSIS COMPLETE!")
    print("="*60)
    print(f"Total transcripts in database: {total_transcripts}")
    print(f"Transcripts processed: {processed_count}")
    print(f"Transcripts updated: {updated_count}")
    print(f"Errors: {error_count}")
    print("\nResults are now stored in the database!")
    print("They will be visible on your dashboard automatically")

    # Show sample of what was stored
    print("\nSample of stored data format:")
    sample_data = {
        'sentiment': 'Neutral',
        'score': 0.4523,
        'confidence': 0.1234,
        'analyzed_at': datetime.now().isoformat(),
        'model': 'cardiffnlp/twitter-xlm-roberta-base-sentiment'
    }
    print(json.dumps(sample_data, indent=2))

def main():
    print("Starting FULL DATABASE UPDATE mode")
    print("This will analyze ALL transcripts and update the database")
    print("Results will be visible on your dashboard!\n")

    process_all_transcripts_batch_mode()

if __name__ == '__main__':
    main()
