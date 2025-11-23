#!/usr/bin/env python3
"""
Download and cache the sentiment analysis model locally
This ensures the model is ready before running the full analysis
"""

import os
import sys
from pathlib import Path

try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch
except ImportError:
    print("❌ Missing required libraries. Install with:")
    print("pip install transformers torch")
    sys.exit(1)

def download_model():
    """Download and cache the sentiment analysis model"""
    model_name = "cardiffnlp/twitter-xlm-roberta-base-sentiment"

    print(f"🚀 Downloading model: {model_name}")
    print("📦 This will download ~1.7GB of data...")
    print("⏱️ This may take 5-15 minutes depending on your internet speed")
    print()

    try:
        # Download tokenizer
        print("📝 Downloading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_name)

        # Download model
        print("🤖 Downloading model...")
        model = AutoModelForSequenceClassification.from_pretrained(model_name)

        # Test the model with a sample
        print("🧪 Testing model...")
        inputs = tokenizer("This is a test message", return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)

        print("✅ Model downloaded and tested successfully!")
        print(f"📊 Model has {model.num_parameters():,} parameters")
        print(f"🏷️ Labels: {model.config.id2label}")

        # Show cache location
        cache_dir = Path.home() / ".cache" / "huggingface" / "transformers"
        if cache_dir.exists():
            print(f"💾 Model cached at: {cache_dir}")

        return True

    except Exception as e:
        print(f"❌ Failed to download model: {e}")
        print("\nTroubleshooting:")
        print("1. Check your internet connection")
        print("2. Make sure you have enough disk space (~2GB)")
        print("3. Try again - sometimes downloads fail midway")
        print("4. If you have a slow connection, be patient")
        return False

def main():
    print("🤖 Sentiment Analysis Model Download")
    print("=" * 40)
    print("This script downloads the AI model for local sentiment analysis")
    print("After download, you can run sentiment analysis completely offline!")
    print()

    # Check disk space (rough estimate)
    try:
        stat = os.statvfs(os.getcwd())
        free_space_gb = (stat.f_bavail * stat.f_frsize) / (1024**3)
        if free_space_gb < 2:
            print(f"⚠️ Warning: Only {free_space_gb:.1f}GB free space detected")
            print("   Model requires ~2GB. Consider freeing up space.")
            response = input("Continue anyway? (y/N): ").lower().strip()
            if response not in ['y', 'yes']:
                print("Download cancelled.")
                return
    except:
        pass  # Skip disk check if not available

    # Download model
    success = download_model()

    if success:
        print()
        print("🎉 Success! You can now run sentiment analysis locally:")
        print("   python local_sentiment_db.py")
        print()
        print("💡 The model is cached and will work offline for future runs!")

if __name__ == '__main__':
    main()
