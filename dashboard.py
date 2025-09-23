import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
# import seaborn as sns  # Removed for compatibility
import matplotlib.pyplot as plt
# from wordcloud import WordCloud  # Removed for compatibility
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
# from sklearn.feature_extraction.text import TfidfVectorizer  # Removed for compatibility
# from sklearn.cluster import KMeans  # Removed for compatibility
# from sklearn.decomposition import LatentDirichletAllocation  # Removed for compatibility
import numpy as np
import nltk
from collections import Counter
import re
from datetime import datetime, timedelta
import warnings
import os
import sys
warnings.filterwarnings('ignore')

# Production optimizations
plt.switch_backend('Agg')  # Use non-interactive backend for matplotlib

# Ensure NLTK data is available
def ensure_nltk_data():
    """Ensure required NLTK data is downloaded"""
    try:
        nltk.data.find('tokenizers/punkt')
        nltk.data.find('corpora/stopwords')
        nltk.data.find('vader_lexicon')
    except LookupError:
        try:
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('vader_lexicon', quiet=True)
        except Exception as e:
            st.error(f"Error downloading NLTK data: {e}")

# Initialize NLTK data
ensure_nltk_data()

# Configure Streamlit page
st.set_page_config(
    page_title="Ontop Client Feedback Analytics",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for modern styling
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
        background: linear-gradient(90deg, #1f77b4, #ff7f0e);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        margin: 0.5rem 0;
    }
    
    .insight-box {
        background: #ffffff;
        padding: 1rem;
        border-left: 4px solid #1f77b4;
        border-radius: 5px;
        margin: 1rem 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        color: #333333;
    }
    
    .critical-issue {
        background: #fff5f5;
        border-left-color: #e53e3e;
        color: #2d3748;
    }
    
    .success-story {
        background: #f0fff4;
        border-left-color: #38a169;
        color: #2d3748;
    }
    
    .topic-box {
        background: #ffffff;
        padding: 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin: 0.5rem 0;
        color: #2d3748;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .insight-header {
        font-weight: bold;
        color: #2d3748;
        font-size: 1.1em;
        margin-bottom: 0.5rem;
    }
    
    .sidebar .sidebar-content {
        background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    }
    
    .stSelectbox > div > div {
        background-color: #f0f2f6;
    }
</style>
""", unsafe_allow_html=True)

def health_check():
    """Health check endpoint for deployment monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "dependencies": {
            "streamlit": st.__version__,
            "pandas": pd.__version__,
            "numpy": np.__version__
        }
    }

@st.cache_data(ttl=3600)  # Cache for 1 hour in production
def load_and_process_data():
    """Load and preprocess the feedback data"""
    try:
        # Try different encodings and file versions
        encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'utf-16']
        csv_files = [
            'clientsFeedbackWithArea_utf8.csv', 
            'clientsFeedbackWithArea.csv', 
            'clientsFeedbacks_utf8.csv',
            'clientsFeedbacks.csv'
        ]
        df = None
        
        for csv_file in csv_files:
            for encoding in encodings:
                try:
                    st.info(f"Trying to load {csv_file} with {encoding} encoding...")
                    df = pd.read_csv(csv_file, encoding=encoding)
                    st.success(f"Successfully loaded {csv_file} with {encoding} encoding!")
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
            st.error("Could not load the CSV file with any supported encoding.")
            return None
        
        # Clean column names
        df.columns = df.columns.str.strip().str.replace('"', '')
        
        # Check if we have the area column
        if 'Feedback directed to' not in df.columns:
            st.warning("⚠️ 'Feedback directed to' column not found. Using basic analysis.")
            df['Feedback directed to'] = 'Unknown'
        else:
            st.success(f"✅ Found 'Feedback directed to' column with {df['Feedback directed to'].nunique()} different areas")
        
        # Convert date column
        df['Created Date'] = pd.to_datetime(df['Created Date'], errors='coerce')
        
        # Handle feedback column (might have different names)
        if 'Feedback' not in df.columns:
            feedback_cols = [col for col in df.columns if 'feedback' in col.lower()]
            if feedback_cols:
                df['Feedback'] = df[feedback_cols[0]]
            else:
                st.error("No feedback column found in the data")
                return None
        
        # Clean feedback text
        df['Feedback'] = df['Feedback'].astype(str).str.strip()
        
        # Remove empty or very short feedbacks
        df = df[df['Feedback'].str.len() > 10]
        
        st.success(f"Loaded {len(df)} feedback entries successfully!")
        
        return df
    except Exception as e:
        st.error(f"Error loading data: {str(e)}")
        st.error("Please ensure 'clientsFeedbacks.csv' exists in the same directory as this dashboard.")
        return None

@st.cache_data
def perform_sentiment_analysis(df):
    """Perform sentiment analysis using multiple methods"""
    analyzer = SentimentIntensityAnalyzer()
    
    sentiments = []
    textblob_polarities = []
    vader_scores = []
    
    for feedback in df['Feedback']:
        # TextBlob sentiment
        blob = TextBlob(feedback)
        textblob_polarities.append(blob.sentiment.polarity)
        
        # VADER sentiment
        vader_score = analyzer.polarity_scores(feedback)
        vader_scores.append(vader_score['compound'])
        
        # Combined sentiment classification
        if vader_score['compound'] >= 0.05:
            sentiment = 'Positive'
        elif vader_score['compound'] <= -0.05:
            sentiment = 'Negative'
        else:
            sentiment = 'Neutral'
        sentiments.append(sentiment)
    
    df['Sentiment'] = sentiments
    df['TextBlob_Polarity'] = textblob_polarities
    df['VADER_Score'] = vader_scores
    
    return df

# extract_topics function removed - sklearn dependency not compatible with Python 3.13

def create_sentiment_overview(df):
    """Create sentiment overview visualizations"""
    col1, col2, col3, col4 = st.columns(4)
    
    total_feedback = len(df)
    positive_count = len(df[df['Sentiment'] == 'Positive'])
    negative_count = len(df[df['Sentiment'] == 'Negative'])
    neutral_count = len(df[df['Sentiment'] == 'Neutral'])
    
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <h3>📝 Total Feedbacks</h3>
            <h2>{total_feedback:,}</h2>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <h3>😊 Positive</h3>
            <h2>{positive_count:,} ({positive_count/total_feedback*100:.1f}%)</h2>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <h3>😐 Neutral</h3>
            <h2>{neutral_count:,} ({neutral_count/total_feedback*100:.1f}%)</h2>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        st.markdown(f"""
        <div class="metric-card">
            <h3>😞 Negative</h3>
            <h2>{negative_count:,} ({negative_count/total_feedback*100:.1f}%)</h2>
        </div>
        """, unsafe_allow_html=True)

def create_sentiment_charts(df):
    """Create detailed sentiment analysis charts"""
    col1, col2 = st.columns(2)
    
    with col1:
        # Sentiment distribution pie chart
        sentiment_counts = df['Sentiment'].value_counts()
        fig_pie = px.pie(
            values=sentiment_counts.values,
            names=sentiment_counts.index,
            title="Sentiment Distribution",
            color_discrete_map={
                'Positive': '#2ecc71',
                'Neutral': '#f39c12',
                'Negative': '#e74c3c'
            }
        )
        fig_pie.update_layout(height=400)
        st.plotly_chart(fig_pie, use_container_width=True)
    
    with col2:
        # Sentiment over time
        df_time = df.groupby([df['Created Date'].dt.to_period('M'), 'Sentiment']).size().unstack(fill_value=0)
        fig_time = px.line(
            x=df_time.index.astype(str),
            y=[df_time[col] for col in df_time.columns],
            title="Sentiment Trends Over Time",
            labels={'x': 'Month', 'y': 'Number of Feedbacks'}
        )
        for i, col in enumerate(df_time.columns):
            fig_time.data[i].name = col
        fig_time.update_layout(height=400)
        st.plotly_chart(fig_time, use_container_width=True)

def create_account_analysis(df):
    """Analyze feedback by account owners and clients"""
    col1, col2 = st.columns(2)
    
    with col1:
        # Top account owners by feedback volume
        owner_counts = df['Account Owner'].value_counts().head(10)
        fig_owners = px.bar(
            x=owner_counts.values,
            y=owner_counts.index,
            orientation='h',
            title="Top 10 Account Owners by Feedback Volume",
            labels={'x': 'Number of Feedbacks', 'y': 'Account Owner'}
        )
        fig_owners.update_layout(height=500)
        st.plotly_chart(fig_owners, use_container_width=True)
    
    with col2:
        # Sentiment by account owner
        owner_sentiment = df.groupby(['Account Owner', 'Sentiment']).size().unstack(fill_value=0)
        owner_sentiment = owner_sentiment.head(10)
        
        fig_owner_sent = px.bar(
            owner_sentiment,
            title="Sentiment Distribution by Top Account Owners",
            color_discrete_map={
                'Positive': '#2ecc71',
                'Neutral': '#f39c12',
                'Negative': '#e74c3c'
            }
        )
        fig_owner_sent.update_layout(height=500, xaxis_tickangle=-45)
        st.plotly_chart(fig_owner_sent, use_container_width=True)

def create_wordcloud_analysis(df):
    """Create keyword analysis for different sentiments using bar charts"""
    col1, col2, col3 = st.columns(3)
    
    sentiments = ['Positive', 'Neutral', 'Negative']
    colors = ['#2ecc71', '#f39c12', '#e74c3c']
    
    for i, (sentiment, color) in enumerate(zip(sentiments, colors)):
        with [col1, col2, col3][i]:
            sentiment_data = df[df['Sentiment'] == sentiment]
            
            if len(sentiment_data) > 0:
                # Extract top keywords using simple word frequency
                all_text = ' '.join(sentiment_data['Feedback'].str.lower())
                words = re.findall(r'\b[a-zA-Z]{4,}\b', all_text)
                
                # Common stop words to filter out
                stop_words = {'that', 'with', 'have', 'this', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'about', 'would', 'there', 'could', 'other', 'more', 'very', 'what', 'know', 'just', 'first', 'into', 'over', 'think', 'also', 'your', 'work', 'life', 'only', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'}
                
                # Filter and count words
                filtered_words = [word for word in words if word not in stop_words and len(word) > 3]
                word_freq = Counter(filtered_words).most_common(10)
                
                if word_freq:
                    words_list, counts = zip(*word_freq)
                    
                    fig = px.bar(
                        x=list(counts),
                        y=list(words_list),
                        orientation='h',
                        title=f'{sentiment} Keywords',
                        color_discrete_sequence=[color]
                    )
                    fig.update_layout(
                        height=400,
                        showlegend=False,
                        xaxis_title="Frequency",
                        yaxis_title="Keywords"
                    )
                    st.plotly_chart(fig, use_container_width=True)
                else:
                    st.info(f"No keywords found for {sentiment} sentiment")
            else:
                st.info(f"No {sentiment} feedback found")

def create_topic_analysis(insights):
    """Create topic modeling analysis with pre-computed insights"""
    st.subheader("🎯 Key Topics & Themes Analysis")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<div class="insight-header">🚨 Most Common Complaints</div>', unsafe_allow_html=True)
        for keyword, count in insights.get('top_complaints', [])[:8]:
            st.markdown(f"""
            <div class="topic-box">
                <strong>{keyword.title()}</strong><br>
                <small style="color: #e53e3e;">Mentioned {count} times in feedback</small>
            </div>
            """, unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="insight-header">⭐ Most Common Praise</div>', unsafe_allow_html=True)
        for keyword, count in insights.get('top_praise', [])[:8]:
            st.markdown(f"""
            <div class="topic-box">
                <strong>{keyword.title()}</strong><br>
                <small style="color: #38a169;">Mentioned {count} times in feedback</small>
            </div>
            """, unsafe_allow_html=True)

def create_advanced_insights(insights):
    """Create advanced business insights with pre-computed data"""
    st.subheader("🔍 Advanced Business Insights")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<div class="insight-header">🚨 Critical Issues Requiring Attention</div>', unsafe_allow_html=True)
        
        for issue in insights.get('critical_issues', [])[:5]:
            st.markdown(f"""
            <div class="insight-box critical-issue">
                <div class="insight-header">Client: {issue['client']}</div>
                <strong>Date:</strong> {issue['date']}<br>
                <strong>Account Owner:</strong> {issue['account_owner']}<br>
                <strong>Severity Score:</strong> {issue['severity_score']}<br>
                <strong>Issue:</strong> {issue['feedback']}
            </div>
            """, unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="insight-header">⭐ Success Stories & Wins</div>', unsafe_allow_html=True)
        
        for story in insights.get('success_stories', [])[:5]:
            st.markdown(f"""
            <div class="insight-box success-story">
                <div class="insight-header">Client: {story['client']}</div>
                <strong>Date:</strong> {story['date']}<br>
                <strong>Account Owner:</strong> {story['account_owner']}<br>
                <strong>Satisfaction Score:</strong> {story['satisfaction_score']}<br>
                <strong>Praise:</strong> {story['feedback']}
            </div>
            """, unsafe_allow_html=True)

def create_time_analysis(df):
    """Create time-based analysis"""
    st.subheader("📅 Temporal Analysis")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Feedback volume over time
        df['Year'] = df['Created Date'].dt.year
        df['Month'] = df['Created Date'].dt.month
        
        monthly_counts = df.groupby([df['Created Date'].dt.to_period('M')]).size()
        
        fig_volume = px.line(
            x=monthly_counts.index.astype(str),
            y=monthly_counts.values,
            title="Feedback Volume Over Time",
            labels={'x': 'Month', 'y': 'Number of Feedbacks'}
        )
        fig_volume.update_layout(height=400)
        st.plotly_chart(fig_volume, use_container_width=True)
    
    with col2:
        # Seasonal patterns
        df['Month_Name'] = df['Created Date'].dt.month_name()
        monthly_sentiment = df.groupby(['Month_Name', 'Sentiment']).size().unstack(fill_value=0)
        
        # Reorder months
        month_order = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December']
        monthly_sentiment = monthly_sentiment.reindex([m for m in month_order if m in monthly_sentiment.index])
        
        fig_seasonal = px.bar(
            monthly_sentiment,
            title="Seasonal Sentiment Patterns",
            color_discrete_map={
                'Positive': '#2ecc71',
                'Neutral': '#f39c12',
                'Negative': '#e74c3c'
            }
        )
        fig_seasonal.update_layout(height=400)
        st.plotly_chart(fig_seasonal, use_container_width=True)

def create_team_performance_analysis(insights):
    """Create team performance analysis"""
    st.subheader("👥 Team Performance Analysis")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<div class="insight-header">🏆 Top Performing Account Owners</div>', unsafe_allow_html=True)
        
        for performer in insights.get('top_performers', [])[:5]:
            st.markdown(f"""
            <div class="insight-box success-story">
                <div class="insight-header">{performer['name']}</div>
                <strong>Positive Feedback:</strong> {performer['positive_percentage']}%<br>
                <strong>Avg Sentiment Score:</strong> {performer['avg_sentiment_score']}<br>
                <strong>Total Feedback:</strong> {performer['total_feedback']} entries<br>
                <small style="color: #38a169;">Excellent client satisfaction!</small>
            </div>
            """, unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="insight-header">⚠️ Accounts Needing Support</div>', unsafe_allow_html=True)
        
        for account in insights.get('needs_attention', [])[:5]:
            st.markdown(f"""
            <div class="insight-box critical-issue">
                <div class="insight-header">{account['name']}</div>
                <strong>Positive Feedback:</strong> {account['positive_percentage']}%<br>
                <strong>Avg Sentiment Score:</strong> {account['avg_sentiment_score']}<br>
                <strong>Total Feedback:</strong> {account['total_feedback']} entries<br>
                <small style="color: #e53e3e;">May benefit from additional support</small>
            </div>
            """, unsafe_allow_html=True)

def create_feature_requests_analysis(insights):
    """Create feature requests and improvement analysis"""
    st.subheader("🚀 Feature Requests & Improvement Opportunities")
    
    st.markdown('<div class="insight-header">💡 Client Requested Features & Improvements</div>', unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    
    for i, request in enumerate(insights.get('feature_requests', [])[:10]):
        with col1 if i % 2 == 0 else col2:
            st.markdown(f"""
            <div class="insight-box">
                <div class="insight-header">Client: {request['client']}</div>
                <strong>Request:</strong> {request['feedback']}<br>
                <small style="color: #1f77b4;">Category: {request['keyword'].title()}</small>
            </div>
            """, unsafe_allow_html=True)

def load_precomputed_insights():
    """Load pre-computed insights if available"""
    try:
        import json
        with open('feedback_insights.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return None
    except Exception:
        return None

def show_executive_summary():
    """Show executive summary if available"""
    try:
        with open('executive_summary.md', 'r', encoding='utf-8') as f:
            summary = f.read()
        st.markdown(summary)
    except FileNotFoundError:
        st.info("Run the analysis script first to generate executive summary")
    except Exception:
        st.error("Error loading executive summary")

def create_area_analysis(area_data):
    """Create comprehensive area/department analysis"""
    st.subheader("🏢 Department & Area Performance Analysis")
    
    # Area performance overview
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<div class="insight-header">🏆 Top Performing Areas</div>', unsafe_allow_html=True)
        
        for area in area_data.get('top_performing_areas', [])[:5]:
            grade_color = "#2ecc71" if area['satisfaction_grade'].startswith('A') else "#f39c12" if area['satisfaction_grade'].startswith('B') else "#e67e22"
            st.markdown(f"""
            <div class="insight-box" style="border-left-color: {grade_color};">
                <div class="insight-header">{area['area']}</div>
                <strong>Satisfaction Grade:</strong> {area['satisfaction_grade']}<br>
                <strong>Positive Feedback:</strong> {area['positive_percentage']}%<br>
                <strong>Total Feedback:</strong> {area['total_feedback']} entries<br>
                <strong>Avg Sentiment Score:</strong> {area['avg_sentiment_score']}
            </div>
            """, unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="insight-header">⚠️ Areas Needing Attention</div>', unsafe_allow_html=True)
        
        struggling_areas = area_data.get('areas_needing_attention', [])
        if struggling_areas:
            for area in struggling_areas[:5]:
                st.markdown(f"""
                <div class="insight-box critical-issue">
                    <div class="insight-header">{area['area']}</div>
                    <strong>Satisfaction Grade:</strong> {area['satisfaction_grade']}<br>
                    <strong>Positive Feedback:</strong> {area['positive_percentage']}%<br>
                    <strong>Total Feedback:</strong> {area['total_feedback']} entries<br>
                    <strong>Avg Sentiment Score:</strong> {area['avg_sentiment_score']}
                </div>
                """, unsafe_allow_html=True)
        else:
            st.markdown("""
            <div class="insight-box success-story">
                <div class="insight-header">🎉 Great News!</div>
                All areas are performing well with good satisfaction scores!
            </div>
            """, unsafe_allow_html=True)
    
    # Area distribution chart
    st.markdown('<div class="insight-header">📊 Feedback Distribution by Area</div>', unsafe_allow_html=True)
    
    area_dist = area_data.get('area_distribution', {})
    if area_dist:
        # Create pie chart for area distribution
        fig_area_dist = px.pie(
            values=list(area_dist.values()),
            names=list(area_dist.keys()),
            title="Feedback Volume by Department/Area"
        )
        fig_area_dist.update_layout(height=500)
        st.plotly_chart(fig_area_dist, use_container_width=True)
    
    # Area performance comparison
    area_performance = area_data.get('area_performance', [])
    if area_performance:
        st.markdown('<div class="insight-header">📈 Area Performance Comparison</div>', unsafe_allow_html=True)
        
        # Create bar chart comparing positive feedback percentages
        areas = [area['area'] for area in area_performance]
        positive_pcts = [area['positive_percentage'] for area in area_performance]
        total_feedback = [area['total_feedback'] for area in area_performance]
        
        fig_comparison = px.bar(
            x=positive_pcts,
            y=areas,
            orientation='h',
            title="Positive Feedback Percentage by Area",
            labels={'x': 'Positive Feedback %', 'y': 'Area'},
            text=[f"{pct}% ({total} total)" for pct, total in zip(positive_pcts, total_feedback)]
        )
        fig_comparison.update_traces(textposition="inside")
        fig_comparison.update_layout(height=600)
        st.plotly_chart(fig_comparison, use_container_width=True)
    
    # Critical issues by area
    st.markdown('<div class="insight-header">🚨 Critical Issues by Area</div>', unsafe_allow_html=True)
    
    critical_by_area = area_data.get('critical_issues_by_area', {})
    
    # Create tabs for each area with critical issues
    areas_with_issues = [area for area, issues in critical_by_area.items() if issues]
    
    if areas_with_issues:
        tabs = st.tabs(areas_with_issues[:5])  # Limit to 5 tabs for readability
        
        for i, area in enumerate(areas_with_issues[:5]):
            with tabs[i]:
                issues = critical_by_area[area]
                for j, issue in enumerate(issues, 1):
                    st.markdown(f"""
                    <div class="insight-box critical-issue">
                        <div class="insight-header">Issue #{j} - {issue['client']}</div>
                        <strong>Date:</strong> {issue['date']}<br>
                        <strong>Severity Score:</strong> {issue['severity_score']}<br>
                        <strong>Issue:</strong> {issue['feedback']}
                    </div>
                    """, unsafe_allow_html=True)
    else:
        st.markdown("""
        <div class="insight-box success-story">
            <div class="insight-header">🎉 Excellent!</div>
            No critical issues found in any area!
        </div>
        """, unsafe_allow_html=True)

def main():
    """Main dashboard function"""
    # Handle health check requests
    query_params = st.experimental_get_query_params()
    if 'health' in query_params:
        st.json(health_check())
        return
    
    st.markdown('<h1 class="main-header">Ontop Client Feedback Analytics Dashboard</h1>', unsafe_allow_html=True)
    
    # Check for pre-computed insights first
    insights = load_precomputed_insights()
    
    if insights is None:
        st.warning("⚠️ Pre-computed insights not found. Running analysis script first...")
        
        # Run analysis if not done yet
        if st.button("🔍 Run Comprehensive Analysis"):
            with st.spinner("Running comprehensive analysis... This may take a few minutes."):
                import subprocess
                import sys
                try:
                    result = subprocess.run([sys.executable, "analyze_feedback.py"], 
                                          capture_output=True, text=True, timeout=300)
                    if result.returncode == 0:
                        st.success("✅ Analysis completed successfully!")
                        st.experimental_rerun()
                    else:
                        st.error(f"Analysis failed: {result.stderr}")
                except subprocess.TimeoutExpired:
                    st.error("Analysis timed out. Please run manually: py analyze_feedback.py")
                except Exception as e:
                    st.error(f"Error running analysis: {str(e)}")
        
        st.info("Please run: `py analyze_feedback.py` to generate comprehensive insights, then refresh this page.")
        return
    
    # Load data for interactive filtering
    with st.spinner("Loading feedback data for interactive features..."):
        df = load_and_process_data()
        
        if df is None:
            st.error("Failed to load data. Please check if CSV file exists in the current directory.")
            return
        
        # Perform sentiment analysis
        df = perform_sentiment_analysis(df)
        
        # Check if we have area data
        has_area_data = 'Feedback directed to' in df.columns and df['Feedback directed to'].notna().any()
    
    # Sidebar filters
    st.sidebar.header("🎛️ Dashboard Filters")
    
    # Date range filter
    if not df['Created Date'].isna().all():
        date_range = st.sidebar.date_input(
            "Select Date Range",
            value=[df['Created Date'].min().date(), df['Created Date'].max().date()],
            min_value=df['Created Date'].min().date(),
            max_value=df['Created Date'].max().date()
        )
        
        if len(date_range) == 2:
            df = df[(df['Created Date'].dt.date >= date_range[0]) & 
                   (df['Created Date'].dt.date <= date_range[1])]
    
    # Account owner filter
    selected_owners = st.sidebar.multiselect(
        "Select Account Owners",
        options=df['Account Owner'].unique(),
        default=df['Account Owner'].unique()[:5]  # Default to top 5
    )
    
    if selected_owners:
        df = df[df['Account Owner'].isin(selected_owners)]
    
    # Area filter (NEW!)
    if has_area_data:
        available_areas = sorted(df['Feedback directed to'].unique())
        selected_areas = st.sidebar.multiselect(
            "Select Areas/Departments",
            options=available_areas,
            default=available_areas
        )
        
        if selected_areas:
            df = df[df['Feedback directed to'].isin(selected_areas)]
    
    # Sentiment filter
    selected_sentiments = st.sidebar.multiselect(
        "Select Sentiments",
        options=['Positive', 'Neutral', 'Negative'],
        default=['Positive', 'Neutral', 'Negative']
    )
    
    if selected_sentiments:
        df = df[df['Sentiment'].isin(selected_sentiments)]
    
    if len(df) == 0:
        st.warning("No data available with the selected filters.")
        return
    
    # Main dashboard sections
    st.markdown("---")
    
    # Executive Summary (New!)
    st.subheader("📋 Executive Summary")
    with st.expander("📊 View Comprehensive Executive Summary", expanded=True):
        show_executive_summary()
    
    st.markdown("---")
    
    # Overview metrics (using pre-computed data)
    if insights.get('overview'):
        overview = insights['overview']
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.markdown(f"""
            <div class="metric-card">
                <h3>📝 Total Feedbacks</h3>
                <h2>{overview['total_feedback']:,}</h2>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown(f"""
            <div class="metric-card">
                <h3>😊 Positive</h3>
                <h2>{overview['positive_count']:,} ({overview['positive_percentage']}%)</h2>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.markdown(f"""
            <div class="metric-card">
                <h3>😐 Neutral</h3>
                <h2>{overview['neutral_count']:,} ({overview['neutral_percentage']}%)</h2>
            </div>
            """, unsafe_allow_html=True)
        
        with col4:
            st.markdown(f"""
            <div class="metric-card">
                <h3>😞 Negative</h3>
                <h2>{overview['negative_count']:,} ({overview['negative_percentage']}%)</h2>
            </div>
            """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Sentiment analysis
    st.subheader("📊 Sentiment Analysis")
    create_sentiment_charts(df)
    
    st.markdown("---")
    
    # Team Performance Analysis (New!)
    create_team_performance_analysis(insights)
    
    st.markdown("---")
    
    # Advanced insights (using pre-computed data)
    create_advanced_insights(insights)
    
    st.markdown("---")
    
    # Topic analysis (using pre-computed data)
    create_topic_analysis(insights)
    
    st.markdown("---")
    
    # Feature Requests Analysis (New!)
    create_feature_requests_analysis(insights)
    
    st.markdown("---")
    
    # Area Analysis (NEW!)
    if has_area_data and 'area_analysis' in insights:
        create_area_analysis(insights['area_analysis'])
        st.markdown("---")
    
    # Account analysis
    st.subheader("👥 Account Analysis")
    create_account_analysis(df)
    
    st.markdown("---")
    
    # Keyword analysis (replacing word clouds with bar charts for compatibility)
    st.subheader("📊 Keyword Analysis")
    create_wordcloud_analysis(df)
    
    st.markdown("---")
    
    # Time analysis
    create_time_analysis(df)
    
    st.markdown("---")
    
    # Raw data explorer
    with st.expander("🔍 Explore Raw Data"):
        st.subheader("Filtered Dataset")
        st.dataframe(
            df[['Platform Client ID', 'Account Name', 'Created Date', 'Account Owner', 'Sentiment', 'VADER_Score', 'Feedback']],
            use_container_width=True
        )
        
        # Download filtered data
        csv = df.to_csv(index=False)
        st.download_button(
            label="📥 Download Filtered Data as CSV",
            data=csv,
            file_name=f"filtered_feedback_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            mime="text/csv"
        )
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #666; font-size: 14px;">
        <p>Ontop Client Feedback Analytics Dashboard | Built with ❤️ using Streamlit</p>
        <p>Last updated: {}</p>
    </div>
    """.format(datetime.now().strftime("%Y-%m-%d %H:%M:%S")), unsafe_allow_html=True)

if __name__ == "__main__":
    main()
