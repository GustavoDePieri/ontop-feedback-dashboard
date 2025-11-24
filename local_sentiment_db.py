#!/usr/bin/env python3
"""
Local Sentiment Analysis with Real Database Connection
Run sentiment analysis locally using your actual transcript data
"""

import os
import json
import csv
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
    print(f"Missing required libraries: {e}")
    print("\nInstall with:")
    print("pip install transformers torch numpy scipy supabase")
    sys.exit(1)

class LocalSentimentAnalyzer:
    def __init__(self, model_name: str = "cardiffnlp/twitter-xlm-roberta-base-sentiment"):
        """Initialize the local sentiment analysis model"""
        print(f"Loading model: {model_name}")
        print("(This may take 2-5 minutes on first run - downloading ~1.7GB)")

        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
            self.config = self.model.config

            # Test the model
            test_result = self.analyze_sentiment("This is a test message.")
            print("Model loaded and tested successfully!")
            print(f"Labels: {list(self.config.id2label.values())}")

        except Exception as e:
            print(f"Failed to load model: {e}")
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

            # Calculate confidence as the difference between top and second-best scores
            # Higher difference = higher confidence
            if len(ranking) > 1:
                second_score = float(scores[ranking[1]])
                confidence = top_score - second_score
            else:
                confidence = top_score  # Fallback if only one class

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
                'confidence': 0.0,  # Low confidence for errors
                'error': str(e)
            }

def load_target_accounts() -> List[str]:
    """Load target accounts from JSON file"""
    try:
        with open('target_accounts.json', 'r') as f:
            data = json.load(f)
            accounts = data.get('accounts', [])
            print(f"Loaded {len(accounts)} target accounts from target_accounts.json")
            return accounts
    except FileNotFoundError:
        print("target_accounts.json not found.")
        print("   Please create this file with your 117 account IDs.")
        print("   Example format:")
        print('   {"accounts": ["CL001234", "CL005678", ...]}')
        return []
    except json.JSONDecodeError as e:
        print(f"Error reading target_accounts.json: {e}")
        return []

def get_transcripts_from_database(accounts: List[str], limit_per_account: int = 50) -> Dict[str, List[Dict]]:
    """Fetch transcripts from Supabase database"""
    print("Connecting to Supabase database...")

    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        print("Supabase credentials not found in environment variables")
        print("   Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file")
        return {}

    try:
        supabase: Client = create_client(supabase_url, supabase_key)

        account_transcripts = {}

        for account_id in accounts:
            print(f"Fetching transcripts for account: {account_id}")

            try:
                # Get transcripts for this account
                result = supabase.table('diio_transcripts').select(
                    'id, diio_transcript_id, transcript_text, source_name, occurred_at, attendees, client_platform_id, account_name, ai_analysis'
                ).eq('client_platform_id', account_id).limit(limit_per_account).execute()

                transcripts = result.data or []

                if transcripts:
                    print(f"   Found {len(transcripts)} transcripts")
                    account_transcripts[account_id] = transcripts
                else:
                    print(f"   No transcripts found for {account_id}")
                    account_transcripts[account_id] = []

            except Exception as e:
                print(f"   Error fetching transcripts for {account_id}: {e}")
                account_transcripts[account_id] = []

        total_transcripts = sum(len(transcripts) for transcripts in account_transcripts.values())
        accounts_with_data = len([acc for acc, trans in account_transcripts.items() if trans])

        print(f"Database query complete:")
        print(f"   Accounts processed: {len(account_transcripts)}")
        print(f"   Accounts with transcripts: {accounts_with_data}")
        print(f"   Total transcripts: {total_transcripts}")

        return account_transcripts

    except Exception as e:
        print(f"Database connection error: {e}")
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

def save_results_as_csv(analysis_results: Dict, json_file: str, csv_file: str):
    """Save analysis results in CSV format for easier analysis"""
    results = analysis_results['results']

    with open(csv_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = [
            'account_id', 'account_name', 'transcript_count', 'analyzed_count',
            'average_sentiment', 'churn_risk', 'sentiment_positive', 'sentiment_neutral', 'sentiment_negative',
            'Diio Sentiment Result', 'Diio Sentiment Conclusion',
            'transcript_id', 'source_name', 'occurred_at', 'sentiment_label', 'sentiment_score',
            'confidence', 'churn_risk_individual', 'customer_satisfaction', 'cached'
        ]

        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        # Write account-level summary rows (without transcript details)
        for account_id, data in results.items():
            # Calculate Diio Sentiment Result (majority sentiment)
            distribution = data.get('sentiment_distribution', {})
            max_sentiment = max(distribution, key=distribution.get)
            total_transcripts = sum(distribution.values())

            if total_transcripts > 0:
                diio_sentiment_result = max_sentiment.title()
            else:
                diio_sentiment_result = 'No Data'

            # Calculate Diio Sentiment Conclusion
            avg_sentiment = data.get('average_sentiment', 0)
            churn_risk = data.get('churn_risk', '')

            if total_transcripts == 0:
                diio_sentiment_conclusion = 'No transcripts available for analysis'
            elif churn_risk == 'critical':
                diio_sentiment_conclusion = 'Critical risk - immediate intervention required'
            elif churn_risk == 'high':
                diio_sentiment_conclusion = 'High risk - monitor closely and consider intervention'
            elif avg_sentiment > 0.1:
                diio_sentiment_conclusion = 'Generally positive sentiment in communications'
            elif avg_sentiment < -0.1:
                diio_sentiment_conclusion = 'Generally negative sentiment - requires attention'
            else:
                diio_sentiment_conclusion = 'Neutral sentiment in communications'

            summary_row = {
                'account_id': account_id,
                'account_name': data.get('account_name', ''),
                'transcript_count': data.get('transcript_count', 0),
                'analyzed_count': data.get('analyzed_count', 0),
                'average_sentiment': round(data.get('average_sentiment', 0), 4),
                'churn_risk': data.get('churn_risk', ''),
                'sentiment_positive': data.get('sentiment_distribution', {}).get('positive', 0),
                'sentiment_neutral': data.get('sentiment_distribution', {}).get('neutral', 0),
                'sentiment_negative': data.get('sentiment_distribution', {}).get('negative', 0),
                'Diio Sentiment Result': diio_sentiment_result,
                'Diio Sentiment Conclusion': diio_sentiment_conclusion,
            }
            writer.writerow(summary_row)

            # Write individual transcript rows
            for transcript in data.get('transcripts', []):
                transcript_row = {
                    'account_id': account_id,
                    'account_name': data.get('account_name', ''),
                    'transcript_id': transcript.get('id', ''),
                    'source_name': transcript.get('source_name', ''),
                    'occurred_at': transcript.get('occurred_at', ''),
                    'sentiment_label': transcript.get('sentiment', {}).get('overall', ''),
                    'sentiment_score': round(transcript.get('sentiment', {}).get('score', 0), 4),
                    'confidence': round(transcript.get('sentiment', {}).get('confidence', 0), 4),
                    'churn_risk_individual': transcript.get('sentiment', {}).get('churn_risk', ''),
                    'customer_satisfaction': transcript.get('sentiment', {}).get('customer_satisfaction', ''),
                    'cached': transcript.get('cached', False),
                    'Diio Sentiment Result': diio_sentiment_result,
                    'Diio Sentiment Conclusion': diio_sentiment_conclusion,
                }
                writer.writerow(transcript_row)

    print(f"CSV results saved to: {csv_file}")

def save_high_risk_report(analysis_results: Dict, report_file: str):
    """Save a focused report on high-risk accounts"""
    results = analysis_results['results']

    # Find high-risk accounts
    high_risk_accounts = []
    for account_id, data in results.items():
        if data.get('churn_risk') in ['high', 'critical'] and data.get('transcript_count', 0) > 0:
            high_risk_accounts.append((account_id, data))

    # Sort by risk level and sentiment
    high_risk_accounts.sort(key=lambda x: (
        {'critical': 0, 'high': 1}.get(x[1].get('churn_risk', ''), 2),
        x[1].get('average_sentiment', 0)
    ))

    with open(report_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = [
            'priority', 'account_id', 'account_name', 'churn_risk_level',
            'average_sentiment', 'transcript_count', 'negative_transcripts',
            'most_negative_transcript', 'most_negative_score', 'recommendation'
        ]

        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for priority, (account_id, data) in enumerate(high_risk_accounts[:20], 1):  # Top 20
            # Find most negative transcript
            most_negative = None
            most_negative_score = 0

            for transcript in data.get('transcripts', []):
                score = transcript.get('sentiment', {}).get('score', 0)
                if score < most_negative_score:
                    most_negative_score = score
                    most_negative = transcript.get('source_name', 'Unknown')

            # Generate recommendation
            risk_level = data.get('churn_risk', '')
            avg_sentiment = data.get('average_sentiment', 0)

            if risk_level == 'critical':
                recommendation = "URGENT: Schedule immediate customer success intervention within 24 hours"
            elif risk_level == 'high':
                recommendation = "HIGH PRIORITY: Contact customer within 3-5 business days"
            else:
                recommendation = "MONITOR: Track sentiment in upcoming interactions"

            writer.writerow({
                'priority': priority,
                'account_id': account_id,
                'account_name': data.get('account_name', ''),
                'churn_risk_level': risk_level.upper(),
                'average_sentiment': round(avg_sentiment, 4),
                'transcript_count': data.get('transcript_count', 0),
                'negative_transcripts': data.get('sentiment_distribution', {}).get('negative', 0),
                'most_negative_transcript': most_negative or 'N/A',
                'most_negative_score': round(most_negative_score, 4) if most_negative_score < 0 else 'N/A',
                'recommendation': recommendation
            })

    if high_risk_accounts:
        print(f"High-risk accounts report saved to: {report_file}")
        print(f"   {len(high_risk_accounts)} high-risk accounts identified")

def analyze_account_sentiments(analyzer: LocalSentimentAnalyzer, account_data: Dict[str, List[Dict]]) -> Dict[str, Any]:
    """Analyze sentiments for all accounts"""
    results = {}
    total_analyzed = 0
    total_cached = 0

    for account_id, transcripts in account_data.items():
        print(f"\nAnalyzing account: {account_id}")
        print(f"   Transcripts: {len(transcripts)}")

        account_results = []
        sentiment_scores = []

        for transcript in transcripts:
            transcript_id = transcript['id']
            print(f"   Analyzing: {transcript.get('source_name', 'Unknown')}")

            # Check if we already have cached AI analysis
            if transcript.get('ai_analysis'):
                print(f"      Using cached analysis")
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
    print("Local Sentiment Analysis with Database Connection")
    print("=" * 60)
    print("This runs completely on your machine - FREE & FAST!")

    # Check hardware
    if torch.cuda.is_available():
        print("CUDA available - using GPU for faster processing")
        device = torch.device("cuda")
    else:
        print("Using CPU (slower but still works)")
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
        print("No transcript data retrieved from database")
        return

    # Run sentiment analysis
    print("\nStarting sentiment analysis...")
    analysis_results = analyze_account_sentiments(analyzer, account_data)

    # Save results in both JSON and CSV formats
    json_file = 'local_sentiment_analysis_results.json'
    csv_file = 'local_sentiment_analysis_results.csv'
    high_risk_file = 'high_risk_accounts_report.csv'

    # Save JSON (full detailed results)
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(analysis_results, f, indent=2, ensure_ascii=False)

    # Save CSV (spreadsheet-friendly format)
    save_results_as_csv(analysis_results, json_file, csv_file)

    # Save high-risk accounts report
    save_high_risk_report(analysis_results, high_risk_file)

    # Print summary
    summary = analysis_results['summary']
    print("\nAnalysis Complete!")
    print(f"   JSON results: {json_file}")
    print(f"   CSV results: {csv_file}")
    print(f"   High-risk report: {high_risk_file}")
    print(f"   Accounts processed: {summary['total_accounts']}")
    print(f"   Accounts with transcripts: {summary['accounts_with_transcripts']}")
    print(f"   Total transcripts: {summary['total_transcripts']}")
    print(f"   Fresh analyses: {summary['fresh_analyses']}")
    print(f"   Cached analyses: {summary['cached_analyses']}")

    # Show high-risk accounts
    results = analysis_results['results']
    high_risk_accounts = [
        (account_id, data) for account_id, data in results.items()
        if data['churn_risk'] in ['high', 'critical'] and data['transcript_count'] > 0
    ]

    # Sort by risk level and sentiment
    high_risk_accounts.sort(key=lambda x: (
        {'critical': 0, 'high': 1}.get(x[1]['churn_risk'], 2),
        x[1]['average_sentiment']
    ))

    if high_risk_accounts:
        print(f"\nHIGH PRIORITY ACCOUNTS ({len(high_risk_accounts)}):")
        for i, (account_id, data) in enumerate(high_risk_accounts[:10], 1):  # Show top 10
            print(f"   {i}. {account_id} ({data['account_name']})")
            print(".3f")
            print(f"      Transcripts: {data['transcript_count']}")

    print("\nLocal sentiment analysis completed!")
    print("This method is COMPLETELY FREE and runs on your machine!")
    print("Much faster than API calls - no rate limits!")
    print("\nOpen the CSV files in Excel/Google Sheets for easy analysis!")

if __name__ == '__main__':
    main()
