"""
Setup script for Ontop Feedback Analysis Dashboard
This script handles the initial setup and installation of required packages
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ All packages installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing packages: {e}")
        return False
    return True

def download_nltk_data():
    """Download required NLTK data"""
    print("Downloading NLTK data...")
    try:
        import nltk
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        nltk.download('vader_lexicon', quiet=True)
        print("✅ NLTK data downloaded successfully!")
    except Exception as e:
        print(f"❌ Error downloading NLTK data: {e}")
        return False
    return True

def check_data_file():
    """Check if the CSV data file exists"""
    if os.path.exists('clientsFeedbacks.csv'):
        print("✅ Data file 'clientsFeedbacks.csv' found!")
        return True
    else:
        print("❌ Data file 'clientsFeedbacks.csv' not found!")
        print("Please ensure the CSV file is in the same directory as this script.")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up Ontop Feedback Analysis Dashboard...")
    print("=" * 50)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Download NLTK data
    if not download_nltk_data():
        sys.exit(1)
    
    # Check data file
    if not check_data_file():
        print("\n⚠️  Warning: Data file not found. The dashboard may not work properly.")
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed successfully!")
    print("\nTo run the dashboard, execute:")
    print("py -m streamlit run dashboard.py")
    print("\nThe dashboard will open in your web browser.")

if __name__ == "__main__":
    main()


