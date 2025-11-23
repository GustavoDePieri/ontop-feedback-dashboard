#!/usr/bin/env python3
"""
Test script for the bulk sentiment analysis API
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_bulk_sentiment_analysis():
    """Test the bulk sentiment analysis API with a small sample"""

    # Get API URL (adjust for your deployment)
    api_url = os.getenv('VERCEL_URL', 'http://localhost:3000')
    api_endpoint = f"{api_url}/api/diio/bulk-sentiment-analysis"

    print(f"Testing bulk sentiment analysis API at: {api_endpoint}")

    # Test with a small sample of account IDs
    # You'll need to replace these with actual account IDs from your database
    test_accounts = [
        # Add your actual account IDs here for testing
        # Example: "CL001234", "CL005678"
    ]

    if not test_accounts:
        print("⚠️  No test account IDs provided. Please add some account IDs to test_accounts list.")
        return

    payload = {
        "accountIds": test_accounts[:2],  # Test with first 2 accounts
        "limit": 3,  # Limit to 3 transcripts per account for testing
        "skipAnalyzed": True,  # Skip already analyzed transcripts
        "forceReanalysis": False
    }

    print(f"Testing with {len(payload['accountIds'])} accounts, limit {payload['limit']} transcripts each")

    try:
        response = requests.post(api_endpoint, json=payload)
        response.raise_for_status()

        result = response.json()

        if result.get('success'):
            print("✅ Bulk sentiment analysis API working!")

            summary = result.get('summary', {})
            print(f"\n📊 Summary:")
            print(f"   - Total accounts: {summary.get('totalAccounts', 0)}")
            print(f"   - Accounts with transcripts: {summary.get('accountsWithTranscripts', 0)}")
            print(f"   - Total transcripts found: {summary.get('totalTranscripts', 0)}")
            print(f"   - Transcripts analyzed: {summary.get('transcriptsAnalyzed', 0)}")
            print(f"   - Transcripts skipped: {summary.get('transcriptsSkipped', 0)}")
            print(f"   - Analysis errors: {summary.get('analysisErrors', 0)}")

            results = result.get('results', [])
            if results:
                print(f"\n📈 Account Results:")
                for account in results[:3]:  # Show first 3 accounts
                    print(f"   {account.get('accountId')} ({account.get('accountName', 'Unknown')}):")
                    print(f"     - Transcripts: {account.get('transcriptCount', 0)}")
                    print(f"     - Analyzed: {account.get('analyzedCount', 0)}")
                    print(f"     - Avg Sentiment: {account.get('averageSentiment', 0):.3f}")
                    print(f"     - Churn Risk: {account.get('churnRisk', 'unknown')}")
                    dist = account.get('sentimentDistribution', {})
                    print(f"     - Sentiment: +{dist.get('positive', 0)} 😐{dist.get('neutral', 0)} -{dist.get('negative', 0)}")

            errors = result.get('errors', [])
            if errors:
                print(f"\n❌ Errors ({len(errors)}):")
                for error in errors[:3]:
                    print(f"   {error.get('accountId')}: {error.get('error')}")

        else:
            print("❌ API returned success=false")
            print(f"Response: {result}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == '__main__':
    test_bulk_sentiment_analysis()
