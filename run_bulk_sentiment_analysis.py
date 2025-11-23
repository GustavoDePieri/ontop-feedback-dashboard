#!/usr/bin/env python3
"""
Run bulk sentiment analysis on target accounts
"""

import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def load_target_accounts():
    """Load target accounts from JSON file"""
    try:
        with open('target_accounts.json', 'r') as f:
            data = json.load(f)
            return data.get('accounts', [])
    except FileNotFoundError:
        print("❌ target_accounts.json not found. Please create this file with your account IDs.")
        return []
    except json.JSONDecodeError as e:
        print(f"❌ Error reading target_accounts.json: {e}")
        return []

def run_bulk_sentiment_analysis():
    """Run bulk sentiment analysis on target accounts"""

    # Load target accounts
    target_accounts = load_target_accounts()
    if not target_accounts:
        print("No target accounts found. Please add account IDs to target_accounts.json")
        return

    print(f"🎯 Running sentiment analysis on {len(target_accounts)} target accounts")

    # Get API URL
    api_url = os.getenv('VERCEL_URL', 'http://localhost:3000')
    api_endpoint = f"{api_url}/api/diio/bulk-sentiment-analysis"

    print(f"📡 API Endpoint: {api_endpoint}")

    # Prepare request
    payload = {
        "accountIds": target_accounts,
        "limit": 50,  # Analyze up to 50 transcripts per account
        "skipAnalyzed": True,  # Skip already analyzed transcripts
        "forceReanalysis": False  # Don't force re-analysis of cached results
    }

    try:
        print("🚀 Sending bulk sentiment analysis request...")
        response = requests.post(api_endpoint, json=payload, timeout=300)  # 5 minute timeout
        response.raise_for_status()

        result = response.json()

        if result.get('success'):
            print("✅ Bulk sentiment analysis completed successfully!")

            summary = result.get('summary', {})
            print(f"\n📊 Summary:")
            print(f"   - Total accounts processed: {summary.get('totalAccounts', 0)}")
            print(f"   - Accounts with transcripts: {summary.get('accountsWithTranscripts', 0)}")
            print(f"   - Total transcripts found: {summary.get('totalTranscripts', 0)}")
            print(f"   - Transcripts analyzed: {summary.get('transcriptsAnalyzed', 0)}")
            print(f"   - Transcripts skipped (cached): {summary.get('transcriptsSkipped', 0)}")
            print(f"   - Analysis errors: {summary.get('analysisErrors', 0)}")

            # Show results for accounts that had transcripts
            results = result.get('results', [])
            accounts_with_data = [r for r in results if r.get('transcriptCount', 0) > 0]

            if accounts_with_data:
                print(f"\n📈 Results for {len(accounts_with_data)} accounts with transcripts:")

                # Sort by churn risk (highest risk first)
                risk_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
                accounts_with_data.sort(key=lambda x: risk_order.get(x.get('churnRisk', 'low'), 3))

                for account in accounts_with_data[:10]:  # Show top 10
                    print(f"\n🏢 {account.get('accountId')} - {account.get('accountName', 'Unknown')}")
                    print(f"   📊 Transcripts: {account.get('transcriptCount', 0)} (analyzed: {account.get('analyzedCount', 0)})")
                    print(".3f")
                    print(f"   🚨 Churn Risk: {account.get('churnRisk', 'unknown').upper()}")

                    dist = account.get('sentimentDistribution', {})
                    print(f"   😊 Positive: {dist.get('positive', 0)} | 😐 Neutral: {dist.get('neutral', 0)} | 😞 Negative: {dist.get('negative', 0)}")

                if len(accounts_with_data) > 10:
                    print(f"\n... and {len(accounts_with_data) - 10} more accounts")

                # Show high-risk accounts
                high_risk = [a for a in accounts_with_data if a.get('churnRisk') in ['critical', 'high']]
                if high_risk:
                    print(f"\n🚨 HIGH PRIORITY ACCOUNTS ({len(high_risk)}):")
                    for account in high_risk[:5]:
                        print(f"   ⚠️  {account.get('accountId')} - {account.get('churnRisk').upper()} risk")

            # Show errors if any
            errors = result.get('errors', [])
            if errors:
                print(f"\n❌ Errors for {len(errors)} accounts:")
                for error in errors[:5]:  # Show first 5 errors
                    print(f"   {error.get('accountId')}: {error.get('error')}")

            # Save results to file
            output_file = 'sentiment_analysis_results.json'
            with open(output_file, 'w') as f:
                json.dump(result, f, indent=2)

            print(f"\n💾 Full results saved to {output_file}")

        else:
            print("❌ API returned success=false")
            print(f"Response: {result}")

    except requests.exceptions.Timeout:
        print("❌ Request timed out. The analysis may be running but taking too long.")
        print("   Try with fewer accounts or check the Vercel function logs.")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        if hasattr(e, 'response') and e.response:
            try:
                error_details = e.response.json()
                print(f"   Error details: {error_details}")
            except:
                print(f"   Status code: {e.response.status_code}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    run_bulk_sentiment_analysis()
