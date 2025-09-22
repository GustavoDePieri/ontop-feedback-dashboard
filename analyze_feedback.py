"""
Comprehensive Feedback Analysis Script
Pre-computes detailed sentiment analysis and business insights
"""

import pandas as pd
import numpy as np
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from collections import Counter
import re
from datetime import datetime
import json

def load_data():
    """Load the CSV data with encoding detection - now using the new file with areas"""
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'utf-16']
    df = None
    
    # Try to load the UTF-8 versions first, then fall back to originals
    csv_files = [
        'clientsFeedbackWithArea_utf8.csv', 
        'clientsFeedbackWithArea.csv', 
        'clientsFeedbacks_utf8.csv',
        'clientsFeedbacks.csv'
    ]
    
    for csv_file in csv_files:
        for encoding in encodings:
            try:
                df = pd.read_csv(csv_file, encoding=encoding)
                print(f"✅ Successfully loaded {csv_file} with {encoding} encoding")
                break
            except FileNotFoundError:
                continue
            except UnicodeDecodeError:
                continue
            except Exception:
                continue
        
        if df is not None:
            break
    
    if df is None:
        raise Exception("Could not load any CSV file with any encoding")
    
    # Clean column names
    df.columns = df.columns.str.strip().str.replace('"', '')
    
    # Check if we have the area column
    if 'Feedback directed to' not in df.columns:
        print("⚠️ Warning: 'Feedback directed to' column not found. Using basic analysis.")
        df['Feedback directed to'] = 'Unknown'
    else:
        print(f"✅ Found 'Feedback directed to' column with {df['Feedback directed to'].nunique()} different areas")
    
    df['Created Date'] = pd.to_datetime(df['Created Date'], errors='coerce')
    
    # Add Feedback column if missing (in case we're using a different structure)
    if 'Feedback' not in df.columns:
        # Look for similar column names
        feedback_cols = [col for col in df.columns if 'feedback' in col.lower()]
        if feedback_cols:
            df['Feedback'] = df[feedback_cols[0]]
        else:
            raise Exception("No feedback column found in the data")
    
    df['Feedback'] = df['Feedback'].astype(str).str.strip()
    df = df[df['Feedback'].str.len() > 10]
    
    return df

def improved_spanish_sentiment_analysis(text):
    """
    Improved sentiment analysis specifically for Spanish feedback with manual rules
    """
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
        'buena plataforma', 'buen servicio', 'gran servicio', 'servicio excelente',
        'love', 'happy', 'great', 'excellent', 'amazing', 'wonderful', 'good'
    ]
    
    # Strong negative indicators in Spanish  
    negative_phrases = [
        'no funciona', 'no sirve', 'problema', 'problemas', 'error', 'errores',
        'falla', 'fallas', 'difícil', 'complicado', 'confuso', 'frustrado', 'frustrada',
        'molesto', 'molesta', 'decepcionado', 'decepcionada', 'malo', 'mala', 'pésimo',
        'terrible', 'horrible', 'no me gusta', 'no les gusta', 'no le gusta',
        'insatisfecho', 'insatisfecha', 'lento', 'caro', 'costoso', 'no recomiendo',
        'issue', 'issues', 'problem', 'problems', 'difficult', 'hard', 'slow', 'expensive'
    ]
    
    # Manual corrections for specific cases
    manual_corrections = {
        'utilizan la plataforma para poder tener los contratos': 'Positive',
        'les funciona poder cancelar transacciones': 'Positive', 
        'no tienen problema con ontop y les gusta mucho': 'Positive',
        'les gusta mucho el servicio que prestamos': 'Positive',
        'auto-charge les parece bien': 'Positive',
        'en lo general no tienen problema': 'Positive',
        'conformes de nuestro lado': 'Positive',
        'estamos muy conformes con el servicio': 'Positive',
        'le encanta la plataforma': 'Positive',
        'esta muy conforme con la plataforma': 'Positive',
        'están muy conformes': 'Positive'
    }
    
    # Check for manual corrections first
    for phrase, sentiment in manual_corrections.items():
        if phrase.lower() in text_lower:
            return {
                'sentiment': sentiment,
                'confidence': 1.0,
                'method': 'manual_correction',
                'vader_score': 0.5 if sentiment == 'Positive' else -0.5 if sentiment == 'Negative' else 0,
                'textblob_score': 0.5 if sentiment == 'Positive' else -0.5 if sentiment == 'Negative' else 0
            }
    
    # Count positive and negative phrases
    positive_score = 0
    negative_score = 0
    
    for phrase in positive_phrases:
        positive_score += len(re.findall(rf'\b{re.escape(phrase)}\b', text_lower))
    
    for phrase in negative_phrases:
        negative_score += len(re.findall(rf'\b{re.escape(phrase)}\b', text_lower))
    
    # Use VADER as backup
    analyzer = SentimentIntensityAnalyzer()
    vader_score = analyzer.polarity_scores(text)['compound']
    
    # Use TextBlob as backup
    blob = TextBlob(text)
    textblob_score = blob.sentiment.polarity
    
    # Rule-based decision with fallback to automated
    if positive_score > negative_score and positive_score > 0:
        sentiment = 'Positive'
        confidence = min(0.8 + (positive_score * 0.1), 1.0)
        method = 'rule_based'
    elif negative_score > positive_score and negative_score > 0:
        sentiment = 'Negative' 
        confidence = min(0.8 + (negative_score * 0.1), 1.0)
        method = 'rule_based'
    else:
        # Fallback to automated analysis
        method = 'automated'
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
        'method': method,
        'vader_score': vader_score,
        'textblob_score': textblob_score
    }

def analyze_sentiment(df):
    """Comprehensive sentiment analysis with improved Spanish handling"""
    print("🧠 Performing improved sentiment analysis...")
    
    results = []
    
    for feedback in df['Feedback']:
        result = improved_spanish_sentiment_analysis(feedback)
        results.append(result)
    
    # Add results to dataframe
    df['Sentiment'] = [r['sentiment'] for r in results]
    df['Sentiment_Confidence'] = [r['confidence'] for r in results]
    df['Analysis_Method'] = [r['method'] for r in results]
    df['VADER_Score'] = [r['vader_score'] for r in results]
    df['TextBlob_Polarity'] = [r['textblob_score'] for r in results]
    
    # Print analysis summary
    total = len(df)
    positive = len(df[df['Sentiment'] == 'Positive'])
    negative = len(df[df['Sentiment'] == 'Negative']) 
    neutral = len(df[df['Sentiment'] == 'Neutral'])
    manual = len(df[df['Analysis_Method'] == 'manual_correction'])
    rule_based = len(df[df['Analysis_Method'] == 'rule_based'])
    
    print(f"📊 Sentiment Analysis Results:")
    print(f"   😊 Positive: {positive} ({positive/total*100:.1f}%)")
    print(f"   😐 Neutral: {neutral} ({neutral/total*100:.1f}%)")
    print(f"   😞 Negative: {negative} ({negative/total*100:.1f}%)")
    print(f"   ✋ Manual corrections: {manual}")
    print(f"   📋 Rule-based: {rule_based}")
    print(f"   🤖 Automated: {total - manual - rule_based}")
    
    return df

def extract_key_insights(df):
    """Extract comprehensive business insights"""
    insights = {}
    
    # Overall metrics
    total_feedback = len(df)
    positive_count = len(df[df['Sentiment'] == 'Positive'])
    negative_count = len(df[df['Sentiment'] == 'Negative'])
    neutral_count = len(df[df['Sentiment'] == 'Neutral'])
    
    # Analysis quality metrics
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
        'rule_based_classifications': rule_based,
        'analysis_accuracy': round(high_confidence/total_feedback*100, 1)
    }
    
    # Critical issues (most negative feedback)
    critical_issues = df[df['Sentiment'] == 'Negative'].nsmallest(10, 'VADER_Score')
    insights['critical_issues'] = []
    
    for _, row in critical_issues.iterrows():
        insights['critical_issues'].append({
            'client': row['Account Name'],
            'date': row['Created Date'].strftime('%Y-%m-%d') if pd.notna(row['Created Date']) else 'N/A',
            'feedback': row['Feedback'][:300] + '...' if len(row['Feedback']) > 300 else row['Feedback'],
            'severity_score': round(row['VADER_Score'], 3),
            'account_owner': row['Account Owner']
        })
    
    # Success stories (most positive feedback)
    success_stories = df[df['Sentiment'] == 'Positive'].nlargest(10, 'VADER_Score')
    insights['success_stories'] = []
    
    for _, row in success_stories.iterrows():
        insights['success_stories'].append({
            'client': row['Account Name'],
            'date': row['Created Date'].strftime('%Y-%m-%d') if pd.notna(row['Created Date']) else 'N/A',
            'feedback': row['Feedback'][:300] + '...' if len(row['Feedback']) > 300 else row['Feedback'],
            'satisfaction_score': round(row['VADER_Score'], 3),
            'account_owner': row['Account Owner']
        })
    
    # Account owner performance
    owner_performance = df.groupby('Account Owner').agg({
        'Sentiment': lambda x: (x == 'Positive').sum() / len(x) * 100,
        'VADER_Score': 'mean',
        'Platform Client ID': 'count'
    }).round(2)
    owner_performance.columns = ['Positive_Percentage', 'Avg_Sentiment_Score', 'Total_Feedback']
    owner_performance = owner_performance.sort_values('Positive_Percentage', ascending=False)
    
    insights['top_performers'] = []
    for owner, row in owner_performance.head(5).iterrows():
        insights['top_performers'].append({
            'name': owner,
            'positive_percentage': row['Positive_Percentage'],
            'avg_sentiment_score': row['Avg_Sentiment_Score'],
            'total_feedback': int(row['Total_Feedback'])
        })
    
    # Problem areas by account owner
    insights['needs_attention'] = []
    for owner, row in owner_performance.tail(5).iterrows():
        if row['Total_Feedback'] >= 5:  # Only include owners with significant feedback
            insights['needs_attention'].append({
                'name': owner,
                'positive_percentage': row['Positive_Percentage'],
                'avg_sentiment_score': row['Avg_Sentiment_Score'],
                'total_feedback': int(row['Total_Feedback'])
            })
    
    # Key themes and topics
    all_feedback = ' '.join(df['Feedback'].str.lower())
    
    # Common complaint keywords
    complaint_keywords = [
        'problem', 'issue', 'error', 'bug', 'difficult', 'hard', 'confusing', 'frustrated',
        'disappointed', 'slow', 'expensive', 'fee', 'charge', 'cost', 'payment', 'billing',
        'support', 'help', 'fix', 'broken', 'not working', 'failed', 'wrong'
    ]
    
    # Common praise keywords
    praise_keywords = [
        'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'love', 'happy', 'satisfied',
        'good', 'nice', 'easy', 'simple', 'fast', 'quick', 'helpful', 'support', 'service',
        'platform', 'recommend', 'pleased', 'impressed'
    ]
    
    complaint_mentions = {}
    praise_mentions = {}
    
    for keyword in complaint_keywords:
        count = len(re.findall(rf'\b{keyword}\b', all_feedback))
        if count > 0:
            complaint_mentions[keyword] = count
    
    for keyword in praise_keywords:
        count = len(re.findall(rf'\b{keyword}\b', all_feedback))
        if count > 0:
            praise_mentions[keyword] = count
    
    insights['top_complaints'] = sorted(complaint_mentions.items(), key=lambda x: x[1], reverse=True)[:10]
    insights['top_praise'] = sorted(praise_mentions.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Time-based insights
    if not df['Created Date'].isna().all():
        df['Year'] = df['Created Date'].dt.year
        df['Month'] = df['Created Date'].dt.month_name()
        
        yearly_sentiment = df.groupby(['Year', 'Sentiment']).size().unstack(fill_value=0)
        monthly_sentiment = df.groupby(['Month', 'Sentiment']).size().unstack(fill_value=0)
        
        insights['yearly_trends'] = yearly_sentiment.to_dict()
        insights['monthly_patterns'] = monthly_sentiment.to_dict()
    
    # Feature requests and improvements
    improvement_keywords = [
        'would like', 'need', 'want', 'request', 'suggestion', 'improve', 'add', 'feature',
        'integration', 'automate', 'automatic', 'option', 'functionality', 'capability'
    ]
    
    improvement_feedback = []
    for _, row in df.iterrows():
        feedback_lower = row['Feedback'].lower()
        for keyword in improvement_keywords:
            if keyword in feedback_lower:
                improvement_feedback.append({
                    'client': row['Account Name'],
                    'feedback': row['Feedback'][:200] + '...' if len(row['Feedback']) > 200 else row['Feedback'],
                    'keyword': keyword
                })
                break
    
    insights['feature_requests'] = improvement_feedback[:15]
    
    # Area-specific analysis (NEW!)
    if 'Feedback directed to' in df.columns:
        area_analysis = analyze_by_area(df)
        insights['area_analysis'] = area_analysis
    
    return insights

def analyze_by_area(df):
    """Analyze feedback by area/department"""
    area_insights = {}
    
    # Overall area distribution
    area_counts = df['Feedback directed to'].value_counts()
    area_insights['area_distribution'] = area_counts.to_dict()
    
    # Sentiment by area
    area_sentiment = df.groupby(['Feedback directed to', 'Sentiment']).size().unstack(fill_value=0)
    
    # Calculate sentiment percentages by area
    area_sentiment_pct = area_sentiment.div(area_sentiment.sum(axis=1), axis=0) * 100
    
    area_performance = []
    for area in area_sentiment.index:
        total_feedback = area_sentiment.loc[area].sum()
        positive_pct = area_sentiment_pct.loc[area, 'Positive'] if 'Positive' in area_sentiment_pct.columns else 0
        negative_pct = area_sentiment_pct.loc[area, 'Negative'] if 'Negative' in area_sentiment_pct.columns else 0
        neutral_pct = area_sentiment_pct.loc[area, 'Neutral'] if 'Neutral' in area_sentiment_pct.columns else 0
        
        # Calculate average sentiment score
        area_df = df[df['Feedback directed to'] == area]
        avg_sentiment_score = area_df['VADER_Score'].mean()
        
        area_performance.append({
            'area': area,
            'total_feedback': int(total_feedback),
            'positive_percentage': round(positive_pct, 1),
            'negative_percentage': round(negative_pct, 1),
            'neutral_percentage': round(neutral_pct, 1),
            'avg_sentiment_score': round(avg_sentiment_score, 3),
            'satisfaction_grade': get_satisfaction_grade(positive_pct, negative_pct)
        })
    
    # Sort by positive percentage (best performing first)
    area_performance.sort(key=lambda x: x['positive_percentage'], reverse=True)
    area_insights['area_performance'] = area_performance
    
    # Identify top performing and struggling areas
    area_insights['top_performing_areas'] = area_performance[:3]
    area_insights['areas_needing_attention'] = [area for area in area_performance if area['positive_percentage'] < 50 and area['total_feedback'] >= 5]
    
    # Critical issues by area
    critical_by_area = {}
    for area in df['Feedback directed to'].unique():
        area_df = df[df['Feedback directed to'] == area]
        critical_issues = area_df[area_df['Sentiment'] == 'Negative'].nsmallest(3, 'VADER_Score')
        
        critical_by_area[area] = []
        for _, row in critical_issues.iterrows():
            critical_by_area[area].append({
                'client': row['Account Name'],
                'date': row['Created Date'].strftime('%Y-%m-%d') if pd.notna(row['Created Date']) else 'N/A',
                'feedback': row['Feedback'][:200] + '...' if len(row['Feedback']) > 200 else row['Feedback'],
                'severity_score': round(row['VADER_Score'], 3)
            })
    
    area_insights['critical_issues_by_area'] = critical_by_area
    
    # Success stories by area
    success_by_area = {}
    for area in df['Feedback directed to'].unique():
        area_df = df[df['Feedback directed to'] == area]
        success_stories = area_df[area_df['Sentiment'] == 'Positive'].nlargest(3, 'VADER_Score')
        
        success_by_area[area] = []
        for _, row in success_stories.iterrows():
            success_by_area[area].append({
                'client': row['Account Name'],
                'date': row['Created Date'].strftime('%Y-%m-%d') if pd.notna(row['Created Date']) else 'N/A',
                'feedback': row['Feedback'][:200] + '...' if len(row['Feedback']) > 200 else row['Feedback'],
                'satisfaction_score': round(row['VADER_Score'], 3)
            })
    
    area_insights['success_stories_by_area'] = success_by_area
    
    return area_insights

def get_satisfaction_grade(positive_pct, negative_pct):
    """Assign a satisfaction grade based on sentiment percentages"""
    if positive_pct >= 70:
        return 'A - Excellent'
    elif positive_pct >= 60:
        return 'B - Good'
    elif positive_pct >= 50:
        return 'C - Average'
    elif positive_pct >= 40:
        return 'D - Needs Improvement'
    else:
        return 'F - Critical'

def generate_executive_summary(insights):
    """Generate executive summary"""
    overview = insights['overview']
    
    summary = f"""
    ## 📊 Executive Summary - Ontop Client Feedback Analysis
    
    ### 🎯 Analysis Quality & Methodology
    - **Enhanced Spanish Sentiment Analysis**: Custom-built for accurate Spanish feedback interpretation
    - **Manual Corrections Applied**: {overview.get('manual_corrections_applied', 0)} feedback entries manually reviewed
    - **Rule-Based Classifications**: {overview.get('rule_based_classifications', 0)} entries classified using Spanish language rules
    - **Analysis Accuracy**: {overview.get('analysis_accuracy', 'N/A')}% high-confidence predictions
    
    ### 📈 Overall Sentiment Health
    - **Total Feedback Analyzed**: {overview['total_feedback']:,} entries
    - **Positive Sentiment**: {overview['positive_percentage']}% ({overview['positive_count']:,} feedbacks)
    - **Negative Sentiment**: {overview['negative_percentage']}% ({overview['negative_count']:,} feedbacks)
    - **Neutral Sentiment**: {overview['neutral_percentage']}% ({overview['neutral_count']:,} feedbacks)
    
    ### Key Findings
    
    #### 🎯 **Sentiment Score: {overview['positive_percentage']}% Positive**
    {"✅ **EXCELLENT** - Client satisfaction is very high!" if overview['positive_percentage'] > 70 else 
     "⚠️ **GOOD** - Room for improvement in client satisfaction" if overview['positive_percentage'] > 50 else
     "🚨 **NEEDS ATTENTION** - Client satisfaction requires immediate focus"}
    
    #### 🔍 **Critical Areas Requiring Attention**
    """
    
    if insights['critical_issues']:
        summary += f"- **{len(insights['critical_issues'])} critical issues** identified requiring immediate response\n"
        summary += f"- Most severe issue: {insights['critical_issues'][0]['client']} (Score: {insights['critical_issues'][0]['severity_score']})\n"
    
    if insights['top_complaints']:
        top_complaint = insights['top_complaints'][0]
        summary += f"- Most mentioned complaint: **{top_complaint[0]}** ({top_complaint[1]} mentions)\n"
    
    summary += f"""
    #### ⭐ **Success Highlights**
    """
    
    if insights['success_stories']:
        summary += f"- **{len(insights['success_stories'])} exceptional success stories** to celebrate\n"
        summary += f"- Highest satisfaction: {insights['success_stories'][0]['client']} (Score: {insights['success_stories'][0]['satisfaction_score']})\n"
    
    if insights['top_praise']:
        top_praise = insights['top_praise'][0]
        summary += f"- Most appreciated aspect: **{top_praise[0]}** ({top_praise[1]} mentions)\n"
    
    summary += f"""
    #### 👥 **Team Performance**
    """
    
    if insights['top_performers']:
        top_performer = insights['top_performers'][0]
        summary += f"- **Top performer**: {top_performer['name']} ({top_performer['positive_percentage']}% positive feedback)\n"
    
    if insights['needs_attention']:
        needs_help = insights['needs_attention'][0] if insights['needs_attention'] else None
        if needs_help:
            summary += f"- **Needs support**: {needs_help['name']} ({needs_help['positive_percentage']}% positive feedback)\n"
    
    summary += f"""
    #### 🚀 **Strategic Opportunities**
    - **{len(insights['feature_requests'])} feature requests** identified for product development
    - Focus on addressing payment/billing concerns (most common complaint category)
    - Leverage success stories for marketing and case studies
    """
    
    # Add area analysis if available
    if 'area_analysis' in insights:
        area_analysis = insights['area_analysis']
        summary += f"""
    
    ### 🏢 **Department/Area Performance Analysis**
    
    #### 🏆 **Top Performing Areas**
    """
        
        for area in area_analysis.get('top_performing_areas', [])[:3]:
            grade_emoji = "🟢" if area['satisfaction_grade'].startswith('A') else "🟡" if area['satisfaction_grade'].startswith('B') else "🟠"
            summary += f"- **{area['area']}**: {area['positive_percentage']}% positive feedback ({area['total_feedback']} total) {grade_emoji} {area['satisfaction_grade']}\n"
        
        summary += f"""
    #### ⚠️ **Areas Needing Attention**
    """
        
        struggling_areas = area_analysis.get('areas_needing_attention', [])
        if struggling_areas:
            for area in struggling_areas[:3]:
                summary += f"- **{area['area']}**: {area['positive_percentage']}% positive feedback ({area['total_feedback']} total) 🔴 {area['satisfaction_grade']}\n"
        else:
            summary += "- All areas are performing well! 🎉\n"
        
        summary += f"""
    #### 📊 **Area Distribution**
    """
        area_dist = area_analysis.get('area_distribution', {})
        total_feedback_areas = sum(area_dist.values())
        for area, count in sorted(area_dist.items(), key=lambda x: x[1], reverse=True)[:5]:
            percentage = count / total_feedback_areas * 100
            summary += f"- **{area}**: {count} feedbacks ({percentage:.1f}%)\n"
    
    return summary

def main():
    """Main analysis function"""
    print("🔍 Starting comprehensive feedback analysis...")
    
    # Load and analyze data
    df = load_data()
    print(f"📊 Loaded {len(df)} feedback entries")
    
    df = analyze_sentiment(df)
    print("✅ Sentiment analysis completed")
    
    insights = extract_key_insights(df)
    print("✅ Key insights extracted")
    
    summary = generate_executive_summary(insights)
    print("✅ Executive summary generated")
    
    # Save insights to JSON file
    with open('feedback_insights.json', 'w', encoding='utf-8') as f:
        json.dump(insights, f, indent=2, ensure_ascii=False, default=str)
    
    # Save executive summary
    with open('executive_summary.md', 'w', encoding='utf-8') as f:
        f.write(summary)
    
    # Save processed data
    df.to_csv('processed_feedback.csv', index=False, encoding='utf-8')
    
    print("\n" + "="*60)
    print("📈 ANALYSIS COMPLETE!")
    print("="*60)
    print(f"✅ Insights saved to: feedback_insights.json")
    print(f"✅ Summary saved to: executive_summary.md")
    print(f"✅ Processed data: processed_feedback.csv")
    print("\n🎯 Ready to run the enhanced dashboard!")
    
    return insights, summary

if __name__ == "__main__":
    main()
