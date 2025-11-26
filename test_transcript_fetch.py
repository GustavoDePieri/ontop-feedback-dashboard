#!/usr/bin/env python3
"""
Test script to fetch a single transcript from DIIO and examine its structure
"""

import os
import json
import requests
from dotenv import load_dotenv

def test_transcript_fetch():
    """Fetch a single transcript and examine its structure"""

    # Load environment variables
    load_dotenv()

    # DIIO API configuration (OAuth2)
    diio_base_url = 'https://getontop.diio.com/api/external'  # Based on the subdomain
    client_id = 'af377a7c-71e2-4ed9-8ca2-24bf854b4579'
    client_secret = 'cf838c88-ff62-4e7c-ac65-31dca0fe2c67'
    refresh_token = 'e9f2d731-16ea-4c72-b810-aa2707c2a0ce'
    subdomain = 'getontop'

    # Get a transcript ID from the database
    try:
        from supabase import create_client, Client
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_ANON_KEY')

        if not supabase_url or not supabase_key:
            print("❌ Supabase credentials not found")
            return

        supabase = create_client(supabase_url, supabase_key)

        # Get one transcript ID from database
        result = supabase.table('diio_transcripts').select('diio_transcript_id').limit(1).execute()

        if not result.data:
            print("❌ No transcripts found in database")
            return

        transcript_id = result.data[0]['diio_transcript_id']
        print(f"🔍 Testing with transcript ID: {transcript_id}")

    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        return

    # Get OAuth2 access token
    try:
        token_url = f"{diio_base_url}/refresh_token"
        token_data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'refresh_token': refresh_token
        }

        print("🔐 Getting OAuth2 access token...")
        token_response = requests.post(token_url, json=token_data)

        if token_response.status_code != 200:
            print(f"❌ Token request failed: {token_response.status_code}")
            print(f"Response: {token_response.text}")
            return

        token_data = token_response.json()
        access_token = token_data.get('access_token')

        if not access_token:
            print("❌ No access token in response")
            print(f"Response: {token_data}")
            return

        print("✅ Got access token")

    except Exception as e:
        print(f"❌ Error getting access token: {e}")
        return

    # Make API request to DIIO
    try:
        url = f"{diio_base_url}/v1/transcripts/{transcript_id}"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        print(f"🌐 Making request to: {url}")
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            print(f"❌ API request failed: {response.status_code}")
            print(f"Response: {response.text}")
            return

        transcript_data = response.json()
        print("✅ API request successful")

        # Examine the structure
        print("\n" + "="*60)
        print("🔍 TRANSCRIPT STRUCTURE ANALYSIS")
        print("="*60)

        print(f"📊 Response type: {type(transcript_data)}")

        if isinstance(transcript_data, dict):
            print(f"📋 Top-level keys: {list(transcript_data.keys())}")

            # Look for transcript content
            transcript_content = None
            possible_fields = ['transcript', 'text', 'content', 'data']

            for field in possible_fields:
                if field in transcript_data and transcript_data[field]:
                    print(f"✅ Found '{field}' field")
                    transcript_content = transcript_data[field]
                    break

            if transcript_content:
                print(f"📝 Transcript content type: {type(transcript_content)}")

                if isinstance(transcript_content, str):
                    print("📄 Transcript is a plain string")
                    print(f"📏 Length: {len(transcript_content)} characters")
                    print("\n--- FIRST 500 CHARACTERS ---")
                    print(transcript_content[:500])
                    print("--- END SAMPLE ---\n")

                    # Check for speaker patterns
                    lines = transcript_content.split('\n')[:20]  # First 20 lines
                    print("🔍 SPEAKER PATTERN ANALYSIS (first 20 lines):")
                    speaker_patterns = []
                    for i, line in enumerate(lines, 1):
                        line = line.strip()
                        if not line:
                            continue

                        # Look for common speaker patterns
                        if ':' in line and len(line.split(':')[0].strip()) < 50:  # Name: text pattern
                            speaker_patterns.append(f"Line {i}: POSSIBLE SPEAKER - {line[:80]}...")
                        elif line.startswith('[') and ']' in line:  # [Name] text pattern
                            speaker_patterns.append(f"Line {i}: POSSIBLE SPEAKER - {line[:80]}...")
                        else:
                            speaker_patterns.append(f"Line {i}: Plain text - {line[:80]}...")

                    for pattern in speaker_patterns[:10]:  # Show first 10
                        print(f"  {pattern}")

                elif isinstance(transcript_content, list):
                    print(f"📋 Transcript is an array with {len(transcript_content)} items")
                    print("\n--- FIRST 5 ITEMS ---")
                    for i, item in enumerate(transcript_content[:5]):
                        print(f"Item {i+1}: {type(item)} - {str(item)[:100]}...")
                        if isinstance(item, dict):
                            print(f"  Keys: {list(item.keys())}")
                    print("--- END SAMPLE ---\n")

                    # Check if items have speaker information
                    if transcript_content and isinstance(transcript_content[0], dict):
                        sample_item = transcript_content[0]
                        print("🔍 SPEAKER FIELD ANALYSIS:")
                        speaker_fields = ['speaker', 'name', 'participant', 'user', 'person']
                        found_fields = []

                        for field in speaker_fields:
                            if field in sample_item:
                                found_fields.append(field)
                                print(f"  ✅ Found '{field}' field: {sample_item[field]}")

                        if not found_fields:
                            print("  ❌ No speaker-related fields found")
                            print(f"  Available fields: {list(sample_item.keys())}")

                else:
                    print(f"📦 Transcript content: {transcript_content}")

            else:
                print("❌ No transcript content field found")
                print("Full response structure:")
                print(json.dumps(transcript_data, indent=2)[:1000])

        elif isinstance(transcript_data, str):
            print("📄 Response is a plain string")
            print(f"📏 Length: {len(transcript_data)} characters")
            print("\n--- FIRST 500 CHARACTERS ---")
            print(transcript_data[:500])

        else:
            print(f"📦 Response is: {transcript_data}")

    except Exception as e:
        print(f"❌ Error during API request: {e}")

if __name__ == "__main__":
    test_transcript_fetch()
