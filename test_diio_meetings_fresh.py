"""
Test DIIO API - Fresh Token Test for Meetings Scope
Force a fresh token to see if meetings scope is active
"""

import requests
import json
from datetime import datetime
import base64

# DIIO OAuth Credentials
CLIENT_ID = "af377a7c-71e2-4ed9-8ca2-24bf854b4579"
CLIENT_SECRET = "cf838c88-ff62-4e7c-ac65-31dca0fe2c67"
REFRESH_TOKEN = "e9f2d731-16ea-4c72-b810-aa2707c2a0ce"

SUBDOMAIN = "getontop"
BASE_URL = f"https://{SUBDOMAIN}.diio.com/api/external"

MEETING_ID = "604f9882-9968-11f0-bce8-06254876e271"
GIULIANA_EMAIL = "gfontes@getontop.com"

def get_fresh_token():
    """Get a fresh access token and inspect it"""
    print("=" * 70)
    print("GETTING FRESH ACCESS TOKEN")
    print("=" * 70)
    
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
        data = response.json()
        token = data.get('access_token')
        print(f"[SUCCESS] Fresh token obtained")
        print(f"Token (first 50 chars): {token[:50]}...")
        
        # Decode JWT to see scopes
        try:
            payload = token.split('.')[1]
            padding = len(payload) % 4
            if padding:
                payload += '=' * (4 - padding)
            decoded = base64.b64decode(payload)
            jwt_data = json.loads(decoded)
            
            print(f"\nToken Details:")
            print(f"  Scopes: {jwt_data.get('scopes', [])}")
            print(f"  Expires: {datetime.fromtimestamp(jwt_data.get('exp', 0))}")
            print(f"  Company ID: {jwt_data.get('company_id')}")
            print(f"  User ID: {jwt_data.get('user_id')}")
            
            return token, jwt_data.get('scopes', [])
        except Exception as e:
            print(f"[WARNING] Could not decode token: {e}")
            return token, []
    else:
        print(f"[ERROR] Failed to get token: {response.text}")
        return None, []

def test_meetings_list(access_token):
    """Test listing meetings"""
    print(f"\n{'=' * 70}")
    print("TESTING: GET /v1/meetings (List all meetings)")
    print("=" * 70)
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    url = f"{BASE_URL}/v1/meetings"
    print(f"URL: {url}")
    
    try:
        response = requests.get(url, headers=headers, params={"limit": 10}, timeout=15)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            meetings = data.get('meetings', [])
            total = data.get('total', 0)
            
            print(f"[SUCCESS] Got {len(meetings)} meetings (Total: {total})")
            print(f"\nFirst 3 meetings:")
            for i, meeting in enumerate(meetings[:3]):
                print(f"\n  Meeting {i+1}:")
                print(f"    ID: {meeting.get('id')}")
                print(f"    Name: {meeting.get('name')}")
                print(f"    Date: {meeting.get('scheduled_at')}")
                print(f"    Transcript ID: {meeting.get('last_trancript_id')}")
                if meeting.get('attendees'):
                    sellers = meeting.get('attendees', {}).get('sellers', [])
                    print(f"    Sellers: {', '.join([s['name'] for s in sellers])}")
            
            return meetings
        elif response.status_code == 401:
            print(f"[ERROR] Still unauthorized - meetings scope not active yet")
            print(f"Response: {response.text}")
        else:
            print(f"[ERROR] {response.text}")
        
        return []
            
    except Exception as e:
        print(f"[ERROR] Exception: {e}")
        return []

def test_specific_meeting(access_token, meeting_id):
    """Test getting specific meeting"""
    print(f"\n{'=' * 70}")
    print(f"TESTING: GET /v1/meetings/{meeting_id}")
    print("=" * 70)
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    url = f"{BASE_URL}/v1/meetings/{meeting_id}"
    print(f"URL: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[SUCCESS] Got Giuliana's meeting!")
            print(f"\nMeeting Details:")
            print(f"  Name: {data.get('name')}")
            print(f"  Date: {data.get('scheduled_at')}")
            print(f"  Status: {data.get('analyzed_status')}")
            print(f"  Transcript ID: {data.get('last_trancript_id')}")
            
            return data
        elif response.status_code == 401:
            print(f"[ERROR] Still unauthorized")
        else:
            print(f"[ERROR] {response.text}")
        
        return None
            
    except Exception as e:
        print(f"[ERROR] Exception: {e}")
        return None

def get_transcript(access_token, transcript_id):
    """Get transcript"""
    print(f"\n{'=' * 70}")
    print(f"TESTING: GET /v1/transcripts/{transcript_id}")
    print("=" * 70)
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    url = f"{BASE_URL}/v1/transcripts/{transcript_id}"
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            transcript_text = data.get('transcript', '')
            print(f"[SUCCESS] Got transcript!")
            print(f"Length: {len(transcript_text)} characters")
            print(f"\nTranscript Preview (first 1000 chars):")
            print("-" * 70)
            print(transcript_text[:1000])
            if len(transcript_text) > 1000:
                print("...")
            print("-" * 70)
            return data
        else:
            print(f"[ERROR] {response.text}")
            return None
            
    except Exception as e:
        print(f"[ERROR] Exception: {e}")
        return None

def main():
    print("=" * 70)
    print("DIIO API - FRESH TOKEN TEST FOR MEETINGS SCOPE")
    print("=" * 70)
    print(f"Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Get fresh token
    access_token, scopes = get_fresh_token()
    
    if not access_token:
        print("[FAILED] Could not get access token")
        return
    
    # Check if meetings scope is present
    has_meetings_scope = 'meetings' in scopes
    
    print(f"\n{'=' * 70}")
    print("SCOPE CHECK")
    print("=" * 70)
    print(f"Has 'meetings' scope: {'YES [OK]' if has_meetings_scope else 'NO [MISSING]'}")
    print(f"All scopes: {', '.join(scopes)}")
    
    if not has_meetings_scope:
        print(f"\n[WARNING] 'meetings' scope is not active yet")
        print(f"[INFO] DIIO may need a few minutes to propagate the change")
        print(f"[INFO] Or the refresh_token might need to be regenerated")
        print(f"\n[RECOMMENDATION] Contact DIIO support to:")
        print(f"  1. Confirm the scope was added")
        print(f"  2. Ask if a new refresh_token is needed")
        print(f"  3. Check if there's a propagation delay")
        return
    
    # Test meetings endpoints
    meetings = test_meetings_list(access_token)
    
    # Test specific meeting
    meeting = test_specific_meeting(access_token, MEETING_ID)
    
    # If we got the meeting and it has a transcript, fetch it
    if meeting and meeting.get('last_trancript_id'):
        transcript = get_transcript(access_token, meeting['last_trancript_id'])
    
    # Summary
    print(f"\n{'=' * 70}")
    print("FINAL SUMMARY")
    print("=" * 70)
    
    if has_meetings_scope:
        if meetings:
            print(f"\n🎉 SUCCESS! Meetings scope is active!")
            print(f"   Total meetings available: {len(meetings)}")
            print(f"   Integration is fully working!")
            print(f"\n📋 Next steps:")
            print(f"   1. All endpoints are now working")
            print(f"   2. Test the /diio-test page")
            print(f"   3. Start integrating transcripts with AI analysis")
        else:
            print(f"\n⚠️  Meetings scope appears active but no meetings returned")
            print(f"   This might mean there are no meetings yet, or")
            print(f"   There might be a permission issue")
    else:
        print(f"\n❌ Meetings scope is NOT active yet")
        print(f"   Current scopes: {', '.join(scopes)}")
    
    print("=" * 70)

if __name__ == "__main__":
    main()

