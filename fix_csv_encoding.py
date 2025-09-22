"""
CSV Encoding Fix Utility
This script helps detect and fix encoding issues in the clientsFeedbacks.csv file
"""

import pandas as pd
import chardet
import os

def detect_encoding(file_path):
    """Detect the encoding of a file"""
    with open(file_path, 'rb') as file:
        raw_data = file.read()
        result = chardet.detect(raw_data)
        return result

def fix_csv_encoding(input_file, output_file=None):
    """Fix CSV encoding issues"""
    if not os.path.exists(input_file):
        print(f"❌ File {input_file} not found!")
        return False
    
    print(f"🔍 Analyzing file: {input_file}")
    
    # Detect current encoding
    encoding_info = detect_encoding(input_file)
    detected_encoding = encoding_info['encoding']
    confidence = encoding_info['confidence']
    
    print(f"📊 Detected encoding: {detected_encoding} (confidence: {confidence:.2%})")
    
    # Try to read with detected encoding
    try:
        df = pd.read_csv(input_file, encoding=detected_encoding)
        print(f"✅ Successfully read CSV with {detected_encoding} encoding")
        print(f"📈 Found {len(df)} rows and {len(df.columns)} columns")
        
        # Display column names
        print("\n📋 Columns found:")
        for i, col in enumerate(df.columns, 1):
            print(f"   {i}. {col}")
        
        # Save as UTF-8 if needed
        if output_file is None:
            output_file = input_file.replace('.csv', '_utf8.csv')
        
        if detected_encoding.lower() != 'utf-8':
            df.to_csv(output_file, encoding='utf-8', index=False)
            print(f"\n💾 Saved UTF-8 version as: {output_file}")
            print("You can now use this file with the dashboard!")
        else:
            print("\n✅ File is already in UTF-8 format!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error reading file: {str(e)}")
        
        # Try alternative encodings
        alternative_encodings = ['latin-1', 'iso-8859-1', 'cp1252', 'utf-16']
        
        for encoding in alternative_encodings:
            try:
                print(f"🔄 Trying {encoding}...")
                df = pd.read_csv(input_file, encoding=encoding)
                print(f"✅ Success with {encoding}!")
                
                # Save as UTF-8
                if output_file is None:
                    output_file = input_file.replace('.csv', '_utf8.csv')
                df.to_csv(output_file, encoding='utf-8', index=False)
                print(f"💾 Saved UTF-8 version as: {output_file}")
                return True
                
            except Exception:
                continue
        
        print("❌ Could not read the file with any encoding")
        return False

def main():
    """Main function"""
    print("🛠️  CSV Encoding Fix Utility")
    print("=" * 40)
    
    # Fix both CSV files
    csv_files = ['clientsFeedbackWithArea.csv', 'clientsFeedbacks.csv']
    success_count = 0
    
    for csv_file in csv_files:
        if os.path.exists(csv_file):
            print(f"\n📁 Processing {csv_file}...")
            if fix_csv_encoding(csv_file):
                success_count += 1
            else:
                print(f"❌ Failed to process {csv_file}")
        else:
            print(f"⚠️  File {csv_file} not found, skipping...")
    
    print("\n" + "=" * 40)
    if success_count > 0:
        print(f"🎉 Successfully processed {success_count} file(s)!")
        print("You can now run the dashboard.")
    else:
        print("😞 Could not fix any files.")
        print("Please check if the CSV files exist and are not corrupted.")

if __name__ == "__main__":
    main()

