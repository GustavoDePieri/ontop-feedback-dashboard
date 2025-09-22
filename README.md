# 📊 Ontop Client Feedback Analytics Dashboard

A comprehensive, modern web dashboard for analyzing client feedback data with advanced analytics, sentiment analysis, and interactive visualizations.

## 🌟 Features

### Core Analytics
- **Sentiment Analysis**: Advanced sentiment classification using VADER and TextBlob
- **Topic Modeling**: Automatic topic extraction using Latent Dirichlet Allocation (LDA)
- **Temporal Analysis**: Time-based trends and seasonal patterns
- **Account Analysis**: Performance metrics by account owners and clients

### Advanced Insights
- **Critical Issues Identification**: Automatically identifies most concerning feedback
- **Success Stories**: Highlights positive feedback and client satisfaction
- **Keyword Analysis**: Word clouds for different sentiment categories
- **Interactive Filtering**: Dynamic filters for date ranges, account owners, and sentiments

### Visualizations
- 📈 Interactive charts and graphs using Plotly
- 🥧 Sentiment distribution pie charts
- 📊 Time series analysis
- 🔥 Heatmaps for topic-word associations
- ☁️ Word clouds for keyword visualization
- 📱 Responsive design for mobile and desktop

## 🚀 Quick Start

### 🌐 Deploy to Render (Recommended)

**One-Click Deployment:**

1. **Fork this repository** to your GitHub account
2. **Upload your CSV data** to the repository root
3. **Deploy to Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the configuration and deploy!

📖 **[Full Deployment Guide](DEPLOYMENT.md)**

### 💻 Local Development

**Prerequisites:**
- Python 3.8 or higher
- Your `clientsFeedbacks.csv` file in the project directory

**Installation:**

1. **Clone or download** this project to your local machine

2. **Run the setup script** to install all dependencies:
   ```bash
   py setup.py
   ```

3. **Launch the dashboard**:
   ```bash
   py -m streamlit run dashboard.py
   ```

4. **Open your browser** - The dashboard will automatically open at `http://localhost:8501`

## 📋 Manual Installation (Alternative)

If you prefer to install manually:

```bash
# Install required packages
py -m pip install -r requirements.txt

# Run the dashboard
py -m streamlit run dashboard.py
```

## 🎛️ Dashboard Sections

### 1. Overview Metrics
- Total feedback count
- Sentiment distribution (Positive, Neutral, Negative)
- Key performance indicators

### 2. Sentiment Analysis
- Real-time sentiment classification
- Sentiment trends over time
- Distribution charts and visualizations

### 3. Account Analysis
- Top performing account owners
- Client feedback patterns
- Account-specific sentiment analysis

### 4. Keyword Analysis
- Word clouds by sentiment
- Most frequent terms and phrases
- Keyword importance scoring

### 5. Topic Modeling
- Automatic topic discovery
- Topic-word association matrices
- Business theme identification

### 6. Temporal Analysis
- Feedback volume trends
- Seasonal patterns
- Time-based sentiment changes

### 7. Advanced Insights
- Critical issues requiring immediate attention
- Success stories and positive highlights
- Actionable business recommendations

### 8. Data Explorer
- Interactive data table
- Advanced filtering options
- Export functionality

## 🎨 Dashboard Features

### Interactive Filters
- **Date Range**: Filter feedback by specific time periods
- **Account Owners**: Focus on specific team members
- **Sentiment Types**: Analyze specific sentiment categories

### Modern UI/UX
- Gradient color schemes
- Responsive design
- Intuitive navigation
- Professional styling

### Export Capabilities
- Download filtered datasets
- Export visualizations
- Generate reports

## 📊 Analytics Capabilities

### Sentiment Analysis Algorithms
- **VADER Sentiment**: Specialized for social media text
- **TextBlob**: General purpose sentiment analysis
- **Combined Scoring**: Hybrid approach for accuracy

### Machine Learning Features
- **Topic Modeling**: LDA algorithm for theme discovery
- **TF-IDF Vectorization**: Advanced text processing
- **Clustering**: Automatic grouping of similar feedback

### Statistical Analysis
- Trend analysis and forecasting
- Correlation analysis
- Distribution analysis
- Seasonal decomposition

## 🔧 Customization

The dashboard is highly customizable. You can:

- Modify color schemes in the CSS section
- Adjust the number of topics in topic modeling
- Change sentiment thresholds
- Add new visualization types
- Integrate additional data sources

## 📈 Business Value

### For Management
- **Strategic Insights**: Understand client satisfaction trends
- **Issue Identification**: Quickly spot problems requiring attention
- **Performance Monitoring**: Track account owner effectiveness
- **Data-Driven Decisions**: Make informed business decisions

### For Customer Success Teams
- **Client Health Monitoring**: Track sentiment changes over time
- **Proactive Support**: Identify at-risk clients early
- **Success Pattern Recognition**: Learn from positive feedback
- **Workflow Optimization**: Improve processes based on feedback

### for Product Teams
- **Feature Prioritization**: Understand most requested features
- **User Experience Insights**: Identify pain points
- **Product Roadmap**: Align development with client needs
- **Quality Assurance**: Monitor product satisfaction

## 🛠️ Technical Stack

- **Frontend**: Streamlit (Python web framework)
- **Data Processing**: Pandas, NumPy
- **Visualizations**: Plotly, Matplotlib, Seaborn
- **NLP/ML**: scikit-learn, NLTK, TextBlob, VADER
- **Styling**: Custom CSS with modern design principles
- **Deployment**: Render.com (Production-ready with auto-scaling)

## 📁 File Structure

```
feedbackAnalysis/
├── 📊 Core Application
│   ├── dashboard.py                    # Main Streamlit dashboard
│   ├── analyze_feedback.py            # Advanced sentiment analysis
│   └── setup.py                       # Setup and installation script
├── 🗂️ Data Files
│   ├── clientsFeedbackWithArea_utf8.csv    # Feedback data with areas (preferred)
│   ├── clientsFeedbacks_utf8.csv           # Basic feedback data
│   └── *.csv                               # Auto-detected CSV files
├── 🚀 Deployment Configuration
│   ├── render.yaml                     # Render.com deployment config
│   ├── start.sh                        # Production startup script
│   ├── Procfile                        # Alternative process file
│   ├── requirements.txt                # Python dependencies
│   └── .streamlit/config.toml          # Streamlit production config
├── 📖 Documentation
│   ├── README.md                       # This documentation
│   ├── DEPLOYMENT.md                   # Deployment guide
│   └── env.example                     # Environment variables template
└── 📈 Generated Files (auto-created)
    ├── feedback_insights.json          # Pre-computed analysis results
    ├── executive_summary.md            # Business summary report
    └── processed_feedback.csv          # Processed dataset
```

## 🤝 Support

If you encounter any issues:

1. Ensure all dependencies are installed correctly
2. Verify that `clientsFeedbacks.csv` is in the correct location
3. Check that your Python version is 3.8 or higher
4. Try running the setup script again

## 🌐 Production Deployment

This dashboard is **production-ready** and optimized for cloud deployment:

- ✅ **Auto-scaling**: Handles varying traffic loads
- ✅ **Health Monitoring**: Built-in health check endpoints
- ✅ **Performance Optimized**: Caching, background processing, efficient data loading
- ✅ **Security**: CORS disabled, XSRF protection, HTTPS-ready
- ✅ **Zero-Downtime**: Automatic deployments with rollback capability

### 🚀 Deploy Now
1. Fork this repository
2. Add your CSV data files
3. Connect to [Render.com](https://render.com)
4. Your dashboard will be live in minutes!

📖 **[Complete Deployment Guide](DEPLOYMENT.md)**

## 🔮 Future Enhancements

Potential future features:
- Real-time data integration via APIs
- Advanced predictive analytics and forecasting  
- Custom alert systems and notifications
- Multi-language support for global feedback
- REST API endpoints for data integration
- Advanced reporting and export capabilities
- User authentication and role-based access

---

**Built with ❤️ for Ontop's data-driven decision making**


