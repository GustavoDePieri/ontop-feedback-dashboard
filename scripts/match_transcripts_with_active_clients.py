#!/usr/bin/env python3
"""
Script to match transcript emails with active accounts CSV data.
Updates diio_transcripts table with client_platform_id, account_name, and account_status = 'active'.
Only processes transcripts where client_platform_id IS NULL.
"""

import csv
import os
import sys
import json
from pathlib import Path
from typing import Dict, List, Set, Optional

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
    Parse the active accounts CSV file and create email-to-account mapping.
    Returns: Dict[email, {client_platform_id, account_name, customer_success_path}]
    """
    email_to_account = {}

    print(f"Reading CSV file: {csv_path}")

    # Detect encoding
    encoding = 'utf-8'
    if chardet:
        with open(csv_path, 'rb') as f:
            raw_data = f.read()
            detected = chardet.detect(raw_data)
            encoding = detected.get('encoding', 'utf-8')
            print(f"Detected encoding: {encoding}")

    with open(csv_path, 'r', encoding=encoding, errors='replace') as f:
        reader = csv.DictReader(f)

        print(f"Detected headers: {reader.fieldnames}")

        for row in reader:
            client_platform_id = row['Client Platform ID'].strip('"')
            account_name = row['Account Name'].strip('"')
            email = row['Email'].strip('"').lower().strip()  # Normalize to lowercase and strip
            customer_success_path = row['Customer Success Path'].strip('"')

            # Only process ACTIVE accounts (exclude any marked as churned)
            if customer_success_path.lower() not in ['churned', 'churn']:
                if email:  # Skip empty emails
                    email_to_account[email] = {
                        'client_platform_id': client_platform_id,
                        'account_name': account_name,
                        'customer_success_path': customer_success_path,
                        'account_status': 'active'
                    }

    print(f"Parsed {len(email_to_account)} unique emails from active accounts CSV")
    return email_to_account

def extract_customer_emails(attendees_data: any) -> List[str]:
    """
    Extract emails from attendees field. Handles format as JSON array of JSON strings.
    """
    emails = []

    if not attendees_data:
        return emails

    # If attendees is a string, try to parse as JSON
    if isinstance(attendees_data, str):
        try:
            attendees_data = json.loads(attendees_data)
        except json.JSONDecodeError:
            return emails

    # If it's a list of strings (each string is JSON object)
    if isinstance(attendees_data, list):
        for item in attendees_data:
            if isinstance(item, str):
                try:
                    attendee_obj = json.loads(item)
                    if isinstance(attendee_obj, dict) and 'email' in attendee_obj:
                        email = attendee_obj['email']
                        if email and isinstance(email, str):
                            emails.append(email.lower().strip())
                except json.JSONDecodeError:
                    continue
            elif isinstance(item, dict) and 'email' in item:
                email = item['email']
                if email and isinstance(email, str):
                    emails.append(email.lower().strip())

    # Fallback: if it's a dict with 'customers' key
    elif isinstance(attendees_data, dict):
        customers = attendees_data.get('customers', [])
        if isinstance(customers, list):
            for customer in customers:
                if isinstance(customer, dict) and 'email' in customer:
                    email = customer['email']
                    if email and isinstance(email, str):
                        emails.append(email.lower().strip())

    return list(set(emails))  # Remove duplicates

def find_matching_account(customer_emails: List[str], email_to_account: Dict) -> Optional[Dict]:
    """
    Find the account that matches any of the customer emails.
    """
    for email in customer_emails:
        if email in email_to_account:
            return email_to_account[email]
    return None

def update_transcript_with_active_account(supabase: Client, transcript_id: str, account_info: Dict) -> bool:
    """
    Update a transcript with active account information.
    """
    try:
        update_data = {
            'client_platform_id': account_info['client_platform_id'],
            'account_name': account_info['account_name'],
            'account_status': 'active',
            'updated_at': 'now()'  # Use SQL now() function
        }

        result = supabase.table('diio_transcripts').update(update_data).eq('id', transcript_id).execute()

        if result.data and len(result.data) > 0:
            print(f"Updated transcript {transcript_id[:8]}... -> {account_info['account_name']} (ACTIVE)")
            return True
        else:
            print(f"No rows updated for transcript {transcript_id}")
            return False

    except Exception as e:
        print(f"ERROR updating transcript {transcript_id}: {e}")
        return False

def process_transcripts_batch(supabase: Client, transcripts: List[Dict], email_to_account: Dict, batch_size: int = 50) -> Dict:
    """
    Process a batch of transcripts and update those that match active accounts.
    """
    stats = {
        'processed': 0,
        'with_emails': 0,
        'matched': 0,
        'updated': 0,
        'skipped_already_assigned': 0,
        'errors': 0
    }

    for i in range(0, len(transcripts), batch_size):
        batch = transcripts[i:i + batch_size]
        print(f"Processing batch {i//batch_size + 1} ({len(batch)} transcripts)...")

        for transcript in batch:
            stats['processed'] += 1

            # Skip if already assigned
            if transcript.get('client_platform_id') is not None:
                stats['skipped_already_assigned'] += 1
                continue

            # Extract customer emails from attendees
            customer_emails = extract_customer_emails(transcript.get('attendees'))
            
            if customer_emails:
                stats['with_emails'] += 1

                # Find matching account
                account_match = find_matching_account(customer_emails, email_to_account)

                if account_match:
                    stats['matched'] += 1

                    # Update the transcript
                    success = update_transcript_with_active_account(supabase, transcript['id'], account_match)
                    if success:
                        stats['updated'] += 1
                    else:
                        stats['errors'] += 1
                else:
                    print(f"   No match for emails: {', '.join(customer_emails[:3])}... in transcript {transcript['id'][:8]}")
            else:
                print(f"   No customer emails found in attendees for transcript {transcript['id'][:8]}")

    return stats

def main():
    # Path to the CSV file
    csv_path = project_root / 'activeClients.csv'

    if not csv_path.exists():
        print(f"ERROR: CSV file not found: {csv_path}")
        sys.exit(1)

    # Parse the CSV for active accounts
    email_to_account = parse_active_accounts_csv(str(csv_path))

    if len(email_to_account) == 0:
        print("ERROR: No active accounts found in CSV.")
        sys.exit(1)

    # Print some statistics
    print("\nActive Accounts Statistics:")
    print(f"   - Total unique emails: {len(email_to_account)}")

    # Show sample mappings
    print("\nSample active account mappings:")
    sample_emails = list(email_to_account.keys())[:5]
    for email in sample_emails:
        account = email_to_account[email]
        print(f"   {email} -> {account['account_name']} ({account['client_platform_id']})")

    # Initialize Supabase client (use service role for updates)
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY') or os.getenv('SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        print("ERROR: Supabase credentials not found in environment variables")
        print("   Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY/SUPABASE_ANON_KEY)")
        sys.exit(1)

    print("\nConnecting to Supabase...")
    supabase: Client = create_client(supabase_url, supabase_key)

    # Get transcripts that don't have client_platform_id (unassigned)
    print("\nFetching unassigned transcripts (client_platform_id IS NULL)...")

    all_transcripts = []
    offset = 0
    batch_size = 1000  # Large batches for efficiency

    while True:
        try:
            # Fetch transcripts without client_platform_id and with attendees data
            query = supabase.table('diio_transcripts').select(
                'id, diio_transcript_id, source_name, occurred_at, attendees, client_platform_id'
            ).is_('client_platform_id', None).not_.is_('attendees', None).range(offset, offset + batch_size - 1)
            result = query.execute()

            if not result.data:
                break

            all_transcripts.extend(result.data)
            offset += batch_size
            print(f"   Loaded {len(result.data)} unassigned transcripts (total: {len(all_transcripts)})")

            # Safety limit
            if offset > 100000:
                print("Reached safety limit of 100,000 transcripts")
                break

        except Exception as e:
            print(f"ERROR fetching transcripts: {e}")
            sys.exit(1)

    print(f"\nFound {len(all_transcripts)} unassigned transcripts with attendees data")

    if len(all_transcripts) == 0:
        print("\nNo unassigned transcripts to process. All are already matched!")
        return

    # Process transcripts
    print("\nProcessing transcripts for active account matches...")
    stats = process_transcripts_batch(supabase, all_transcripts, email_to_account)

    # Print final statistics
    print("\nFinal Statistics:")
    print(f"   - Total unassigned transcripts processed: {stats['processed']}")
    print(f"   - Transcripts with customer emails: {stats['with_emails']}")
    print(f"   - Potential matches found: {stats['matched']}")
    print(f"   - Successfully updated: {stats['updated']}")
    print(f"   - Update errors: {stats['errors']}")

    if stats['matched'] > 0:
        success_rate = (stats['updated'] / stats['matched']) * 100
        print(f"   - Success rate: {success_rate:.1f}%")

    print("\nSUCCESS: Active clients matching completed!")
    print("   Run sentiment analysis next to process matched transcripts.")

if __name__ == '__main__':
    main()
