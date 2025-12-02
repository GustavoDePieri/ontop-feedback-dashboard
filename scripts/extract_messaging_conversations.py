"""
Extract complete Zendesk Messaging conversations from ticket audits.

This script properly extracts the full messaging conversation history that's stored
in ChatStartedEvent audit events, not in the regular comments API.
"""

import requests
import base64
import json
import os
from datetime import datetime
from typing import List, Dict

# Configuration
SUBDOMAIN = os.getenv("ZENDESK_SUBDOMAIN", "getontop")
EMAIL = os.getenv("ZENDESK_EMAIL", "ahuanca@getontop.com")
API_TOKEN = os.getenv("ZENDESK_API_TOKEN", "QDxo5i8Qh3RRG8YQBa9vh8fx7WGuY9KOKXmlvptl")

# Custom Field Mapping (discovered via find_custom_fields.py)
CUSTOM_FIELD_MAPPING = {
    # Core business identifiers
    25216293967380: 'worker_id',          # CR053531
    25216324952596: 'worker_name',        # JESICA JOANA GALEANO
    26816172973460: 'worker_email',       # jesicajoanagaleano@gmail.com
    31327552618004: 'worker_phone',       # +5493435160521
    
    25216304678036: 'client_id',          # CL004862
    25216274102548: 'client_name',        # ESTUDIO ALFA WEB SLU
    33369429616276: 'client_country',     # spain_client_country
    
    31263554365076: 'contract_id',        # CA73413
    31057510448148: 'contract_type',      # TRADITIONAL
    31057535555860: 'contract_status',    # ACTIVE
    
    # Additional useful fields
    31283778196756: 'subscription_type',  # WANDERLUST, BASIC, etc.
    31283843391636: 'subscription_status',
    31084914040596: 'wallet_status',      # ACTIVATED
    31643656299540: 'wallet_balance',     # 0
    
    33369444478484: 'nationality_country',
    33369434173972: 'residence_country',
    31057708962196: 'document_number',    # 34121225
    
    22865771347348: 'category',           # wallet__quick_general_inquiries
    32273934250132: 'request_type',       # issue_request
}

# Authentication
credentials = f"{EMAIL}/token:{API_TOKEN}"
encoded_creds = base64.b64encode(credentials.encode()).decode()
HEADERS = {
    "Authorization": f"Basic {encoded_creds}",
    "Content-Type": "application/json"
}


def is_external_user(user_id: int, user_details: Dict = None) -> bool:
    """
    Determine if a user is external (worker/client) or internal (Ontop staff).
    
    External users are:
    - Workers or clients (role: end-user)
    - NOT from @getontop.com domain
    
    Internal users are:
    - Ontop staff (@getontop.com email)
    - Agents/admins (role: agent or admin)
    
    Args:
        user_id: The Zendesk user ID
        user_details: Optional pre-fetched user details to avoid extra API call
        
    Returns:
        True if external, False if internal
    """
    if not user_id:
        return False
    
    # Fetch user details if not provided
    if not user_details:
        user_details = fetch_user_details(user_id)
    
    email = user_details.get('email', '')
    role = user_details.get('role', '')
    
    # Internal: Ontop staff email domain
    if email and '@getontop.com' in email.lower():
        return False
    
    # Internal: Agents and admins
    if role in ['agent', 'admin']:
        return False
    
    # External: Everyone else (end-users from outside)
    return True


def fetch_ticket_comments(ticket_id: int) -> List[Dict]:
    """
    Fetch traditional ticket comments from Comments API.
    
    Used for tickets that don't have messaging conversations (web form, email).
    
    Args:
        ticket_id: The Zendesk ticket ID
        
    Returns:
        List of comment dictionaries
    """
    comments_url = f"https://{SUBDOMAIN}.zendesk.com/api/v2/tickets/{ticket_id}/comments.json"
    all_comments = []
    
    try:
        response = requests.get(comments_url, headers=HEADERS)
        response.raise_for_status()
        comments_data = response.json()
        comments = comments_data.get('comments', [])
        
        print(f"📝 Found {len(comments)} traditional comments")
        
        for comment in comments:
            # Skip empty comments
            if not comment.get('body'):
                continue
            
            formatted_comment = {
                'comment_id': comment.get('id'),
                'timestamp': comment.get('created_at'),
                'created_at': comment.get('created_at'),
                'author_id': comment.get('author_id'),
                'actor_type': 'agent' if comment.get('author_id') else 'system',
                'message': comment.get('body', ''),
                'public': comment.get('public', True),
                'via_channel': comment.get('via', {}).get('channel') if isinstance(comment.get('via'), dict) else None,
            }
            
            # Fetch author name
            author_id = comment.get('author_id')
            if author_id:
                author = fetch_user_details(author_id)
                formatted_comment['actor_name'] = author.get('name')
                formatted_comment['actor_email'] = author.get('email')
                
                # Determine actor type based on role
                author_role = author.get('role', 'end-user')
                if author_role == 'end-user':
                    formatted_comment['actor_type'] = 'end-user'
                elif author_role in ['agent', 'admin']:
                    formatted_comment['actor_type'] = 'agent'
            
            all_comments.append(formatted_comment)
        
        return all_comments
        
    except Exception as e:
        print(f"⚠️  Warning: Could not fetch comments: {e}")
        return []


def extract_custom_fields(ticket_data: Dict) -> Dict:
    """
    Extract custom fields from ticket and return as named dictionary.
    
    Args:
        ticket_data: Raw ticket object from API
        
    Returns:
        Dict with custom field names and values
    """
    custom_fields = {}
    
    for field in ticket_data.get('custom_fields', []):
        field_id = field.get('id')
        field_value = field.get('value')
        
        # If this field is in our mapping, add it with readable name
        if field_id in CUSTOM_FIELD_MAPPING:
            field_name = CUSTOM_FIELD_MAPPING[field_id]
            custom_fields[field_name] = field_value
    
    return custom_fields


def fetch_user_details(user_id: int) -> Dict:
    """
    Fetch user (assignee/requester) details from Zendesk.
    
    Args:
        user_id: The Zendesk user ID
    
    Returns:
        Dictionary with user name, email, and role
    """
    if not user_id:
        return {'name': None, 'email': None, 'role': None}
    
    user_url = f"https://{SUBDOMAIN}.zendesk.com/api/v2/users/{user_id}.json"
    
    try:
        response = requests.get(user_url, headers=HEADERS)
        response.raise_for_status()
        user_data = response.json().get('user', {})
        
        return {
            'name': user_data.get('name'),
            'email': user_data.get('email'),
            'role': user_data.get('role')
        }
    except Exception as e:
        print(f"⚠️  Warning: Could not fetch user {user_id}: {e}")
        return {'name': None, 'email': None, 'role': None}


def fetch_group_details(group_id: int) -> Dict:
    """
    Fetch group (team) details from Zendesk.
    
    Args:
        group_id: The Zendesk group ID
    
    Returns:
        Dictionary with group name
    """
    if not group_id:
        return {'name': None}
    
    group_url = f"https://{SUBDOMAIN}.zendesk.com/api/v2/groups/{group_id}.json"
    
    try:
        response = requests.get(group_url, headers=HEADERS)
        response.raise_for_status()
        group_data = response.json().get('group', {})
        
        return {
            'name': group_data.get('name')
        }
    except Exception as e:
        print(f"⚠️  Warning: Could not fetch group {group_id}: {e}")
        return {'name': None}


def fetch_sla_metrics(ticket_id: int) -> Dict:
    """
    Fetch SLA metrics for a ticket.
    
    Args:
        ticket_id: The Zendesk ticket ID
    
    Returns:
        Dictionary containing SLA metrics and breach information
    """
    metrics_url = f"https://{SUBDOMAIN}.zendesk.com/api/v2/tickets/{ticket_id}/metrics.json"
    
    try:
        response = requests.get(metrics_url, headers=HEADERS)
        response.raise_for_status()
        metrics_data = response.json().get('ticket_metric', {})
        
        # Extract SLA-related fields
        sla_metrics = {
            'reply_time_in_minutes': metrics_data.get('reply_time_in_minutes', {}).get('calendar') if isinstance(metrics_data.get('reply_time_in_minutes'), dict) else None,
            'first_resolution_time_in_minutes': metrics_data.get('first_resolution_time_in_minutes', {}).get('calendar') if isinstance(metrics_data.get('first_resolution_time_in_minutes'), dict) else None,
            'full_resolution_time_in_minutes': metrics_data.get('full_resolution_time_in_minutes', {}).get('calendar') if isinstance(metrics_data.get('full_resolution_time_in_minutes'), dict) else None,
            'agent_wait_time_in_minutes': metrics_data.get('agent_wait_time_in_minutes', {}).get('calendar') if isinstance(metrics_data.get('agent_wait_time_in_minutes'), dict) else None,
            'requester_wait_time_in_minutes': metrics_data.get('requester_wait_time_in_minutes', {}).get('calendar') if isinstance(metrics_data.get('requester_wait_time_in_minutes'), dict) else None,
            'on_hold_time_in_minutes': metrics_data.get('on_hold_time_in_minutes', {}).get('calendar') if isinstance(metrics_data.get('on_hold_time_in_minutes'), dict) else None,
            
            # Breach flags
            'reply_time_breached': metrics_data.get('reply_time_in_minutes', {}).get('breached') if isinstance(metrics_data.get('reply_time_in_minutes'), dict) else False,
            'first_resolution_time_breached': metrics_data.get('first_resolution_time_in_minutes', {}).get('breached') if isinstance(metrics_data.get('first_resolution_time_in_minutes'), dict) else False,
            'full_resolution_time_breached': metrics_data.get('full_resolution_time_in_minutes', {}).get('breached') if isinstance(metrics_data.get('full_resolution_time_in_minutes'), dict) else False,
            
            # Timestamps
            'initially_assigned_at': metrics_data.get('initially_assigned_at'),
            'assigned_at': metrics_data.get('assigned_at'),
            'solved_at': metrics_data.get('solved_at'),
            'latest_comment_added_at': metrics_data.get('latest_comment_added_at'),
        }
        
        return sla_metrics
        
    except Exception as e:
        print(f"⚠️  Warning: Could not fetch SLA metrics: {e}")
        return {
            'error': str(e),
            'reply_time_breached': None,
            'first_resolution_time_breached': None,
            'full_resolution_time_breached': None
        }


def extract_messaging_conversation(ticket_id: int) -> Dict:
    """
    Extract the COMPLETE messaging conversation from ticket audits.
    
    This is where the actual chat messages are stored for Zendesk Messaging tickets.
    
    Args:
        ticket_id: The Zendesk ticket ID
        
    Returns:
        Dictionary with ticket info and all messaging history
    """
    print(f"\n{'='*80}")
    print(f"EXTRACTING COMPLETE MESSAGING CONVERSATION: Ticket #{ticket_id}")
    print(f"{'='*80}\n")
    
    # Fetch ticket details
    ticket_url = f"https://{SUBDOMAIN}.zendesk.com/api/v2/tickets/{ticket_id}.json"
    ticket_info = {}
    
    try:
        response = requests.get(ticket_url, headers=HEADERS)
        response.raise_for_status()
        ticket_data = response.json().get('ticket', {})
        
        # Extract custom fields
        custom_fields = extract_custom_fields(ticket_data)
        
        ticket_info = {
            'ticket_id': ticket_id,
            'subject': ticket_data.get('subject'),
            'status': ticket_data.get('status'),
            'priority': ticket_data.get('priority'),
            'created_at': ticket_data.get('created_at'),
            'updated_at': ticket_data.get('updated_at'),
            'requester_id': ticket_data.get('requester_id'),
            'assignee_id': ticket_data.get('assignee_id'),
            'group_id': ticket_data.get('group_id'),
            'organization_id': ticket_data.get('organization_id'),
            'via_channel': ticket_data.get('via', {}).get('channel') if isinstance(ticket_data.get('via'), dict) else None,
            'tags': ticket_data.get('tags', []),
            
            # Business identifiers (flattened for easy access)
            'worker_id': custom_fields.get('worker_id'),
            'worker_name': custom_fields.get('worker_name'),
            'worker_email': custom_fields.get('worker_email'),
            'client_id': custom_fields.get('client_id'),
            'client_name': custom_fields.get('client_name'),
            'contract_id': custom_fields.get('contract_id'),
            
            # All custom fields
            'custom_fields': custom_fields,
        }
        
        print(f"📋 Ticket: {ticket_info['subject']}")
        print(f"   Status: {ticket_info['status']}")
        print(f"   Priority: {ticket_info['priority']}")
        print(f"   Channel: {ticket_info.get('via_channel')}")
        print(f"   Tags: {len(ticket_info.get('tags', []))} tags")
        print(f"\n🔑 Business Context:")
        print(f"   Worker ID: {ticket_info.get('worker_id')}")
        print(f"   Client ID: {ticket_info.get('client_id')}")
        print(f"   Contract ID: {ticket_info.get('contract_id')}")
        
        # Fetch SLA metrics
        print(f"\n⏱️  Fetching SLA metrics...")
        sla_metrics = fetch_sla_metrics(ticket_id)
        ticket_info['sla_metrics'] = sla_metrics
        
        if 'error' not in sla_metrics:
            print(f"   Reply time breached: {sla_metrics.get('reply_time_breached')}")
            print(f"   First resolution breached: {sla_metrics.get('first_resolution_time_breached')}")
        
        # Fetch assignee details
        assignee_id = ticket_data.get('assignee_id')
        if assignee_id:
            print(f"\n👤 Fetching assignee details...")
            assignee = fetch_user_details(assignee_id)
            ticket_info['assignee_name'] = assignee.get('name')
            ticket_info['assignee_email'] = assignee.get('email')
            if assignee.get('name'):
                print(f"   Assignee: {assignee.get('name')}")
        
        # Fetch group details
        group_id = ticket_data.get('group_id')
        if group_id:
            print(f"\n👥 Fetching group details...")
            group = fetch_group_details(group_id)
            ticket_info['group_name'] = group.get('name')
            if group.get('name'):
                print(f"   Group: {group.get('name')}")
        
        # Fetch requester details and determine if external
        requester_id = ticket_data.get('requester_id')
        if requester_id:
            print(f"\n🔍 Determining ticket origin...")
            requester = fetch_user_details(requester_id)
            ticket_info['requester_name'] = requester.get('name')
            ticket_info['requester_email'] = requester.get('email')
            
            # Check if this is an external user (worker/client) or internal (Ontop staff)
            is_external = is_external_user(requester_id, requester)
            ticket_info['is_external'] = is_external
            
            origin = "🌍 EXTERNAL (Worker/Client)" if is_external else "🏢 INTERNAL (Ontop Staff)"
            print(f"   Origin: {origin}")
            print(f"   Requester: {requester.get('name')} ({requester.get('email')})")
        else:
            ticket_info['is_external'] = None
        
        # Add category and type from custom fields
        ticket_info['category'] = custom_fields.get('category')
        ticket_info['type_of_request'] = custom_fields.get('request_type')
        
        print()
        
    except Exception as err:
        print(f"❌ Error fetching ticket: {err}")
        return {'error': str(err)}
    
    # Fetch audits
    audits_url = f"https://{SUBDOMAIN}.zendesk.com/api/v2/tickets/{ticket_id}/audits.json"
    all_messages = []
    chat_sessions = []
    
    try:
        response = requests.get(audits_url, headers=HEADERS)
        response.raise_for_status()
        audits = response.json().get('audits', [])
        
        print(f"🔍 Found {len(audits)} audit entries\n")
        
        # Extract all ChatStartedEvent entries (these contain the messaging history)
        for audit in audits:
            events = audit.get('events', [])
            
            for event in events:
                if event.get('type') == 'ChatStartedEvent':
                    event_value = event.get('value', {})
                    history = event_value.get('history', [])
                    
                    if history:
                        print(f"💬 Found chat session with {len(history)} messages")
                        print(f"   Chat ID: {event_value.get('chat_id')}")
                        print(f"   Started: {audit.get('created_at')}\n")
                        
                        chat_session = {
                            'chat_id': event_value.get('chat_id'),
                            'started_at': audit.get('created_at'),
                            'conversation_id': event_value.get('conversation_id'),
                            'integration_id': event_value.get('integration_id'),
                            'messages': []
                        }
                        
                        # Extract each message from history
                        for msg in history:
                            msg_type = msg.get('type')
                            
                            # Only process actual messages, skip status updates
                            if msg_type in ['ChatMessage', 'ChatFileAttachment']:
                                formatted_msg = {
                                    'message_id': msg.get('message_id'),
                                    'timestamp': msg.get('timestamp'),
                                    'created_at': datetime.fromtimestamp(msg.get('timestamp', 0) / 1000).isoformat() if msg.get('timestamp') else None,
                                    'actor_name': msg.get('actor_name'),
                                    'actor_id': msg.get('actor_id'),
                                    'actor_type': msg.get('actor_type'),  # end-user, agent, system
                                    'message_type': msg.get('original_message_type'),
                                    'message': msg.get('message', ''),
                                    'chat_index': msg.get('chat_index'),
                                }
                                
                                # Add file info if it's an attachment
                                if msg_type == 'ChatFileAttachment':
                                    formatted_msg['attachment_url'] = msg.get('url')
                                    formatted_msg['filename'] = msg.get('filename')
                                    formatted_msg['mime_type'] = msg.get('mime_type')
                                
                                chat_session['messages'].append(formatted_msg)
                                all_messages.append(formatted_msg)
                        
                        chat_sessions.append(chat_session)
        
        # If no messaging conversation found, fall back to traditional comments
        if not all_messages:
            print(f"\n⚠️  No messaging conversation found. Trying traditional Comments API...")
            traditional_comments = fetch_ticket_comments(ticket_id)
            
            if traditional_comments:
                all_messages = traditional_comments
                print(f"✅ Extracted {len(traditional_comments)} comments from Comments API")
                ticket_info['conversation_source'] = 'comments_api'
            else:
                print(f"⚠️  No comments found in Comments API either")
                ticket_info['conversation_source'] = 'none'
        else:
            ticket_info['conversation_source'] = 'messaging'
        
        print(f"\n{'='*80}")
        print(f"✅ EXTRACTION COMPLETE")
        print(f"{'='*80}")
        print(f"Conversation source: {ticket_info.get('conversation_source')}")
        print(f"Total chat sessions: {len(chat_sessions)}")
        print(f"Total messages extracted: {len(all_messages)}")
        print(f"{'='*80}\n")
        
        return {
            'ticket_info': ticket_info,
            'chat_sessions': chat_sessions,
            'all_messages': all_messages,
            'total_messages': len(all_messages),
            'total_sessions': len(chat_sessions)
        }
        
    except Exception as err:
        print(f"❌ Error: {err}")
        return {'error': str(err)}


def print_conversation(conversation_data: Dict, show_system_messages: bool = False):
    """
    Display the conversation in a readable format.
    
    Args:
        conversation_data: Output from extract_messaging_conversation()
        show_system_messages: Whether to show automated system messages
    """
    if 'error' in conversation_data:
        print(f"❌ Error: {conversation_data['error']}")
        return
    
    ticket_info = conversation_data.get('ticket_info', {})
    all_messages = conversation_data.get('all_messages', [])
    
    print(f"\n{'='*80}")
    print(f"🎫 TICKET #{ticket_info.get('ticket_id')}: {ticket_info.get('subject')}")
    print(f"{'='*80}\n")
    
    message_count = 0
    for msg in all_messages:
        actor_type = msg.get('actor_type')
        
        # Skip system messages if not requested
        if not show_system_messages and actor_type == 'system':
            continue
        
        message_count += 1
        
        # Emoji based on actor type
        if actor_type == 'end-user':
            emoji = "👤"
        elif actor_type == 'agent':
            emoji = "👨‍💼"
        else:
            emoji = "🤖"
        
        print(f"[{message_count}] {emoji} {msg.get('actor_name', 'Unknown')}")
        print(f"    {msg.get('created_at')} | {actor_type}")
        
        message_text = msg.get('message', '').strip()
        if msg.get('message_type') == 'image':
            print(f"    📎 Image: {msg.get('filename')}")
            print(f"    URL: {msg.get('attachment_url')}")
        elif message_text:
            print(f"    {message_text}")
        
        print()
    
    print(f"{'='*80}")
    print(f"Total messages displayed: {message_count}")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        ticket_id = int(sys.argv[1])
    else:
        ticket_id = 124823  # Default to example ticket
        print(f"Usage: python extract_messaging_conversations.py TICKET_ID")
        print(f"Using default ticket: {ticket_id}\n")
    
    # Extract the conversation
    conversation = extract_messaging_conversation(ticket_id)
    
    # Display it
    print_conversation(conversation, show_system_messages=True)
    
    # Save to file
    if 'error' not in conversation:
        output_file = f'ticket_{ticket_id}_full_conversation.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(conversation, f, ensure_ascii=False, indent=2)
        print(f"💾 Complete conversation saved to '{output_file}'")
        
        # Save sentiment-ready version (message-level)
        sentiment_ready = []
        ticket_info = conversation.get('ticket_info', {})
        
        for msg in conversation.get('all_messages', []):
            if msg.get('actor_type') == 'end-user' and msg.get('message'):
                sentiment_ready.append({
                    'ticket_id': ticket_id,
                    'message_id': msg.get('message_id'),
                    'text': msg.get('message'),
                    'timestamp': msg.get('created_at'),
                    'author_name': msg.get('actor_name'),
                    
                    # Business identifiers
                    'worker_id': ticket_info.get('worker_id'),
                    'client_id': ticket_info.get('client_id'),
                    'contract_id': ticket_info.get('contract_id'),
                    'worker_name': ticket_info.get('worker_name'),
                    'client_name': ticket_info.get('client_name'),
                    'category': ticket_info.get('custom_fields', {}).get('category'),
                    'type_of_request': ticket_info.get('custom_fields', {}).get('request_type'),
                })
        
        if sentiment_ready:
            sentiment_file = f'ticket_{ticket_id}_sentiment_ready.json'
            with open(sentiment_file, 'w', encoding='utf-8') as f:
                json.dump(sentiment_ready, f, ensure_ascii=False, indent=2)
            print(f"🎯 {len(sentiment_ready)} customer messages saved to '{sentiment_file}' (ready for sentiment analysis)")
        
        # Save CLIENT-LEVEL version (conversation grouped)
        custom_fields = ticket_info.get('custom_fields', {})
        all_messages = conversation.get('all_messages', [])
        
        # Build conversation array with all message details
        conversation_array = []
        for msg in all_messages:
            conversation_array.append({
                'message_id': msg.get('message_id'),
                'timestamp': msg.get('created_at'),
                'author_name': msg.get('actor_name'),
                'author_type': msg.get('actor_type'),  # end-user, agent, system
                'message_text': msg.get('message'),
                'message_type': msg.get('message_type'),  # text, image
            })
        
        # Client-level structure
        sla_metrics = ticket_info.get('sla_metrics', {})
        
        client_level_data = {
            # Business identifiers
            'client_id': ticket_info.get('client_id'),
            'client_name': ticket_info.get('client_name'),
            'worker_id': ticket_info.get('worker_id'),
            'worker_name': ticket_info.get('worker_name'),
            'worker_email': ticket_info.get('worker_email'),
            'requester_name': ticket_info.get('worker_name'),  # Same as worker_name
            'requester_id': ticket_info.get('requester_id'),
            'contract_id': ticket_info.get('contract_id'),
            
            # Ticket details
            'ticket_id': ticket_id,
            'subject': ticket_info.get('subject'),
            'ticket_status': ticket_info.get('status'),
            'priority': ticket_info.get('priority'),
            'created_at': ticket_info.get('created_at'),
            'updated_at': ticket_info.get('updated_at'),
            'via_channel': ticket_info.get('via_channel'),
            
            # Assignment (IDs - will be enriched later)
            'assignee_id': ticket_info.get('assignee_id'),
            'group_id': ticket_info.get('group_id'),
            'organization_id': ticket_info.get('organization_id'),
            
            # Classification
            'category': custom_fields.get('category'),
            'type_of_request': custom_fields.get('request_type'),
            'tags': ticket_info.get('tags', []),
            
            # SLA metrics
            'sla': {
                'reply_time_in_minutes': sla_metrics.get('reply_time_in_minutes'),
                'first_resolution_time_in_minutes': sla_metrics.get('first_resolution_time_in_minutes'),
                'full_resolution_time_in_minutes': sla_metrics.get('full_resolution_time_in_minutes'),
                'reply_time_breached': sla_metrics.get('reply_time_breached'),
                'first_resolution_time_breached': sla_metrics.get('first_resolution_time_breached'),
                'full_resolution_time_breached': sla_metrics.get('full_resolution_time_breached'),
                'initially_assigned_at': sla_metrics.get('initially_assigned_at'),
                'solved_at': sla_metrics.get('solved_at'),
            },
            
            # Full conversation as array
            'conversation': conversation_array,
            'total_messages': len(conversation_array),
            'customer_messages_count': len([m for m in conversation_array if m['author_type'] == 'end-user']),
            'agent_messages_count': len([m for m in conversation_array if m['author_type'] == 'agent']),
        }
        
        client_file = f'ticket_{ticket_id}_client_level.json'
        with open(client_file, 'w', encoding='utf-8') as f:
            json.dump(client_level_data, f, ensure_ascii=False, indent=2)
        print(f"📋 Client-level data saved to '{client_file}'")

