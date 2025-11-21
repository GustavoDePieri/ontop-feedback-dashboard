#!/usr/bin/env python3
"""
Script to match transcript emails with active accounts CSV data.
Updates diio_transcripts table with client_platform_id, account_name, and account_status = 'active'.
"""

import csv
import os
import sys
from pathlib import Path
from typing import Dict, List, Set
import json
try:
    import chardet
except ImportError:
    chardet = None

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def parse_active_accounts_csv(csv_path: str) -> Dict[str, Dict]:
    """
    Parse the active accounts CSV file and create mappings.
    Assumes the CSV has the same structure as churned accounts CSV.
    Returns:
        - email_to_account: Dict[email, {client_platform_id, account_name, customer_success_path}]
        - account_to_emails: Dict[client_platform_id, Set[emails]]
    """
    email_to_account = {}
    account_to_emails = {}

    print(f"📖 Reading CSV file: {csv_path}")

    # Detect encoding
    encoding = 'utf-8'
    if chardet:
        with open(csv_path, 'rb') as f:
            raw_data = f.read()
            detected = chardet.detect(raw_data)
            encoding = detected.get('encoding', 'utf-8')
            print(f"🔍 Detected encoding: {encoding}")

    with open(csv_path, 'r', encoding=encoding, errors='replace') as f:
        # Read with DictReader - first line contains headers
        reader = csv.DictReader(f)

        print(f"📋 Detected headers: {reader.fieldnames}")

        for row in reader:
            client_platform_id = row['Client Platform ID'].strip('"')
            account_name = row['Account Name'].strip('"')
            email = row['Email'].strip('"').lower()  # Normalize to lowercase
            customer_success_path = row['Customer Success Path'].strip('"')

            # Only process ACTIVE accounts (exclude churned ones)
            if customer_success_path.lower() not in ['churned']:
                # Create email to account mapping
                email_to_account[email] = {
                    'client_platform_id': client_platform_id,
                    'account_name': account_name,
                    'customer_success_path': customer_success_path,
                    'account_status': 'active'  # All non-churned are marked as active
                }

                # Create account to emails mapping
                if client_platform_id not in account_to_emails:
                    account_to_emails[client_platform_id] = set()
                account_to_emails[client_platform_id].add(email)

    print(f"✅ Parsed {len(email_to_account)} unique emails from {len(account_to_emails)} active accounts")
    return email_to_account, account_to_emails

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

def find_matching_account(customer_emails: List[str], email_to_account: Dict) -> Dict | None:
    """Find the account that matches any of the customer emails."""
    for email in customer_emails:
        if email in email_to_account:
            return email_to_account[email]

    return None

def update_transcript_with_active_account(supabase: Client, transcript_id: str, account_info: Dict) -> bool:
    """Update a transcript with active account information."""
    try:
        update_data = {
            'client_platform_id': account_info['client_platform_id'],
            'account_name': account_info['account_name'],
            'account_status': 'active'
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
    """Process a batch of transcripts and update those that match active accounts."""
    stats = {
        'processed': 0,
        'matched': 0,
        'updated': 0,
        'skipped_already_matched': 0,
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

                # Check if already has account info
                current_client_id = transcript.get('client_platform_id')
                current_account_name = transcript.get('account_name')
                current_status = transcript.get('account_status')

                # Skip if already matched (either churned or active)
                if current_client_id and current_status:
                    stats['skipped_already_matched'] += 1
                    continue

                # Update the transcript
                success = update_transcript_with_active_account(supabase, transcript['id'], account_match)
                if success:
                    stats['updated'] += 1
                    print(f"✅ Updated transcript {transcript['id'][:8]}... -> {account_match['account_name']} (ACTIVE)")
                else:
                    stats['errors'] += 1

    return stats

def main():
    # Path to the CSV file (same as churned accounts for now)
    csv_path = project_root / 'churnsAccounts2.csv'

    if not csv_path.exists():
        print(f"❌ CSV file not found: {csv_path}")
        sys.exit(1)

    # Parse the CSV for active accounts
    email_to_account, account_to_emails = parse_active_accounts_csv(str(csv_path))

    if len(email_to_account) == 0:
        print("❌ No active accounts found in CSV. Check the 'Customer Success Path' values.")
        sys.exit(1)

    # Print some statistics
    print("\n📊 Active Accounts Statistics:")
    print(f"   - Total unique emails: {len(email_to_account)}")
    print(f"   - Total accounts: {len(account_to_emails)}")

    # Show sample mappings
    print("\n📋 Sample active account mappings:")
    sample_emails = list(email_to_account.keys())[:5]
    for email in sample_emails:
        account = email_to_account[email]
        print(f"   {email} -> {account['account_name']} ({account['client_platform_id']}) - {account['customer_success_path']}")

    # Show accounts with most emails
    print("\n🏢 Active accounts with most emails:")
    sorted_accounts = sorted(account_to_emails.items(), key=lambda x: len(x[1]), reverse=True)[:5]
    for client_id, emails in sorted_accounts:
        account_name = email_to_account[list(emails)[0]]['account_name']
        print(f"   {account_name} ({client_id}): {len(emails)} emails")

    # Initialize Supabase client
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not found in environment variables")
        print("   Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file")
        sys.exit(1)

    print("\n🔗 Connecting to Supabase...")
    supabase: Client = create_client(supabase_url, supabase_key)

    # Get all transcripts in batches (only those without account_status set)
    print("📊 Fetching transcripts that don't have account status set...")

    all_transcripts = []
    offset = 0
    batch_size = 1000

    while True:
        try:
            result = supabase.table('diio_transcripts').select(
                'id, diio_transcript_id, attendees, client_platform_id, account_name, account_status'
            ).is_('account_status', None).range(offset, offset + batch_size - 1).execute()

            if not result.data:
                break

            all_transcripts.extend(result.data)
            offset += batch_size

            print(f"📄 Loaded {len(result.data)} unmatched transcripts (total: {len(all_transcripts)})")

            # Safety limit
            if offset > 100000:
                print("⚠️ Reached safety limit of 100,000 transcripts")
                break

        except Exception as e:
            print(f"❌ Error fetching transcripts: {e}")
            sys.exit(1)

    print(f"✅ Loaded {len(all_transcripts)} transcripts without account status")

    # Process transcripts
    print("\n🔄 Processing transcripts for active account matches...")
    stats = process_transcripts_batch(supabase, all_transcripts, email_to_account)

    # Print final statistics
    print("\n📊 Final Statistics:")
    print(f"   - Total transcripts processed: {stats['processed']}")
    print(f"   - Transcripts with customer emails: {stats['matched']}")
    print(f"   - Transcripts updated with active status: {stats['updated']}")
    print(f"   - Transcripts skipped (already matched): {stats['skipped_already_matched']}")
    print(f"   - Update errors: {stats['errors']}")

    if stats['matched'] > 0:
        success_rate = (stats['updated'] / (stats['matched'] - stats['skipped_already_matched'])) * 100 if (stats['matched'] - stats['skipped_already_matched']) > 0 else 0
        print(".1f")

    print("\n✅ Active accounts matching completed!")
    print("   Transcripts are now tagged with account_status = 'active' where applicable")

if __name__ == '__main__':
    main()
