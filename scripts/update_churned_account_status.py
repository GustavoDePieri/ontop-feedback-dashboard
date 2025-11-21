#!/usr/bin/env python3
"""
Script to update existing churned transcripts with account_status = 'churned'.
This preserves the existing churned account tracking while adding the new status column.
"""

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
    print("ERROR: Supabase client not installed. Run: pip install -r requirements.txt")
    sys.exit(1)

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def update_churned_transcripts_status(supabase: Client) -> Dict:
    """Update all transcripts with client_platform_id to have account_status = 'churned'."""
    stats = {
        'found': 0,
        'updated': 0,
        'errors': 0
    }

    try:
        # First, count how many transcripts have client_platform_id set
        count_result = supabase.table('diio_transcripts').select(
            'id', count='exact'
        ).not_('client_platform_id', 'is', None).execute()

        stats['found'] = count_result.count if hasattr(count_result, 'count') else len(count_result.data)

        print(f"Found {stats['found']} transcripts with client_platform_id set")

        if stats['found'] == 0:
            print("INFO: No transcripts found with client_platform_id. Run the churned accounts matching script first.")
            return stats

        # Update all transcripts with client_platform_id to have account_status = 'churned'
        update_result = supabase.table('diio_transcripts').update({
            'account_status': 'churned'
        }).neq('client_platform_id', None).execute()

        stats['updated'] = len(update_result.data) if update_result.data else 0

        print(f"SUCCESS: Updated {stats['updated']} transcripts with account_status = 'churned'")

        # Verify the updates
        verify_result = supabase.table('diio_transcripts').select(
            'account_status', count='exact'
        ).eq('account_status', 'churned').execute()

        verified_count = verify_result.count if hasattr(verify_result, 'count') else len(verify_result.data)
        print(f"VERIFICATION: {verified_count} transcripts now have account_status = 'churned'")

    except Exception as e:
        print(f"ERROR updating churned transcripts: {e}")
        stats['errors'] += 1

    return stats

def main():
    # Initialize Supabase client
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        print("ERROR: Supabase credentials not found in environment variables")
        print("   Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file")
        sys.exit(1)

    print("Connecting to Supabase...")
    supabase: Client = create_client(supabase_url, supabase_key)

    print("\nUpdating existing churned transcripts with account_status = 'churned'...")

    # Update churned transcripts
    stats = update_churned_transcripts_status(supabase)

    # Print final statistics
    print("\nUpdate Statistics:")
    print(f"   - Transcripts with client_platform_id: {stats['found']}")
    print(f"   - Updated with account_status: {stats['updated']}")
    print(f"   - Errors: {stats['errors']}")

    if stats['found'] > 0 and stats['updated'] > 0:
        success_rate = (stats['updated'] / stats['found']) * 100
        print(f"   - Success rate: {success_rate:.1f}%")

    if stats['errors'] == 0:
        print("\nSUCCESS: Successfully preserved existing churned account tracking!")
        print("   All existing churned transcripts now have account_status = 'churned'")
    else:
        print("\nWARNING: Completed with errors. Check the output above.")

if __name__ == '__main__':
    main()
