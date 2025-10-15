"""
Test DIIO API - Find Transcript IDs in Meeting Details
Fetch individual meeting details to find transcript IDs
"""

import requests
import json
from datetime import datetime

# DIIO OAuth Credentials
CLIENT_ID = "af377a7c-71e2-4ed9-8ca2-24bf854b4579"
CLIENT_SECRET = "cf838c88-ff62-4e7c-ac65-31dca0fe2c67"
REFRESH_TOKEN = "e9f2d731-16ea-4c72-b810-aa2707c2a0ce"

SUBDOMAIN = "getontop"
BASE_URL = f"https://{SUBDOMAIN}.diio.com/api/external"

# Giuliana's meeting that we know exists
GIULIANA_MEETING_ID = "604f9882-9968-11f0-bce8-06254876e271"

def get_access_token():
    """Get access token"""
    response = requests.post(
        f"{BASE_URL}/refresh_token",
        json={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": REFRESH_TOKEN
        },
        headers={"Content-Type": "application/json"},
        timeout=15
    )
    
    if response.status_code == 200:
        return response.json().get('access_token')
    return None

def get_meeting_full_details(access_token, meeting_id):
    """Get FULL details for a specific meeting"""
    print(f"\n{'=' * 70}")
    print(f"GETTING FULL MEETING DETAILS: {meeting_id}")
    print("=" * 70)
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    url = f"{BASE_URL}/v1/meetings/{meeting_id}"
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[SUCCESS] Got meeting data")
            print(f"\nFull Response:")
            print(json.dumps(data, indent=2))
            return data
        else:
            print(f"[ERROR] {response.text}")
            return None
            
    except Exception as e:
        print(f"[ERROR] {e}")
        return None

def scan_recent_meetings_for_transcripts(access_token, limit=50):
    """Scan recent meetings to find ones with transcripts"""
    print(f"\n{'=' * 70}")
    print(f"SCANNING RECENT {limit} MEETINGS FOR TRANSCRIPTS")
    print("=" * 70)
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Get recent meetings
    try:
        response = requests.get(
            f"{BASE_URL}/v1/meetings",
            headers=headers,
            params={"limit": limit},
            timeout=60
        )
        
        if response.status_code != 200:
            print(f"[ERROR] Could not fetch meetings")
            return []
        
        meetings = response.json().get('meetings', [])
        print(f"[INFO] Got {len(meetings)} meetings")
        
        # Check each meeting for transcript fields
        meetings_with_transcripts = []
        
        for i, meeting in enumerate(meetings, 1):
            meeting_id = meeting.get('id')
            meeting_name = meeting.get('name', 'Unknown')
            
            # Check all possible transcript field names (including typo variations)
            transcript_field_names = [
                'last_trancript_id',  # With typo (as in docs)
                'last_transcript_id',  # Correct spelling
                'transcript_id',
                'transcriptId',
                'trancript_id'
            ]
            
            transcript_id = None
            for field_name in transcript_field_names:
                if field_name in meeting and meeting[field_name]:
                    transcript_id = meeting[field_name]
                    print(f"\n[FOUND] Meeting {i}: {meeting_name}")
                    print(f"  Meeting ID: {meeting_id}")
                    print(f"  Transcript ID ({field_name}): {transcript_id}")
                    meetings_with_transcripts.append({
                        'meeting': meeting,
                        'transcript_id': transcript_id,
                        'field_name': field_name
                    })
                    break
        
        if not meetings_with_transcripts:
            print(f"\n[INFO] No transcripts found in {len(meetings)} meetings")
            print(f"\nSample meeting structure (first meeting):")
            if meetings:
                print(json.dumps(meetings[0], indent=2))
        
        return meetings_with_transcripts
            
    except Exception as e:
        print(f"[ERROR] {e}")
        return []

def try_get_transcript(access_token, transcript_id):
    """Try to get a transcript"""
    print(f"\n{'=' * 70}")
    print(f"TRYING TO GET TRANSCRIPT: {transcript_id}")
    print("=" * 70)
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    url = f"{BASE_URL}/v1/transcripts/{transcript_id}"
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            transcript_text = data.get('transcript', '')
            print(f"[SUCCESS] Got transcript!")
            print(f"Length: {len(transcript_text)} characters")
            print(f"\nPreview (first 500 chars):")
            print("-" * 70)
            print(transcript_text[:500])
            print("-" * 70)
            return data
        else:
            print(f"[ERROR] {response.text}")
            return None
            
    except Exception as e:
        print(f"[ERROR] {e}")
        return None

def main():
    print("=" * 70)
    print("DIIO API - FIND TRANSCRIPT IDs")
    print("=" * 70)
    print(f"Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Get access token
    access_token = get_access_token()
    if not access_token:
        print("[ERROR] Could not get access token")
        return
    
    print("[SUCCESS] Access token obtained")
    
    # Test 1: Get Giuliana's specific meeting in full detail
    meeting_data = get_meeting_full_details(access_token, GIULIANA_MEETING_ID)
    
    # Test 2: Scan recent meetings for transcript IDs
    meetings_with_transcripts = scan_recent_meetings_for_transcripts(access_token, limit=100)
    
    # Test 3: If we found any transcripts, try to fetch them
    if meetings_with_transcripts:
        print(f"\n{'=' * 70}")
        print(f"FOUND {len(meetings_with_transcripts)} MEETINGS WITH TRANSCRIPTS!")
        print("=" * 70)
        
        # Try to fetch the first transcript
        first_meeting = meetings_with_transcripts[0]
        transcript = try_get_transcript(access_token, first_meeting['transcript_id'])
    else:
        print(f"\n{'=' * 70}")
        print("NO TRANSCRIPTS FOUND")
        print("=" * 70)
        print("\n[INFO] Possible reasons:")
        print("  1. Transcripts haven't been generated yet")
        print("  2. Transcripts are stored differently")
        print("  3. Need different API endpoint to access transcripts")
        print("\n[RECOMMENDATION]")
        print("  Contact DIIO support and ask:")
        print("  - How to check if transcripts are generated for meetings")
        print("  - What field name contains transcript IDs")
        print("  - If there's a different endpoint to access transcripts")
    
    print("\n" + "=" * 70)

if __name__ == "__main__":
    main()

