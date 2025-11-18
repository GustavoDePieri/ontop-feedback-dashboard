#!/usr/bin/env python3
"""
Script to update diio_transcripts table with churned account information.
Matches customer emails from transcript attendees with churned accounts CSV.
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Set, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Supabase client not installed. Run: pip install -r requirements.txt")
    sys.exit(1)

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def load_mappings() -> Dict:
    """Load the email-to-account mappings from JSON file."""
    mappings_file = project_root / 'churned_accounts_mappings.json'
    if not mappings_file.exists():
        print(f"❌ Mappings file not found: {mappings_file}")
        print("   Run the CSV parsing script first: py scripts/match_transcripts_with_churned_accounts.py")
        sys.exit(1)

    with open(mappings_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_customer_emails(attendees_json: Dict) -> List[str]:
    """Extract customer emails from attendees JSON structure."""
    emails = []

    if not attendees_json or not isinstance(attendees_json, dict):
        return emails

    # Extract from customers section
    customers = attendees_json.get('customers', [])
    if isinstance(customers, list):
        for customer in customers:
            if isinstance(customer, dict) and 'email' in customer:
                email = customer['email']
                if email and isinstance(email, str):
                    emails.append(email.lower().strip())

    return emails

def find_matching_account(customer_emails: List[str], email_to_account: Dict) -> Optional[Dict]:
    """Find the account that matches any of the customer emails."""
    for email in customer_emails:
        if email in email_to_account:
            return email_to_account[email]

    return None

def update_transcript_with_account(supabase: Client, transcript_id: str, account_info: Dict) -> bool:
    """Update a transcript with account information."""
    try:
        update_data = {
            'client_platform_id': account_info['client_platform_id'],
            'account_name': account_info['account_name']
        }

        result = supabase.table('diio_transcripts').update(update_data).eq('id', transcript_id).execute()

        if result.data and len(result.data) > 0:
            return True
        else:
            print(f"⚠️ No rows updated for transcript {transcript_id}")
            return False

    except Exception as e:
        print(f"❌ Error updating transcript {transcript_id}: {e}")
        return False

def process_transcripts_batch(supabase: Client, transcripts: List[Dict], email_to_account: Dict, batch_size: int = 50) -> Dict:
    """Process a batch of transcripts and update those that match churned accounts."""
    stats = {
        'processed': 0,
        'matched': 0,
        'updated': 0,
        'errors': 0
    }

    for i in range(0, len(transcripts), batch_size):
        batch = transcripts[i:i + batch_size]
        print(f"📦 Processing batch {i//batch_size + 1} ({len(batch)} transcripts)...")

        for transcript in batch:
            stats['processed'] += 1

            # Extract customer emails from attendees
            customer_emails = extract_customer_emails(transcript.get('attendees', {}))

            if not customer_emails:
                continue

            # Find matching account
            account_match = find_matching_account(customer_emails, email_to_account)

            if account_match:
                stats['matched'] += 1

                # Check if already has this account info
                current_client_id = transcript.get('client_platform_id')
                current_account_name = transcript.get('account_name')

                if (current_client_id == account_match['client_platform_id'] and
                    current_account_name == account_match['account_name']):
                    # Already up to date
                    continue

                # Update the transcript
                success = update_transcript_with_account(supabase, transcript['id'], account_match)
                if success:
                    stats['updated'] += 1
                    print(f"✅ Updated transcript {transcript['id'][:8]}... -> {account_match['account_name']} ({account_match['client_platform_id']})")
                else:
                    stats['errors'] += 1

    return stats

def main():
    # Load mappings
    print("📖 Loading email-to-account mappings...")
    mappings = load_mappings()
    email_to_account = mappings['email_to_account']

    print(f"✅ Loaded {len(email_to_account)} email mappings")

    # Initialize Supabase client
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not found in environment variables")
        print("   Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file")
        sys.exit(1)

    print("🔗 Connecting to Supabase...")
    supabase: Client = create_client(supabase_url, supabase_key)

    # Get all transcripts in batches
    print("📊 Fetching transcripts from database...")

    all_transcripts = []
    offset = 0
    batch_size = 1000

    while True:
        try:
            result = supabase.table('diio_transcripts').select(
                'id, diio_transcript_id, attendees, client_platform_id, account_name'
            ).range(offset, offset + batch_size - 1).execute()

            if not result.data:
                break

            all_transcripts.extend(result.data)
            offset += batch_size

            print(f"📄 Loaded {len(result.data)} transcripts (total: {len(all_transcripts)})")

            # Safety limit
            if offset > 100000:
                print("⚠️ Reached safety limit of 100,000 transcripts")
                break

        except Exception as e:
            print(f"❌ Error fetching transcripts: {e}")
            sys.exit(1)

    print(f"✅ Loaded {len(all_transcripts)} total transcripts")

    # Process transcripts
    print("\n🔄 Processing transcripts for churned account matches...")
    stats = process_transcripts_batch(supabase, all_transcripts, email_to_account)

    # Print final statistics
    print("\n📊 Final Statistics:")
    print(f"   - Total transcripts processed: {stats['processed']}")
    print(f"   - Transcripts with customer emails: {stats['matched']}")
    print(f"   - Transcripts updated: {stats['updated']}")
    print(f"   - Update errors: {stats['errors']}")

    if stats['matched'] > 0:
        success_rate = (stats['updated'] / stats['matched']) * 100
        print(f"   - Success rate: {success_rate:.1f}%")
    print("\n✅ Script completed successfully!")

if __name__ == '__main__':
    main()
