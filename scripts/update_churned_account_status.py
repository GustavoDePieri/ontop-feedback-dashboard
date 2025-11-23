#!/usr/bin/env python3
"""
Script to update existing transcripts with proper account_status based on email matching.
This ensures active accounts are not incorrectly marked as churned.
"""

import os
import sys
from pathlib import Path
from typing import Dict, List, Set, Optional
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

try:
    from supabase import create_client, Client
except ImportError:
    print("ERROR: Supabase client not installed. Run: pip install -r requirements.txt")
    sys.exit(1)

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def load_churned_mappings() -> Dict:
    """Load the churned accounts email mappings."""
    mappings_file = project_root / 'churned_accounts_mappings.json'
    if not mappings_file.exists():
        print(f"ERROR: Churned accounts mappings file not found: {mappings_file}")
        print("   Run the churned accounts matching script first: py scripts/match_transcripts_with_churned_accounts.py")
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

def find_matching_churned_account(customer_emails: List[str], email_to_account: Dict) -> Optional[Dict]:
    """Find if any of the customer emails match churned accounts."""
    for email in customer_emails:
        if email in email_to_account:
            account_info = email_to_account[email]
            # Double-check that this is actually a churned account
            if account_info.get('customer_success_path', '').lower() == 'churned':
                return account_info

    return None

def update_transcript_statuses(supabase: Client, email_to_account: Dict) -> Dict:
    """Update transcripts with correct account_status based on email matching."""
    stats = {
        'processed': 0,
        'marked_churned': 0,
        'already_churned': 0,
        'marked_active': 0,
        'errors': 0
    }

    try:
        # Get all transcripts (we'll filter in Python to avoid query issues)
        transcripts_result = supabase.table('diio_transcripts').select(
            'id, attendees, client_platform_id, account_name, account_status'
        ).execute()

        all_transcripts = transcripts_result.data or []
        print(f"Found {len(all_transcripts)} total transcripts")

        # Filter to only transcripts with client_platform_id set but no account_status
        transcripts = [t for t in all_transcripts if t.get('client_platform_id') and not t.get('account_status')]
        print(f"Found {len(transcripts)} transcripts with client_platform_id that need account_status assignment")

        for transcript in transcripts:
            stats['processed'] += 1

            # Extract customer emails from attendees
            customer_emails = extract_customer_emails(transcript.get('attendees', {}))

            # Check if this matches a churned account
            churned_match = find_matching_churned_account(customer_emails, email_to_account)

            try:
                if churned_match:
                    # This is actually a churned account
                    supabase.table('diio_transcripts').update({
                        'account_status': 'churned'
                    }).eq('id', transcript['id']).execute()
                    stats['marked_churned'] += 1
                    print(f"✓ Marked as CHURNED: {transcript['id'][:8]}... ({churned_match['account_name']})")
                else:
                    # This is an active account (or should be treated as such)
                    supabase.table('diio_transcripts').update({
                        'account_status': 'active'
                    }).eq('id', transcript['id']).execute()
                    stats['marked_active'] += 1
                    print(f"✓ Marked as ACTIVE: {transcript['id'][:8]}... ({transcript.get('account_name', 'Unknown')})")

            except Exception as e:
                print(f"ERROR updating transcript {transcript['id']}: {e}")
                stats['errors'] += 1

    except Exception as e:
        print(f"ERROR processing transcripts: {e}")
        stats['errors'] += 1

    return stats

def main():
    # Load churned account mappings
    print("Loading churned account email mappings...")
    mappings = load_churned_mappings()
    email_to_account = mappings['email_to_account']

    print(f"Loaded {len(email_to_account)} churned account email mappings")

    # Initialize Supabase client
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        print("ERROR: Supabase credentials not found in environment variables")
        print("   Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file")
        sys.exit(1)

    print("Connecting to Supabase...")
    supabase: Client = create_client(supabase_url, supabase_key)

    print("\nProcessing transcripts to set correct account_status...")

    # Update transcript statuses based on email matching
    stats = update_transcript_statuses(supabase, email_to_account)

    # Print final statistics
    print("\nProcessing Statistics:")
    print(f"   - Total transcripts processed: {stats['processed']}")
    print(f"   - Marked as churned: {stats['marked_churned']}")
    print(f"   - Marked as active: {stats['marked_active']}")
    print(f"   - Already had churned status: {stats['already_churned']}")
    print(f"   - Errors: {stats['errors']}")

    total_successful = stats['marked_churned'] + stats['marked_active'] + stats['already_churned']
    if stats['processed'] > 0:
        success_rate = (total_successful / stats['processed']) * 100
        print(f"   - Success rate: {success_rate:.1f}%")

    if stats['errors'] == 0:
        print("\nSUCCESS: Account statuses have been correctly assigned!")
        print(f"   - {stats['marked_churned']} transcripts marked as churned (verified by email match)")
        print(f"   - {stats['marked_active']} transcripts marked as active (no churned email match)")
        print(f"   - {stats['already_churned']} transcripts were already correctly marked as churned")
    else:
        print("\nWARNING: Completed with errors. Check the output above.")

if __name__ == '__main__':
    main()
