"""
Manual Sentiment Review and Correction System
Allows for human review and correction of automated sentiment analysis
"""

import pandas as pd
import numpy as np
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import json
import re
from datetime import datetime

def load_data():
    """Load the CSV data with encoding detection"""
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'utf-16']
    df = None
    
    for encoding in encodings:
        try:
            df = pd.read_csv('clientsFeedbacks.csv', encoding=encoding)
            print(f"✅ Successfully loaded data with {encoding} encoding")
            break
        except UnicodeDecodeError:
            continue
        except Exception:
            continue
    
    if df is None:
        raise Exception("Could not load CSV file with any encoding")
    
    # Clean column names
    df.columns = df.columns.str.strip().str.replace('"', '')
    df['Created Date'] = pd.to_datetime(df['Created Date'], errors='coerce')
    df['Feedback'] = df['Feedback'].astype(str).str.strip()
    df = df[df['Feedback'].str.len() > 10]
    
    return df

def improved_spanish_sentiment_analysis(text):
    """
    Improved sentiment analysis specifically for Spanish feedback
    with manual rules for better accuracy
    """
    
    # Convert to lowercase for analysis
    text_lower = text.lower()
    
    # Strong positive indicators in Spanish
    positive_phrases = [
        'les gusta', 'le gusta', 'les encanta', 'le encanta', 'muy bien', 'excelente',
        'perfecto', 'genial', 'fantástico', 'maravilloso', 'increíble', 'satisfecho',
        'satisfecha', 'contento', 'contenta', 'feliz', 'funciona bien', 'sin problemas',
        'todo bien', 'muy bueno', 'buena experiencia', 'recomiendo', 'recomendamos',
        'calidad', 'eficiente', 'rápido', 'fácil', 'simple', 'útil', 'práctico',
        'conformes', 'conforme', 'no tienen problema', 'no hay problema', 'les parece bien',
        'le parece bien', 'están contentos', 'está contento', 'les funciona', 'funciona',
        'buena plataforma', 'buen servicio', 'gran servicio', 'servicio excelente'
    ]
    
    # Strong negative indicators in Spanish  
    negative_phrases = [
        'no funciona', 'no sirve', 'problema', 'problemas', 'error', 'errores',
        'falla', 'fallas', 'difícil', 'complicado', 'confuso', 'frustrado', 'frustrada',
        'molesto', 'molesta', 'decepcionado', 'decepcionada', 'malo', 'mala', 'pésimo',
        'terrible', 'horrible', 'no me gusta', 'no les gusta', 'no le gusta',
        'insatisfecho', 'insatisfecha', 'lento', 'caro', 'costoso', 'no recomiendo',
        'no recomendamos', 'cancelar', 'cancelamos', 'dejar de usar', 'cambiar de',
        'buscar alternativa', 'no están contentos', 'no está contento'
    ]
    
    # Neutral/mixed indicators
    neutral_phrases = [
        'está bien', 'normal', 'regular', 'más o menos', 'podría mejorar',
        'sugerencia', 'recomendación', 'sería bueno', 'estaría bien'
    ]
    
    # Count positive and negative phrases
    positive_score = 0
    negative_score = 0
    neutral_score = 0
    
    for phrase in positive_phrases:
        positive_score += len(re.findall(rf'\b{re.escape(phrase)}\b', text_lower))
    
    for phrase in negative_phrases:
        negative_score += len(re.findall(rf'\b{re.escape(phrase)}\b', text_lower))
        
    for phrase in neutral_phrases:
        neutral_score += len(re.findall(rf'\b{re.escape(phrase)}\b', text_lower))
    
    # Use VADER as backup
    analyzer = SentimentIntensityAnalyzer()
    vader_score = analyzer.polarity_scores(text)['compound']
    
    # Use TextBlob as backup
    blob = TextBlob(text)
    textblob_score = blob.sentiment.polarity
    
    # Manual rule-based decision with fallback to automated
    if positive_score > negative_score and positive_score > 0:
        sentiment = 'Positive'
        confidence = min(0.8 + (positive_score * 0.1), 1.0)
    elif negative_score > positive_score and negative_score > 0:
        sentiment = 'Negative' 
        confidence = min(0.8 + (negative_score * 0.1), 1.0)
    elif neutral_score > 0:
        sentiment = 'Neutral'
        confidence = 0.7
    else:
        # Fallback to automated analysis
        if vader_score >= 0.05:
            sentiment = 'Positive'
            confidence = abs(vader_score)
        elif vader_score <= -0.05:
            sentiment = 'Negative'
            confidence = abs(vader_score)
        else:
            sentiment = 'Neutral'
            confidence = 0.5
    
    return {
        'sentiment': sentiment,
        'confidence': confidence,
        'positive_phrases_found': positive_score,
        'negative_phrases_found': negative_score,
        'neutral_phrases_found': neutral_score,
        'vader_score': vader_score,
        'textblob_score': textblob_score,
        'method': 'rule_based' if (positive_score > 0 or negative_score > 0) else 'automated'
    }

def manual_corrections():
    """
    Define manual corrections for specific feedback entries
    """
    corrections = {
        # Add specific feedback text or IDs that need manual correction
        "utilizan la plataforma para poder tener los contratos": "Positive",
        "les funciona poder cancelar transacciones": "Positive", 
        "no tienen problema con ontop y les gusta mucho": "Positive",
        "les gusta mucho el servicio que prestamos": "Positive",
        
        # Add more manual corrections as needed
        # Format: "partial_text_from_feedback": "Correct_Sentiment"
    }
    
    return corrections

def analyze_sentiment_improved(df):
    """Improved sentiment analysis with manual corrections"""
    
    results = []
    manual_fixes = manual_corrections()
    
    for idx, row in df.iterrows():
        feedback = row['Feedback']
        
        # Check for manual corrections first
        manual_sentiment = None
        for text_fragment, correct_sentiment in manual_fixes.items():
            if text_fragment.lower() in feedback.lower():
                manual_sentiment = correct_sentiment
                break
        
        if manual_sentiment:
            # Use manual correction
            result = {
                'sentiment': manual_sentiment,
                'confidence': 1.0,
                'method': 'manual_correction',
                'vader_score': 0.5 if manual_sentiment == 'Positive' else -0.5 if manual_sentiment == 'Negative' else 0,
                'textblob_score': 0.5 if manual_sentiment == 'Positive' else -0.5 if manual_sentiment == 'Negative' else 0
            }
        else:
            # Use improved automated analysis
            result = improved_spanish_sentiment_analysis(feedback)
        
        results.append(result)
    
    # Add results to dataframe
    df['Sentiment'] = [r['sentiment'] for r in results]
    df['Sentiment_Confidence'] = [r['confidence'] for r in results]
    df['Analysis_Method'] = [r['method'] for r in results]
    df['VADER_Score'] = [r['vader_score'] for r in results]
    df['TextBlob_Score'] = [r['textblob_score'] for r in results]
    
    return df

def review_questionable_sentiments(df, threshold=0.6):
    """
    Identify feedback entries that might need manual review
    """
    print("🔍 Reviewing potentially misclassified feedback...")
    print("=" * 60)
    
    # Find low-confidence predictions
    questionable = df[df['Sentiment_Confidence'] < threshold].copy()
    
    # Find contradictory signals (positive words in negative sentiment, etc.)
    contradictory = []
    
    for idx, row in df.iterrows():
        feedback_lower = row['Feedback'].lower()
        sentiment = row['Sentiment']
        
        # Look for positive words in negative sentiment
        if sentiment == 'Negative':
            positive_indicators = ['gusta', 'bien', 'bueno', 'excelente', 'conforme', 'funciona']
            if any(word in feedback_lower for word in positive_indicators):
                contradictory.append(idx)
        
        # Look for negative words in positive sentiment
        elif sentiment == 'Positive':
            negative_indicators = ['problema', 'error', 'falla', 'malo', 'no funciona', 'difícil']
            if any(word in feedback_lower for word in negative_indicators):
                contradictory.append(idx)
    
    print(f"📊 Found {len(questionable)} low-confidence predictions")
    print(f"⚠️  Found {len(contradictory)} potentially contradictory classifications")
    
    # Show examples for manual review
    print("\n🔍 EXAMPLES FOR MANUAL REVIEW:")
    print("-" * 40)
    
    review_candidates = list(questionable.index) + contradictory
    review_candidates = list(set(review_candidates))  # Remove duplicates
    
    for i, idx in enumerate(review_candidates[:10]):  # Show first 10
        row = df.loc[idx]
        print(f"\n{i+1}. Client: {row['Account Name']}")
        print(f"   Current Sentiment: {row['Sentiment']} (Confidence: {row['Sentiment_Confidence']:.2f})")
        print(f"   Method: {row['Analysis_Method']}")
        print(f"   Feedback: {row['Feedback'][:200]}...")
        print("-" * 40)
    
    return review_candidates

def generate_improved_insights(df):
    """Generate insights with improved sentiment analysis"""
    
    insights = {}
    
    # Overall metrics
    total_feedback = len(df)
    positive_count = len(df[df['Sentiment'] == 'Positive'])
    negative_count = len(df[df['Sentiment'] == 'Negative'])
    neutral_count = len(df[df['Sentiment'] == 'Neutral'])
    
    # Confidence metrics
    high_confidence = len(df[df['Sentiment_Confidence'] >= 0.8])
    manual_corrections = len(df[df['Analysis_Method'] == 'manual_correction'])
    rule_based = len(df[df['Analysis_Method'] == 'rule_based'])
    
    insights['overview'] = {
        'total_feedback': total_feedback,
        'positive_count': positive_count,
        'negative_count': negative_count,
        'neutral_count': neutral_count,
        'positive_percentage': round(positive_count/total_feedback*100, 1),
        'negative_percentage': round(negative_count/total_feedback*100, 1),
        'neutral_percentage': round(neutral_count/total_feedback*100, 1),
        'high_confidence_predictions': high_confidence,
        'manual_corrections_applied': manual_corrections,
        'rule_based_classifications': rule_based
    }
    
    print(f"\n📊 IMPROVED SENTIMENT ANALYSIS RESULTS:")
    print(f"✅ Total Feedback: {total_feedback:,}")
    print(f"😊 Positive: {positive_count:,} ({insights['overview']['positive_percentage']}%)")
    print(f"😐 Neutral: {neutral_count:,} ({insights['overview']['neutral_percentage']}%)")  
    print(f"😞 Negative: {negative_count:,} ({insights['overview']['negative_percentage']}%)")
    print(f"🎯 High Confidence: {high_confidence:,} ({high_confidence/total_feedback*100:.1f}%)")
    print(f"✋ Manual Corrections: {manual_corrections:,}")
    print(f"📋 Rule-based: {rule_based:,}")
    
    return insights

def main():
    """Main function for improved sentiment analysis"""
    print("🧠 Starting Improved Sentiment Analysis with Manual Review...")
    print("=" * 60)
    
    # Load data
    df = load_data()
    print(f"📊 Loaded {len(df)} feedback entries")
    
    # Perform improved sentiment analysis
    df = analyze_sentiment_improved(df)
    print("✅ Improved sentiment analysis completed")
    
    # Review questionable classifications
    review_candidates = review_questionable_sentiments(df)
    
    # Generate insights
    insights = generate_improved_insights(df)
    
    # Save improved results
    df.to_csv('improved_sentiment_analysis.csv', index=False, encoding='utf-8')
    
    with open('improved_insights.json', 'w', encoding='utf-8') as f:
        json.dump(insights, f, indent=2, ensure_ascii=False, default=str)
    
    print(f"\n✅ Improved analysis saved to: improved_sentiment_analysis.csv")
    print(f"✅ Insights saved to: improved_insights.json")
    print(f"\n🎯 Ready for dashboard with improved accuracy!")
    
    return df, insights

if __name__ == "__main__":
    main()


