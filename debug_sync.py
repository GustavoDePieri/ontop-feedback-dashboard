#!/usr/bin/env python3
"""
Debug the transcript sync process to see why speaker labels aren't being preserved
"""

import os
import json
import requests
from dotenv import load_dotenv

def debug_transcript_sync():
    """Debug the transcript sync process"""

    # Load environment variables
    load_dotenv()

    # Get one unanalyzed transcript from database
    try:
        from supabase import create_client, Client
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_ANON_KEY')
        supabase = create_client(supabase_url, supabase_key)

        # Get a transcript that hasn't been analyzed yet (so we know it's fresh)
        result = supabase.table('diio_transcripts').select('diio_transcript_id').is_('ai_analysis', 'null').limit(1).execute()

        if not result.data:
            print("❌ No unanalyzed transcripts found")
            return

        transcript_id = result.data[0]['diio_transcript_id']
        print(f"🔍 Testing with fresh transcript ID: {transcript_id}")

    except Exception as e:
        print(f"❌ Database error: {e}")
        return

    # DIIO API configuration
    diio_base_url = 'https://getontop.diio.com/api/external'
    client_id = 'af377a7c-71e2-4ed9-8ca2-24bf854b4579'
    client_secret = 'cf838c88-ff62-4e7c-ac65-31dca0fe2c67'
    refresh_token = 'e9f2d731-16ea-4c72-b810-aa2707c2a0ce'

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
            return

        token_data = token_response.json()
        access_token = token_data.get('access_token')

        if not access_token:
            print("❌ No access token in response")
            return

        print("✅ Got access token")

    except Exception as e:
        print(f"❌ Error getting access token: {e}")
        return

    # Fetch transcript from DIIO
    try:
        url = f"{diio_base_url}/v1/transcripts/{transcript_id}"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        print(f"🌐 Fetching transcript from DIIO...")
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            print(f"❌ API request failed: {response.status_code}")
            return

        transcript_data = response.json()
        print("✅ Successfully fetched transcript from DIIO")

        # Analyze the transcript structure
        print("\n" + "="*60)
        print("🔍 DIIO TRANSCRIPT STRUCTURE ANALYSIS")
        print("="*60)

        if isinstance(transcript_data, dict) and 'transcript' in transcript_data:
            transcript_field = transcript_data['transcript']

            if isinstance(transcript_field, list):
                print(f"📋 Transcript is an array with {len(transcript_field)} segments")

                # Show first few segments
                print("\n--- FIRST 5 SEGMENTS ---")
                for i, segment in enumerate(transcript_field[:5]):
                    print(f"Segment {i+1}: {type(segment)}")
                    if isinstance(segment, dict):
                        print(f"  Keys: {list(segment.keys())}")
                        for key, value in segment.items():
                            if isinstance(value, str) and len(value) > 50:
                                print(f"  {key}: {value[:50]}...")
                            else:
                                print(f"  {key}: {value}")
                    print()

                # Now simulate the sync logic
                print("🔄 SIMULATING SYNC LOGIC...")
                print("="*60)

                transcript_text_parts = []
                for segment in transcript_field:
                    if isinstance(segment, str):
                        transcript_text_parts.append(segment)
                    elif isinstance(segment, dict):
                        # Prioritize speaker reconstruction if both speaker and text are available
                        if segment.get('speaker') and segment.get('text'):
                            text = f"{segment['speaker']}: {segment['text']}"
                        else:
                            # Try common field names for transcript segments
                            text = (segment.get('text') or
                                   segment.get('content') or
                                   segment.get('transcript') or
                                   segment.get('speech') or
                                   json.dumps(segment))
                        if text:
                            transcript_text_parts.append(text)
                    else:
                        transcript_text_parts.append(str(segment))

                transcript_text = '\n'.join([part for part in transcript_text_parts if part and part.strip()])

                print(f"📝 Generated transcript text length: {len(transcript_text)}")
                print("📝 First 300 characters:")
                print(transcript_text[:300])
                print("\n...")

                # Check if speaker labels are present
                lines = transcript_text.split('\n')[:10]
                print("🔍 SPEAKER LABEL CHECK (first 10 lines):")
                speaker_lines = 0
                for line in lines:
                    if ':' in line and len(line.split(':')[0].strip()) < 30:
                        print(f"  ✅ SPEAKER: {line[:80]}...")
                        speaker_lines += 1
                    else:
                        print(f"  ❌ PLAIN: {line[:80]}...")

                print(f"\n📊 RESULT: {speaker_lines}/{len(lines)} lines have speaker labels")

                if speaker_lines > 0:
                    print("✅ SPEAKER LABELS ARE BEING GENERATED CORRECTLY!")
                else:
                    print("❌ SPEAKER LABELS ARE NOT BEING GENERATED!")

            else:
                print(f"📦 Transcript field is {type(transcript_field)}, not a list")
                print(f"Content: {transcript_field}")

        else:
            print("❌ Unexpected transcript structure")
            print(f"Keys: {list(transcript_data.keys()) if isinstance(transcript_data, dict) else 'Not a dict'}")

    except Exception as e:
        print(f"❌ Error during API request: {e}")

if __name__ == "__main__":
    debug_transcript_sync()
