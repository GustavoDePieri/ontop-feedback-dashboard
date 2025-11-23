#!/usr/bin/env python3
"""
Local Sentiment Analysis using HuggingFace Transformers
Run sentiment analysis locally without API calls - completely free!
"""

import os
import json
import sys
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
    import torch
    import numpy as np
    from scipy.special import softmax
except ImportError:
    print("❌ Missing required libraries. Install with:")
    print("pip install transformers torch numpy scipy")
    sys.exit(1)

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

class LocalSentimentAnalyzer:
    def __init__(self, model_name: str = "cardiffnlp/twitter-xlm-roberta-base-sentiment"):
        """Initialize the local sentiment analysis model"""
        print(f"🚀 Loading model: {model_name}")
        print("(This may take a few minutes on first run - downloading ~1.7GB)")

        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
            self.config = self.model.config

            # Test the model with a sample
            print("✅ Model loaded successfully!")
            print(f"📊 Labels: {self.config.id2label}")

        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            print("\nTroubleshooting:")
            print("1. Check your internet connection")
            print("2. Make sure you have ~2GB free disk space")
            print("3. Try again - sometimes downloads fail midway")
            sys.exit(1)

    def preprocess_text(self, text: str) -> str:
        """Preprocess text like the original model expects"""
        if not text or not isinstance(text, str):
            return ""

        # Clean and normalize the text
        new_text = []
        for t in text.split(" "):
            # Remove @mentions
            t = '@user' if t.startswith('@') and len(t) > 1 else t
            # Remove http links
            t = 'http' if t.startswith('http') else t
            new_text.append(t)

        return " ".join(new_text)

    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of a single text"""
        try:
            # Preprocess the text
            processed_text = self.preprocess_text(text)

            if not processed_text.strip():
                return {
                    'label': 'Neutral',
                    'score': 0.5,
                    'confidence': 0.5,
                    'error': 'Empty or invalid text'
                }

            # Tokenize
            encoded_input = self.tokenizer(
                processed_text,
                return_tensors='pt',
                truncation=True,
                max_length=512  # Model's max input length
            )

            # Run inference
            with torch.no_grad():
                output = self.model(**encoded_input)
                scores = output.logits[0].detach().numpy()
                scores = softmax(scores)

            # Get the ranking
            ranking = np.argsort(scores)[::-1]  # Sort in descending order

            # Return the top result
            top_label_idx = ranking[0]
            top_score = float(scores[top_label_idx])

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
                'confidence': top_score,
                'original_label': original_label
            }

        except Exception as e:
            print(f"❌ Error analyzing text: {e}")
            return {
                'label': 'Neutral',
                'score': 0.5,
                'confidence': 0.5,
                'error': str(e)
            }

def load_target_accounts() -> List[str]:
    """Load target accounts from JSON file"""
    try:
        with open('target_accounts.json', 'r') as f:
            data = json.load(f)
            return data.get('accounts', [])
    except FileNotFoundError:
        print("⚠️ target_accounts.json not found. Using sample accounts for testing.")
        return ["CL001234", "CL005678"]  # Sample accounts for testing
    except json.JSONDecodeError as e:
        print(f"❌ Error reading target_accounts.json: {e}")
        return []

def get_transcripts_for_accounts(accounts: List[str]) -> Dict[str, List[Dict]]:
    """Mock function to get transcripts for accounts"""
    # In a real implementation, this would query your database
    # For now, we'll return sample data

    print(f"📊 Getting transcripts for {len(accounts)} accounts...")

    # Sample transcript data (replace with real database queries)
    sample_transcripts = {
        "CL001234": [
            {
                "id": "sample-1",
                "transcript_text": "Thank you for calling our support. I'm happy to help you with your billing question. Your account is in good standing and your next payment is due on the 15th.",
                "source_name": "Billing Support Call",
                "occurred_at": "2025-01-20T10:30:00Z"
            },
            {
                "id": "sample-2",
                "transcript_text": "I understand your frustration with the service outage. We apologize for the inconvenience. Our team is working to resolve this as quickly as possible.",
                "source_name": "Service Outage Call",
                "occurred_at": "2025-01-18T14:15:00Z"
            }
        ],
        "CL005678": [
            {
                "id": "sample-3",
                "transcript_text": "This is unacceptable! I've been waiting for 45 minutes to speak to someone. Your service is terrible and I'm switching providers immediately.",
                "source_name": "Customer Complaint",
                "occurred_at": "2025-01-19T09:20:00Z"
            }
        ]
    }

    # Return only data for requested accounts
    result = {}
    for account in accounts:
        result[account] = sample_transcripts.get(account, [])

    return result

def analyze_account_sentiments(analyzer: LocalSentimentAnalyzer, account_data: Dict[str, List[Dict]]) -> Dict[str, Any]:
    """Analyze sentiments for all accounts"""
    results = {}

    total_analyzed = 0

    for account_id, transcripts in account_data.items():
        print(f"\n🏢 Analyzing account: {account_id}")
        print(f"   📝 Transcripts: {len(transcripts)}")

        account_results = []
        sentiment_scores = []

        for transcript in transcripts:
            print(f"   📞 Analyzing: {transcript['source_name']}")

            # Analyze sentiment
            sentiment = analyzer.analyze_sentiment(transcript['transcript_text'])

            # Calculate churn risk based on sentiment
            churn_risk = calculate_churn_risk(sentiment)

            result = {
                'id': transcript['id'],
                'source_name': transcript['source_name'],
                'occurred_at': transcript['occurred_at'],
                'sentiment': {
                    'overall': sentiment['label'].lower(),
                    'score': sentiment['score'],
                    'confidence': sentiment['confidence'],
                    'churn_risk': churn_risk,
                    'customer_satisfaction': get_customer_satisfaction(sentiment['label'], sentiment['score'])
                }
            }

            account_results.append(result)
            sentiment_scores.append(sentiment['score'])
            total_analyzed += 1

        # Calculate account-level metrics
        if sentiment_scores:
            avg_sentiment = sum(sentiment_scores) / len(sentiment_scores)

            # Count sentiment distribution
            distribution = {'positive': 0, 'neutral': 0, 'negative': 0}
            for result in account_results:
                sentiment = result['sentiment']['overall']
                if sentiment in distribution:
                    distribution[sentiment] += 1

            # Overall churn risk for account
            account_churn_risk = 'low'
            if avg_sentiment < -0.3 or distribution['negative'] > len(account_results) * 0.5:
                account_churn_risk = 'high'
            elif avg_sentiment < -0.1 or distribution['negative'] > len(account_results) * 0.3:
                account_churn_risk = 'medium'

            results[account_id] = {
                'account_name': f"Account {account_id}",  # Replace with real account name
                'transcript_count': len(transcripts),
                'analyzed_count': len(account_results),
                'average_sentiment': avg_sentiment,
                'churn_risk': account_churn_risk,
                'sentiment_distribution': distribution,
                'transcripts': account_results
            }
        else:
            results[account_id] = {
                'transcript_count': 0,
                'analyzed_count': 0,
                'average_sentiment': 0,
                'churn_risk': 'unknown',
                'sentiment_distribution': {'positive': 0, 'neutral': 0, 'negative': 0},
                'transcripts': []
            }

    return {
        'summary': {
            'total_accounts': len(account_data),
            'accounts_with_transcripts': len([r for r in results.values() if r['transcript_count'] > 0]),
            'total_transcripts': sum(r['transcript_count'] for r in results.values()),
            'transcripts_analyzed': total_analyzed
        },
        'results': results
    }

def calculate_churn_risk(sentiment: Dict) -> str:
    """Calculate churn risk based on sentiment"""
    label = sentiment['label']
    score = sentiment['score']

    if label == 'Negative':
        if score > 0.8:
            return 'critical'
        elif score > 0.6:
            return 'high'
        else:
            return 'medium'
    elif label == 'Neutral':
        return 'low'
    else:  # Positive
        return 'low'

def get_customer_satisfaction(label: str, score: float) -> str:
    """Determine customer satisfaction level"""
    if label == 'Positive':
        return 'satisfied'
    elif label == 'Negative':
        return 'frustrated' if score > 0.6 else 'at_risk'
    else:
        return 'neutral'

def main():
    print("🤖 Local Sentiment Analysis for Transcripts")
    print("=" * 50)

    # Check if CUDA is available
    if torch.cuda.is_available():
        print("✅ CUDA available - using GPU for faster processing")
        device = torch.device("cuda")
    else:
        print("ℹ️ CUDA not available - using CPU (slower but still works)")
        device = torch.device("cpu")

    # Initialize the analyzer
    analyzer = LocalSentimentAnalyzer()
    analyzer.model.to(device)  # Move model to GPU if available

    # Load target accounts
    target_accounts = load_target_accounts()
    if not target_accounts:
        print("❌ No target accounts found. Please check target_accounts.json")
        return

    print(f"🎯 Processing {len(target_accounts)} target accounts")

    # Get transcript data (mock implementation)
    account_data = get_transcripts_for_accounts(target_accounts)

    # Run sentiment analysis
    print("\n🚀 Starting sentiment analysis...")
    analysis_results = analyze_account_sentiments(analyzer, account_data)

    # Save results
    output_file = 'local_sentiment_analysis_results.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(analysis_results, f, indent=2, ensure_ascii=False)

    # Print summary
    summary = analysis_results['summary']
    print("
📊 Analysis Complete!"    print(f"   📁 Results saved to: {output_file}")
    print(f"   🏢 Accounts processed: {summary['total_accounts']}")
    print(f"   📝 Transcripts analyzed: {summary['transcripts_analyzed']}")

    # Show high-risk accounts
    results = analysis_results['results']
    high_risk_accounts = [
        (account_id, data) for account_id, data in results.items()
        if data['churn_risk'] in ['high', 'critical'] and data['transcript_count'] > 0
    ]

    if high_risk_accounts:
        print(f"\n🚨 HIGH PRIORITY ACCOUNTS ({len(high_risk_accounts)}):")
        for account_id, data in high_risk_accounts[:5]:  # Show top 5
            print(".3f"            print(f"         Churn Risk: {data['churn_risk'].upper()}")

    print("
✅ Local sentiment analysis completed successfully!"    print("💡 This method is completely FREE and runs on your machine!")

if __name__ == '__main__':
    main()
