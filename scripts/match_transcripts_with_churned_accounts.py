#!/usr/bin/env python3
"""
Script to match transcript emails with churned accounts CSV data.
Updates diio_transcripts table with client_platform_id and account_name.
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

def parse_churned_accounts_csv(csv_path: str) -> Dict[str, Dict]:
    """
    Parse the churnedAccounts.csv file and create mappings.
    Returns:
        - email_to_account: Dict[email, {client_platform_id, account_name}]
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

            # Only process churned accounts
            if customer_success_path.lower() == 'churned':
                # Create email to account mapping
                email_to_account[email] = {
                    'client_platform_id': client_platform_id,
                    'account_name': account_name,
                    'customer_success_path': customer_success_path
                }

                # Create account to emails mapping
                if client_platform_id not in account_to_emails:
                    account_to_emails[client_platform_id] = set()
                account_to_emails[client_platform_id].add(email)

    print(f"✅ Parsed {len(email_to_account)} unique emails from {len(account_to_emails)} accounts")
    return email_to_account, account_to_emails

def main():
    # Path to the CSV file
    csv_path = project_root / 'churnedAccounts.csv'

    if not csv_path.exists():
        print(f"❌ CSV file not found: {csv_path}")
        sys.exit(1)

    # Parse the CSV
    email_to_account, account_to_emails = parse_churned_accounts_csv(str(csv_path))

    # Print some statistics
    print("\n📊 Statistics:")
    print(f"   - Total unique emails: {len(email_to_account)}")
    print(f"   - Total accounts: {len(account_to_emails)}")

    # Show sample mappings
    print("\n📋 Sample email mappings:")
    sample_emails = list(email_to_account.keys())[:5]
    for email in sample_emails:
        account = email_to_account[email]
        print(f"   {email} -> {account['account_name']} ({account['client_platform_id']})")

    # Show accounts with most emails
    print("\n🏢 Accounts with most emails:")
    sorted_accounts = sorted(account_to_emails.items(), key=lambda x: len(x[1]), reverse=True)[:5]
    for client_id, emails in sorted_accounts:
        account_name = email_to_account[list(emails)[0]]['account_name']
        print(f"   {account_name} ({client_id}): {len(emails)} emails")

    # Save the mappings for later use
    mappings_file = project_root / 'churned_accounts_mappings.json'
    with open(mappings_file, 'w', encoding='utf-8') as f:
        json.dump({
            'email_to_account': email_to_account,
            'account_to_emails': {k: list(v) for k, v in account_to_emails.items()},
            'stats': {
                'total_emails': len(email_to_account),
                'total_accounts': len(account_to_emails),
                'csv_path': str(csv_path)
            }
        }, f, indent=2, ensure_ascii=False)

    print(f"\n💾 Saved mappings to: {mappings_file}")

if __name__ == '__main__':
    main()
