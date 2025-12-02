"""
ETL Pipeline for Zendesk Conversations
Extracts, transforms, and loads ticket conversations to Supabase

Usage:
    python etl_pipeline.py                    # Use last sync time
    python etl_pipeline.py 1704067200         # Start from specific timestamp
    python etl_pipeline.py --max-tickets 100  # Limit tickets per run
"""

import os
import sys
import json
import time
import logging
from datetime import datetime
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Import your existing extraction function
# We'll import it directly from your script
sys.path.append(os.path.dirname(__file__))
from extract_messaging_conversations import extract_messaging_conversation

# Try to import Supabase (install with: pip install supabase)
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("⚠️  Supabase not installed. Install with: pip install supabase")
    print("   For now, ETL will save to JSON files only.")

# Load environment variables
load_dotenv()

# ============================================================
# CONFIGURATION
# ============================================================
ZENDESK_SUBDOMAIN = os.getenv("ZENDESK_SUBDOMAIN", "getontop")
ZENDESK_EMAIL = os.getenv("ZENDESK_EMAIL")
ZENDESK_API_TOKEN = os.getenv("ZENDESK_API_TOKEN")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")  # Support both variable names

# ETL Configuration
JOB_NAME = "zendesk_conversations_etl"
BATCH_SIZE = 50  # Process tickets in batches
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds
RATE_LIMIT_DELAY = 1  # seconds between API calls

# ============================================================
# LOGGING SETUP
# ============================================================
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'{log_dir}/etl_pipeline_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ============================================================
# SUPABASE CLIENT INITIALIZATION
# ============================================================
supabase: Optional[Client] = None
if SUPABASE_AVAILABLE and SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("✅ Supabase client initialized")
    except Exception as e:
        logger.warning(f"⚠️  Could not initialize Supabase: {e}")
        supabase = None
else:
    logger.warning("⚠️  Supabase not configured - will save to JSON files only")

# ============================================================
# ETL STATE MANAGEMENT
# ============================================================
def get_etl_state() -> Optional[Dict]:
    """Get current ETL state from database or file."""
    if supabase:
        try:
            result = supabase.table('etl_state')\
                .select('*')\
                .eq('job_name', JOB_NAME)\
                .execute()
            
            if result.data:
                return result.data[0]
        except Exception as e:
            logger.warning(f"Could not get ETL state from Supabase: {e}")
    
    # Fallback to file
    state_file = 'etl_state.json'
    if os.path.exists(state_file):
        try:
            with open(state_file, 'r') as f:
                return json.load(f)
        except:
            pass
    
    return None

def save_etl_state(state_data: Dict):
    """Save ETL state to database or file."""
    state_data['job_name'] = JOB_NAME
    state_data['updated_at'] = datetime.utcnow().isoformat()
    
    if supabase:
        try:
            supabase.table('etl_state').upsert(
                state_data,
                on_conflict='job_name'
            ).execute()
            return
        except Exception as e:
            logger.warning(f"Could not save ETL state to Supabase: {e}")
    
    # Fallback to file
    state_file = 'etl_state.json'
    with open(state_file, 'w') as f:
        json.dump(state_data, f, indent=2)

# ============================================================
# TRANSFORM FUNCTIONS
# ============================================================
def transform_ticket_data(client_level_data: Dict) -> Dict:
    """Transform client-level data to single table format."""
    sla = client_level_data.get('sla_metrics', {})
    conversation = client_level_data.get('conversation', [])
    
    # Transform conversation to simple format
    conversation_json = []
    for msg in conversation:
        conversation_json.append({
            'message_id': msg.get('message_id'),
            'timestamp': msg.get('created_at') or msg.get('timestamp'),
            'author_name': msg.get('actor_name') or msg.get('author_name'),
            'author_type': msg.get('actor_type') or msg.get('author_type'),
            'message_text': msg.get('message') or msg.get('message_text', ''),
            'message_type': msg.get('message_type', 'text')
        })
    
    return {
        'ticket_id': client_level_data.get('ticket_id'),
        'subject': client_level_data.get('subject'),
        'status': client_level_data.get('status'),
        'priority': client_level_data.get('priority'),
        'created_at': client_level_data.get('created_at'),
        'updated_at': client_level_data.get('updated_at'),
        'via_channel': client_level_data.get('via_channel'),
        
        # Business identifiers
        'client_id': client_level_data.get('client_id'),
        'client_name': client_level_data.get('client_name'),
        'worker_id': client_level_data.get('worker_id'),
        'worker_name': client_level_data.get('worker_name'),
        'worker_email': client_level_data.get('worker_email'),
        'contract_id': client_level_data.get('contract_id'),
        
        # Requester information
        'requester_id': client_level_data.get('requester_id'),
        'requester_name': client_level_data.get('requester_name'),
        'requester_email': client_level_data.get('requester_email'),
        'is_external': client_level_data.get('is_external'),
        
        # Assignment
        'assignee_id': client_level_data.get('assignee_id'),
        'assignee_name': client_level_data.get('assignee_name'),
        'assignee_email': client_level_data.get('assignee_email'),
        'group_id': client_level_data.get('group_id'),
        'group_name': client_level_data.get('group_name'),
        'organization_id': client_level_data.get('organization_id'),
        
        # Classification
        'category': client_level_data.get('category'),
        'type_of_request': client_level_data.get('type_of_request'),
        'tags': client_level_data.get('tags', []),
        
        # SLA metrics
        'reply_time_in_minutes': sla.get('reply_time_in_minutes'),
        'first_resolution_time_in_minutes': sla.get('first_resolution_time_in_minutes'),
        'full_resolution_time_in_minutes': sla.get('full_resolution_time_in_minutes'),
        'reply_time_breached': sla.get('reply_time_breached'),
        'first_resolution_time_breached': sla.get('first_resolution_time_breached'),
        'full_resolution_time_breached': sla.get('full_resolution_time_breached'),
        'initially_assigned_at': sla.get('initially_assigned_at'),
        'solved_at': sla.get('solved_at'),
        
        # Complete conversation as JSONB
        'conversation': conversation_json,
        'conversation_source': client_level_data.get('conversation_source'),
        
        # Message counts
        'total_messages': len(conversation),
        'customer_messages_count': len([m for m in conversation if (m.get('actor_type') or m.get('author_type')) == 'end-user']),
        'agent_messages_count': len([m for m in conversation if (m.get('actor_type') or m.get('author_type')) == 'agent']),
    }

def transform_messages(conversation: List[Dict], ticket_data: Dict) -> List[Dict]:
    """Transform conversation messages to database format."""
    messages = []
    for msg in conversation:
        messages.append({
            'message_id': msg.get('message_id'),
            'ticket_id': ticket_data.get('ticket_id'),
            'message_text': msg.get('message') or msg.get('message_text', ''),
            'timestamp': msg.get('created_at') or msg.get('timestamp'),
            'author_name': msg.get('actor_name') or msg.get('author_name'),
            'author_type': msg.get('actor_type') or msg.get('author_type'),
            'message_type': msg.get('message_type', 'text'),
            'client_id': ticket_data.get('client_id'),
            'worker_id': ticket_data.get('worker_id'),
            'category': ticket_data.get('category'),
            'type_of_request': ticket_data.get('type_of_request'),
        })
    return messages

# ============================================================
# LOAD FUNCTIONS
# ============================================================
def load_conversation_to_supabase(ticket_data: Dict) -> bool:
    """Load complete conversation (ticket + messages) to single Supabase table."""
    if not supabase:
        return False
    
    try:
        transformed = transform_ticket_data(ticket_data)
        supabase.table('zendesk_conversations').upsert(
            transformed,
            on_conflict='ticket_id'
        ).execute()
        return True
    except Exception as e:
        logger.error(f"Error loading conversation {ticket_data.get('ticket_id')}: {e}")
        return False

def save_to_json_file(data: Dict, filename: str):
    """Fallback: Save data to JSON file if Supabase not available."""
    output_dir = "etl_output"
    os.makedirs(output_dir, exist_ok=True)
    
    filepath = os.path.join(output_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    logger.info(f"💾 Saved to {filepath}")

# ============================================================
# EXTRACT TICKETS (Incremental)
# ============================================================
import requests
import base64

def get_zendesk_headers():
    """Get Zendesk authentication headers."""
    credentials = f"{ZENDESK_EMAIL}/token:{ZENDESK_API_TOKEN}"
    encoded_creds = base64.b64encode(credentials.encode()).decode()
    return {
        "Authorization": f"Basic {encoded_creds}",
        "Content-Type": "application/json"
    }

def fetch_tickets_incremental(start_time: int, max_tickets: int = 1000) -> List[Dict]:
    """
    Fetch tickets using Zendesk incremental API.
    
    Returns list of ticket IDs to process.
    """
    tickets = []
    tickets_url = f"https://{ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/incremental/tickets.json?start_time={start_time}"
    headers = get_zendesk_headers()
    
    page_count = 0
    
    while tickets_url and len(tickets) < max_tickets:
        page_count += 1
        logger.info(f"Fetching tickets page {page_count}...")
        
        try:
            response = requests.get(tickets_url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            page_tickets = data.get('tickets', [])
            tickets.extend([t.get('id') for t in page_tickets if t.get('id')])
            
            logger.info(f"  Found {len(page_tickets)} tickets (Total: {len(tickets)})")
            
            # Get next page
            tickets_url = data.get('next_page')
            
            if data.get('end_of_stream', False):
                logger.info("  Reached end of stream")
                break
            
            # Rate limiting
            time.sleep(RATE_LIMIT_DELAY)
            
        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:
                logger.warning("  Rate limit hit, waiting 60 seconds...")
                time.sleep(60)
                continue
            else:
                logger.error(f"  HTTP Error: {e}")
                break
        except Exception as e:
            logger.error(f"  Error fetching tickets: {e}")
            break
    
    return tickets[:max_tickets]

# ============================================================
# MAIN ETL PIPELINE
# ============================================================
def run_etl_pipeline(start_time: Optional[int] = None, max_tickets: int = 50000):
    """
    Main ETL pipeline execution.
    
    Args:
        start_time: Unix timestamp to start from (None = use last sync)
        max_tickets: Maximum tickets to process in this run (default: 50000)
    """
    logger.info("="*80)
    logger.info("STARTING ZENDESK ETL PIPELINE")
    logger.info("="*80)
    
    # Get last sync state
    state = get_etl_state()
    if not start_time:
        if state and state.get('last_sync_timestamp'):
            start_time = state['last_sync_timestamp']
            logger.info(f"📅 Resuming from last sync: {datetime.fromtimestamp(start_time)}")
        else:
            # Default: January 1, 2025
            start_time = int(datetime(2025, 1, 1).timestamp())
            logger.info(f"📅 Starting from default (Jan 1, 2025): {datetime.fromtimestamp(start_time)}")
    else:
        logger.info(f"📅 Starting from provided timestamp: {datetime.fromtimestamp(start_time)}")
    
    # Update state to running
    save_etl_state({
        'status': 'running',
        'last_sync_timestamp': start_time,
        'last_run_at': datetime.utcnow().isoformat(),
        'records_processed': 0,
        'records_failed': 0
    })
    
    # Fetch ticket IDs
    logger.info(f"\n🔍 Fetching tickets since {datetime.fromtimestamp(start_time)}...")
    ticket_ids = fetch_tickets_incremental(start_time, max_tickets)
    logger.info(f"✅ Found {len(ticket_ids)} tickets to process\n")
    
    if not ticket_ids:
        logger.info("No tickets to process. Exiting.")
        save_etl_state({
            'status': 'completed',
            'last_sync_timestamp': int(datetime.now().timestamp()),
            'records_processed': 0,
            'records_failed': 0
        })
        return
    
    # Process tickets
    processed_count = 0
    failed_count = 0
    last_ticket_id = None
    
    for i, ticket_id in enumerate(ticket_ids, 1):
        last_ticket_id = ticket_id
        
        try:
            logger.info(f"[{i}/{len(ticket_ids)}] Processing ticket #{ticket_id}...")
            
            # Extract conversation using your existing function
            conversation_data = extract_messaging_conversation(ticket_id)
            
            if conversation_data and 'error' not in conversation_data:
                # Extract ticket_info and flatten for loading
                ticket_info = conversation_data.get('ticket_info', {})
                all_messages = conversation_data.get('all_messages', [])
                
                # Create client-level format for loading
                client_level_data = {
                    **ticket_info,
                    'ticket_id': ticket_info.get('ticket_id'),
                    'conversation': all_messages,
                    'total_messages': len(all_messages),
                    'customer_messages_count': len([m for m in all_messages if m.get('actor_type') == 'end-user']),
                    'agent_messages_count': len([m for m in all_messages if m.get('actor_type') == 'agent']),
                }
                
                # Filter: Only 2025 tickets
                created_at = ticket_info.get('created_at', '')
                if not created_at.startswith('2025'):
                    logger.info(f"  ⏭️  Skipping ticket (not from 2025)")
                    continue
                
                # Transform and load to single table
                if supabase:
                    conversation_loaded = load_conversation_to_supabase(client_level_data)
                    
                    if conversation_loaded:
                        msg_count = len(all_messages)
                        logger.info(f"  ✅ Loaded conversation with {msg_count} messages")
                        processed_count += 1
                    else:
                        logger.warning(f"  ⚠️  Failed to load conversation")
                        failed_count += 1
                else:
                    # Fallback: Save to JSON
                    save_to_json_file(
                        conversation_data,
                        f'ticket_{ticket_id}_client_level.json'
                    )
                    processed_count += 1
                    logger.info(f"  ✅ Saved to JSON (Supabase not available)")
            else:
                logger.warning(f"  ⚠️  Failed to extract conversation")
                failed_count += 1
            
            # Progress update
            if i % 10 == 0:
                logger.info(f"\n📊 Progress: {processed_count} processed, {failed_count} failed\n")
                save_etl_state({
                    'status': 'running',
                    'last_sync_timestamp': int(datetime.now().timestamp()),
                    'last_ticket_id': last_ticket_id,
                    'records_processed': processed_count,
                    'records_failed': failed_count
                })
            
            # Rate limiting
            time.sleep(RATE_LIMIT_DELAY)
            
        except Exception as e:
            logger.error(f"  ❌ Error processing ticket {ticket_id}: {e}")
            failed_count += 1
    
    # Update final state
    final_timestamp = int(datetime.now().timestamp())
    save_etl_state({
        'status': 'completed',
        'last_sync_timestamp': final_timestamp,
        'last_ticket_id': last_ticket_id,
        'last_success_at': datetime.utcnow().isoformat(),
        'records_processed': processed_count,
        'records_failed': failed_count
    })
    
    logger.info("="*80)
    logger.info(f"✅ ETL COMPLETED")
    logger.info(f"   Processed: {processed_count}")
    logger.info(f"   Failed: {failed_count}")
    logger.info(f"   Success Rate: {processed_count/(processed_count+failed_count)*100:.1f}%" if (processed_count+failed_count) > 0 else "N/A")
    logger.info("="*80)

# ============================================================
# MAIN EXECUTION
# ============================================================
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Zendesk ETL Pipeline')
    parser.add_argument('start_time', type=int, nargs='?', default=None,
                       help='Unix timestamp to start from (default: last sync)')
    parser.add_argument('--max-tickets', type=int, default=50000,
                       help='Maximum tickets to process (default: 50000)')
    
    args = parser.parse_args()
    
    run_etl_pipeline(start_time=args.start_time, max_tickets=args.max_tickets)

