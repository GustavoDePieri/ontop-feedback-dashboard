#!/usr/bin/env python3
"""
Local Sentiment Analysis with Real Database Connection
Run sentiment analysis locally using your actual transcript data
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
    from supabase import create_client, Client
except ImportError as e:
    print(f"❌ Missing required libraries: {e}")
    print("\nInstall with:")
    print("pip install transformers torch numpy scipy supabase")
    sys.exit(1)

class LocalSentimentAnalyzer:
    def __init__(self, model_name: str = "cardiffnlp/twitter-xlm-roberta-base-sentiment"):
        """Initialize the local sentiment analysis model"""
        print(f"🚀 Loading model: {model_name}")
        print("(This may take 2-5 minutes on first run - downloading ~1.7GB)")

        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
            self.config = self.model.config

            # Test the model
            test_result = self.analyze_sentiment("This is a test message.")
            print("✅ Model loaded and tested successfully!")
            print(f"📊 Labels: {list(self.config.id2label.values())}")

        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            print("\nTroubleshooting:")
            print("1. Check your internet connection")
            print("2. Make sure you have ~2GB free disk space")
            print("3. Try: pip install --upgrade transformers")
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
            accounts = data.get('accounts', [])
            print(f"✅ Loaded {len(accounts)} target accounts from target_accounts.json")
            return accounts
    except FileNotFoundError:
        print("❌ target_accounts.json not found.")
        print("   Please create this file with your 117 account IDs.")
        print("   Example format:")
        print('   {"accounts": ["CL001234", "CL005678", ...]}')
        return []
    except json.JSONDecodeError as e:
        print(f"❌ Error reading target_accounts.json: {e}")
        return []

def get_transcripts_from_database(accounts: List[str], limit_per_account: int = 50) -> Dict[str, List[Dict]]:
    """Fetch transcripts from Supabase database"""
    print("🔗 Connecting to Supabase database...")

    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not found in environment variables")
        print("   Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file")
        return {}

    try:
        supabase: Client = create_client(supabase_url, supabase_key)

        account_transcripts = {}

        for account_id in accounts:
            print(f"📊 Fetching transcripts for account: {account_id}")

            try:
                # Get transcripts for this account
                result = supabase.table('diio_transcripts').select(
                    'id, diio_transcript_id, transcript_text, source_name, occurred_at, attendees, client_platform_id, account_name, ai_analysis'
                ).eq('client_platform_id', account_id).limit(limit_per_account).execute()

                transcripts = result.data or []

                if transcripts:
                    print(f"   ✅ Found {len(transcripts)} transcripts")
                    account_transcripts[account_id] = transcripts
                else:
                    print(f"   ℹ️ No transcripts found for {account_id}")
                    account_transcripts[account_id] = []

            except Exception as e:
                print(f"   ❌ Error fetching transcripts for {account_id}: {e}")
                account_transcripts[account_id] = []

        total_transcripts = sum(len(transcripts) for transcripts in account_transcripts.values())
        accounts_with_data = len([acc for acc, trans in account_transcripts.items() if trans])

        print(f"📊 Database query complete:")
        print(f"   🏢 Accounts processed: {len(account_transcripts)}")
        print(f"   📝 Accounts with transcripts: {accounts_with_data}")
        print(f"   📄 Total transcripts: {total_transcripts}")

        return account_transcripts

    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return {}

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

def analyze_account_sentiments(analyzer: LocalSentimentAnalyzer, account_data: Dict[str, List[Dict]]) -> Dict[str, Any]:
    """Analyze sentiments for all accounts"""
    results = {}
    total_analyzed = 0
    total_cached = 0

    for account_id, transcripts in account_data.items():
        print(f"\n🏢 Analyzing account: {account_id}")
        print(f"   📝 Transcripts: {len(transcripts)}")

        account_results = []
        sentiment_scores = []

        for transcript in transcripts:
            transcript_id = transcript['id']
            print(f"   📞 Analyzing: {transcript.get('source_name', 'Unknown')}")

            # Check if we already have cached AI analysis
            if transcript.get('ai_analysis'):
                print(f"      ⚡ Using cached analysis")
                cached_sentiment = transcript['ai_analysis']

                sentiment = {
                    'label': cached_sentiment.get('overallSentiment', 'neutral').title(),
                    'score': cached_sentiment.get('sentimentScore', 0),
                    'confidence': 0.9,  # Assume high confidence for cached results
                    'cached': True
                }
                total_cached += 1
            else:
                # Run fresh analysis
                sentiment_result = analyzer.analyze_sentiment(transcript.get('transcript_text', ''))
                sentiment = {
                    'label': sentiment_result['label'],
                    'score': sentiment_result['score'],
                    'confidence': sentiment_result['confidence'],
                    'cached': False
                }
                total_analyzed += 1

            # Calculate churn risk
            churn_risk = calculate_churn_risk(sentiment)

            result = {
                'id': transcript_id,
                'source_name': transcript.get('source_name', 'Unknown'),
                'occurred_at': transcript.get('occurred_at'),
                'sentiment': {
                    'overall': sentiment['label'].lower(),
                    'score': sentiment['score'],
                    'confidence': sentiment['confidence'],
                    'churn_risk': churn_risk,
                    'customer_satisfaction': get_customer_satisfaction(sentiment['label'], sentiment['score'])
                },
                'cached': sentiment.get('cached', False)
            }

            account_results.append(result)
            sentiment_scores.append(sentiment['score'])

        # Calculate account-level metrics
        if sentiment_scores:
            avg_sentiment = sum(sentiment_scores) / len(sentiment_scores)

            # Count sentiment distribution
            distribution = {'positive': 0, 'neutral': 0, 'negative': 0}
            for result in account_results:
                sentiment_label = result['sentiment']['overall']
                if sentiment_label in distribution:
                    distribution[sentiment_label] += 1

            # Overall churn risk for account
            account_churn_risk = 'low'
            negative_ratio = distribution['negative'] / len(account_results)

            if negative_ratio > 0.5 or avg_sentiment < -0.3:
                account_churn_risk = 'critical'
            elif negative_ratio > 0.3 or avg_sentiment < -0.1:
                account_churn_risk = 'high'
            elif negative_ratio > 0.15:
                account_churn_risk = 'medium'

            results[account_id] = {
                'account_name': transcripts[0].get('account_name', f'Account {account_id}') if transcripts else f'Account {account_id}',
                'transcript_count': len(transcripts),
                'analyzed_count': len(account_results),
                'average_sentiment': avg_sentiment,
                'churn_risk': account_churn_risk,
                'sentiment_distribution': distribution,
                'transcripts': account_results
            }
        else:
            results[account_id] = {
                'account_name': f'Account {account_id}',
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
            'fresh_analyses': total_analyzed,
            'cached_analyses': total_cached
        },
        'results': results
    }

def main():
    print("🤖 Local Sentiment Analysis with Database Connection")
    print("=" * 60)
    print("💡 This runs completely on your machine - FREE & FAST!")

    # Check hardware
    if torch.cuda.is_available():
        print("✅ CUDA available - using GPU for faster processing")
        device = torch.device("cuda")
    else:
        print("ℹ️ Using CPU (slower but still works)")
        device = torch.device("cpu")

    # Initialize the analyzer
    analyzer = LocalSentimentAnalyzer()
    analyzer.model.to(device)

    # Load target accounts
    target_accounts = load_target_accounts()
    if not target_accounts:
        return

    # Get transcript data from database
    account_data = get_transcripts_from_database(target_accounts, limit_per_account=20)

    if not account_data:
        print("❌ No transcript data retrieved from database")
        return

    # Run sentiment analysis
    print("\n🚀 Starting sentiment analysis...")
    analysis_results = analyze_account_sentiments(analyzer, account_data)

    # Save results
    output_file = 'local_sentiment_analysis_results.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(analysis_results, f, indent=2, ensure_ascii=False)

    # Print summary
    summary = analysis_results['summary']
    print("\n📊 Analysis Complete!")
    print(f"   📁 Results saved to: {output_file}")
    print(f"   🏢 Accounts processed: {summary['total_accounts']}")
    print(f"   📝 Accounts with transcripts: {summary['accounts_with_transcripts']}")
    print(f"   📄 Total transcripts: {summary['total_transcripts']}")
    print(f"   🔄 Fresh analyses: {summary['fresh_analyses']}")
    print(f"   ⚡ Cached analyses: {summary['cached_analyses']}")

    # Show high-risk accounts
    results = analysis_results['results']
    high_risk_accounts = [
        (account_id, data) for account_id, data in results.items()
        if data['churn_risk'] in ['high', 'critical'] and data['transcript_count'] > 0
    ]

    if high_risk_accounts:
        print(f"\n🚨 HIGH PRIORITY ACCOUNTS ({len(high_risk_accounts)}):")
        # Sort by risk level and sentiment
        high_risk_accounts.sort(key=lambda x: (
            {'critical': 0, 'high': 1}.get(x[1]['churn_risk'], 2),
            x[1]['average_sentiment']
        ))

        for account_id, data in high_risk_accounts[:10]:  # Show top 10
            print(f"   ⚠️ {account_id} ({data['account_name']})")
            print(".3f")
            print(f"      📊 Transcripts: {data['transcript_count']}")

    print("\n✅ Local sentiment analysis completed!")
    print("💰 This method is COMPLETELY FREE and runs on your machine!")
    print("⚡ Much faster than API calls - no rate limits!")

if __name__ == '__main__':
    main()
