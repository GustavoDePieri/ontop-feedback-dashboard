"""
Test DIIO API with Official Documentation
Based on official DIIO API documentation
Company subdomain: getontop
"""

import requests
import json
from datetime import datetime

# DIIO OAuth Credentials
CLIENT_ID = "af377a7c-71e2-4ed9-8ca2-24bf854b4579"
CLIENT_SECRET = "cf838c88-ff62-4e7c-ac65-31dca0fe2c67"
REFRESH_TOKEN = "e9f2d731-16ea-4c72-b810-aa2707c2a0ce"

# Company subdomain
SUBDOMAIN = "getontop"
BASE_URL = f"https://{SUBDOMAIN}.diio.com/api/external"

def get_access_token():
    """
    Get access token using refresh token
    POST /refresh_token
    """
    token_url = f"{BASE_URL}/refresh_token"
    
    print("=" * 60)
    print("STEP 1: GETTING ACCESS TOKEN")
    print("=" * 60)
    print(f"URL: {token_url}")
    print(f"Client ID: {CLIENT_ID}")
    print()
    
    try:
        response = requests.post(
            token_url,
            json={
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "refresh_token": REFRESH_TOKEN
            },
            headers={
                "Content-Type": "application/json"
            },
            timeout=15
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("[SUCCESS] Access token obtained!")
            print(f"\nResponse:")
            print(json.dumps(data, indent=2))
            return data.get('access_token')
        else:
            print(f"[FAILED] {response.text}")
            return None
            
    except Exception as e:
        print(f"[ERROR] {e}")
        return None

def test_endpoints(access_token):
    """
    Test various DIIO API endpoints
    """
    print("\n" + "=" * 60)
    print("STEP 2: TESTING API ENDPOINTS")
    print("=" * 60)
    
    if not access_token:
        print("[ERROR] No access token available")
        return
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Test endpoints from documentation
    endpoints = [
        {"path": "/v1/users", "description": "Users endpoint"},
        {"path": "/v1/meetings", "description": "Meetings endpoint"},
        {"path": "/v1/phone_calls", "description": "Phone Calls endpoint"},
        {"path": "/v1/transcripts", "description": "Transcripts list"},
        {"path": "/v1/exports", "description": "Exports endpoint"},
    ]
    
    successful_endpoints = []
    
    for endpoint_info in endpoints:
        path = endpoint_info["path"]
        description = endpoint_info["description"]
        url = f"{BASE_URL}{path}"
        
        print(f"\n{description}")
        print(f"URL: {url}")
        print("-" * 60)
        
        try:
            response = requests.get(url, headers=headers, timeout=15)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                print("[SUCCESS] Endpoint is working!")
                successful_endpoints.append(endpoint_info)
                
                try:
                    data = response.json()
                    print(f"Response preview:")
                    response_str = json.dumps(data, indent=2)
                    if len(response_str) > 500:
                        print(response_str[:500] + "...")
                    else:
                        print(response_str)
                except:
                    print(f"Response (text): {response.text[:200]}")
                    
            elif response.status_code == 401:
                print("[ERROR] Unauthorized - Token may be invalid")
            elif response.status_code == 403:
                print("[WARNING] Forbidden - No access to this endpoint")
            elif response.status_code == 404:
                print("[INFO] Not Found - Endpoint doesn't exist")
            else:
                print(f"[ERROR] Status {response.status_code}")
                print(f"Response: {response.text[:300]}")
                
        except Exception as e:
            print(f"[ERROR] {e}")
    
    return successful_endpoints

def test_specific_transcript(access_token, transcript_id):
    """
    Test getting a specific transcript
    GET /v1/transcripts/:id
    """
    print("\n" + "=" * 60)
    print("STEP 3: TESTING SPECIFIC TRANSCRIPT")
    print("=" * 60)
    
    if not access_token:
        print("[ERROR] No access token available")
        return
    
    url = f"{BASE_URL}/v1/transcripts/{transcript_id}"
    print(f"URL: {url}")
    print(f"Transcript ID: {transcript_id}")
    print()
    
    try:
        response = requests.get(
            url,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            timeout=15
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("[SUCCESS] Transcript retrieved!")
            print(f"\nResponse:")
            print(json.dumps(data, indent=2)[:1000] + "...")
        elif response.status_code == 404:
            print("[INFO] Transcript not found")
            print("This is expected if the transcript ID doesn't exist")
        else:
            print(f"[ERROR] {response.text}")
            
    except Exception as e:
        print(f"[ERROR] {e}")

def main():
    """
    Main test function
    """
    print("=" * 60)
    print("DIIO API TEST - OFFICIAL DOCUMENTATION")
    print("=" * 60)
    print(f"Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Subdomain: {SUBDOMAIN}")
    print(f"Base URL: {BASE_URL}")
    print()
    
    # Step 1: Get access token
    access_token = get_access_token()
    
    # Step 2: Test API endpoints
    successful_endpoints = []
    if access_token:
        successful_endpoints = test_endpoints(access_token)
    
    # Step 3: Test specific transcript (if we have an ID)
    # Uncomment and add a real transcript ID if you have one
    # test_specific_transcript(access_token, "91992f26-a585-11ee-bc7e-06d5ade5f257")
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    if access_token:
        print("[SUCCESS] Authentication working!")
        print(f"Access Token: {access_token[:30]}...")
        print(f"Token expires in: 1 hour (as per documentation)")
    else:
        print("[FAILED] Authentication failed")
    
    if successful_endpoints:
        print(f"\n[SUCCESS] Working Endpoints: {len(successful_endpoints)}")
        for endpoint in successful_endpoints:
            print(f"  - {endpoint['path']}: {endpoint['description']}")
    else:
        print("\n[INFO] No working endpoints found (or authentication failed)")
    
    print("\n" + "=" * 60)
    print("NEXT STEPS")
    print("=" * 60)
    
    if access_token:
        print("1. Add these credentials to your .env file:")
        print(f"   DIIO_CLIENT_ID={CLIENT_ID}")
        print(f"   DIIO_CLIENT_SECRET={CLIENT_SECRET}")
        print(f"   DIIO_REFRESH_TOKEN={REFRESH_TOKEN}")
        print(f"   DIIO_SUBDOMAIN={SUBDOMAIN}")
        print()
        print("2. Implement automatic token refresh (tokens expire in 1 hour)")
        print()
        print("3. Integration endpoints to implement:")
        print("   - GET /v1/transcripts - List all transcripts")
        print("   - GET /v1/transcripts/:id - Get specific transcript")
        print("   - GET /v1/meetings - List all meetings")
        print("   - GET /v1/phone_calls - List all phone calls")
        print("   - GET /v1/users - List all users")
        print()
        print("4. Consider creating a Nuxt composable: useDiio.ts")
    else:
        print("1. Verify credentials are correct and active")
        print("2. Contact DIIO support if issues persist")
    
    print("=" * 60)

if __name__ == "__main__":
    main()

