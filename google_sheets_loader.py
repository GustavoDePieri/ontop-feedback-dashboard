"""
Google Sheets Data Loader for Ontop Feedback Dashboard
Connects to Google Sheets with real-time Salesforce data
"""

import gspread
from google.oauth2.service_account import Credentials
import pandas as pd
import streamlit as st
from datetime import datetime
import json
import os

# Google Sheets configuration
SHEET_ID = "1VfTbd2J91PgIj5skhUbqOst1oLgXEuoyLTqxCOPLJ2Q"
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive.readonly"
]

def get_service_account_info():
    """Get service account info from environment variables or Streamlit secrets"""
    try:
        # Try Streamlit secrets first (for Streamlit Cloud)
        if hasattr(st, 'secrets') and 'google_service_account' in st.secrets:
            return dict(st.secrets['google_service_account'])
    except:
        pass
    
    # Use environment variables only - no hardcoded credentials
    private_key = os.getenv("GOOGLE_PRIVATE_KEY", "")
    if private_key:
        private_key = private_key.replace('\\n', '\n')
    
    return {
        "type": "service_account",
        "project_id": os.getenv("GOOGLE_PROJECT_ID", ""),
        "private_key_id": os.getenv("GOOGLE_PRIVATE_KEY_ID", ""),
        "private_key": private_key,
        "client_email": os.getenv("GOOGLE_CLIENT_EMAIL", ""),
        "client_id": os.getenv("GOOGLE_CLIENT_ID", ""),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/whatsappvalidaor%40omega-cosmos-469700-v8.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
    }

def get_google_sheets_client():
    """Initialize and return Google Sheets client"""
    try:
        service_account_info = get_service_account_info()
        credentials = Credentials.from_service_account_info(
            service_account_info, 
            scopes=SCOPES
        )
        client = gspread.authorize(credentials)
        return client
    except Exception as e:
        st.error(f"Failed to authenticate with Google Sheets: {str(e)}")
        return None

@st.cache_data(ttl=300)  # Cache for 5 minutes
def load_data_from_google_sheets(sheet_name=None):
    """
    Load data from Google Sheets
    
    Expected columns:
    - Platform Client ID
    - Account Name  
    - Created Date (MM/DD/YYYY format)
    - Account Owner
    - CS Insight: CS Insights Name
    - CS Insight: Record Type
    - Feedback
    """
    try:
        # Get Google Sheets client
        client = get_google_sheets_client()
        if not client:
            return None
            
        # Open the spreadsheet
        sheet = client.open_by_key(SHEET_ID)
        
        # Try to get the worksheet - if no sheet_name provided, use the first sheet
        if sheet_name:
            try:
                worksheet = sheet.worksheet(sheet_name)
            except:
                st.warning(f"Sheet '{sheet_name}' not found. Using first available sheet.")
                worksheet = sheet.get_worksheet(0)
        else:
            # Use the first sheet available
            worksheet = sheet.get_worksheet(0)
            st.info(f"Using sheet: '{worksheet.title}'")
        
        # Get all records
        records = worksheet.get_all_records()
        
        if not records:
            st.warning("No data found in Google Sheets")
            return None
            
        # Convert to DataFrame
        df = pd.DataFrame(records)
        
        # Clean column names (remove extra spaces)
        df.columns = df.columns.str.strip()
        
        # Print available columns for debugging
        st.info(f"Available columns: {list(df.columns)}")
        
        # Map columns to expected names (based on actual Google Sheet structure)
        column_mapping = {
            'Platform Client ID': 'Platform Client ID',
            'Account Name': 'Account Name', 
            'Created Date': 'Created Date',
            'Account Owner': 'Account Owner',
            'CS Insight: CS Insights Name': 'Feedback directed to',
            'CS Insight: Record Type': 'Record Type',
            'Feedback': 'Feedback'
        }
        
        # Debug: Show actual columns from sheet
        st.info(f"Columns found in sheet: {list(df.columns)}")
        
        # Check if all expected columns exist
        missing_cols = []
        for col in column_mapping.keys():
            if col not in df.columns:
                missing_cols.append(col)
        
        if missing_cols:
            st.error(f"Missing columns in Google Sheet: {missing_cols}")
            st.info("Please ensure your Google Sheet has these exact column headers:")
            for col in column_mapping.keys():
                st.write(f"- {col}")
            return None
        
        # Rename columns
        df = df.rename(columns=column_mapping)
        
        # Process the data
        df = process_salesforce_data(df)
        
        st.success(f"✅ Successfully loaded {len(df)} records from Google Sheets")
        return df
        
    except Exception as e:
        st.error(f"Error loading data from Google Sheets: {str(e)}")
        return None

def process_salesforce_data(df):
    """Process and clean the Salesforce data"""
    
    # Handle missing columns
    required_columns = ['Platform Client ID', 'Account Name', 'Created Date', 'Account Owner', 'Feedback']
    for col in required_columns:
        if col not in df.columns:
            st.warning(f"Column '{col}' not found. Adding empty column.")
            df[col] = ''
    
    # Add Feedback directed to if not present
    if 'Feedback directed to' not in df.columns:
        if 'CS Insight: CS Insights Name' in df.columns:
            df['Feedback directed to'] = df['CS Insight: CS Insights Name']
        else:
            df['Feedback directed to'] = 'General'
    
    # Convert date column (MM/DD/YYYY format)
    try:
        df['Created Date'] = pd.to_datetime(df['Created Date'], format='%m/%d/%Y', errors='coerce')
    except:
        try:
            df['Created Date'] = pd.to_datetime(df['Created Date'], errors='coerce')
        except:
            st.warning("Could not parse dates. Using current date.")
            df['Created Date'] = datetime.now()
    
    # Clean feedback text
    df['Feedback'] = df['Feedback'].astype(str).str.strip()
    
    # Remove empty feedbacks
    df = df[df['Feedback'].str.len() > 5]  # At least 5 characters
    
    # Remove rows where feedback is just "nan" or "None"
    df = df[~df['Feedback'].isin(['nan', 'None', 'null', ''])]
    
    # Fill missing values
    df['Account Name'] = df['Account Name'].fillna('Unknown Account')
    df['Account Owner'] = df['Account Owner'].fillna('Unknown Owner')
    df['Platform Client ID'] = df['Platform Client ID'].fillna('Unknown ID')
    df['Feedback directed to'] = df['Feedback directed to'].fillna('General')
    
    return df

def get_data_freshness():
    """Get information about when data was last updated"""
    try:
        client = get_google_sheets_client()
        if not client:
            return "Unable to check"
            
        sheet = client.open_by_key(SHEET_ID)
        # Get sheet metadata
        return f"Last checked: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    except:
        return "Unable to check"

def test_google_sheets_connection():
    """Test the Google Sheets connection"""
    try:
        client = get_google_sheets_client()
        if not client:
            return False, "Failed to create client"
            
        sheet = client.open_by_key(SHEET_ID)
        # Use first worksheet available
        worksheet = sheet.get_worksheet(0)
        st.info(f"Testing connection to sheet: '{worksheet.title}'")
        
        # Try to get first few rows
        sample_data = worksheet.get_all_records(head=5)
        
        return True, f"✅ Connection successful! Found {len(sample_data)} sample records"
        
    except Exception as e:
        return False, f"❌ Connection failed: {str(e)}"

if __name__ == "__main__":
    # Test the connection
    success, message = test_google_sheets_connection()
    print(message)
    
    if success:
        df = load_data_from_google_sheets()
        if df is not None:
            print(f"Loaded {len(df)} records")
            print("Columns:", list(df.columns))
            print("\nFirst few rows:")
            print(df.head())
