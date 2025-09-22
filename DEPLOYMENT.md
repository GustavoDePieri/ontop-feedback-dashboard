# 🚀 Deployment Guide - Ontop Feedback Dashboard

This guide covers deploying the Ontop Client Feedback Analytics Dashboard to Render.com.

## 📋 Prerequisites

- GitHub repository with your dashboard code
- Render.com account
- CSV feedback data file(s) in your repository

## 🌐 Deploy to Render

### Option 1: One-Click Deploy (Recommended)

1. **Fork/Clone this repository** to your GitHub account
2. **Upload your CSV data** to the repository root:
   - `clientsFeedbackWithArea_utf8.csv` (preferred)
   - Or `clientsFeedbacks_utf8.csv` 
   - The app will auto-detect the best available file
3. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` configuration

### Option 2: Manual Configuration

If you prefer manual setup:

1. **Create a new Web Service** on Render
2. **Connect your repository**
3. **Configure the service**:
   - **Name**: `ontop-feedback-dashboard`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python setup.py`
   - **Start Command**: `streamlit run dashboard.py --server.port $PORT --server.address 0.0.0.0 --server.headless true --server.enableCORS false --server.enableXsrfProtection false`

## ⚙️ Environment Configuration

The following environment variables are automatically configured:

- `PORT`: Set by Render (typically 10000)
- `PYTHON_VERSION`: 3.9.18
- `STREAMLIT_SERVER_HEADLESS`: true
- `STREAMLIT_SERVER_ENABLE_CORS`: false

## 📁 Required Files

Ensure these files are in your repository:

### Core Application Files
- `dashboard.py` - Main Streamlit application
- `analyze_feedback.py` - Data analysis script
- `requirements.txt` - Python dependencies
- `setup.py` - Setup and initialization script

### Deployment Configuration
- `render.yaml` - Render service configuration
- `start.sh` - Startup script with NLTK data download
- `Procfile` - Alternative process file
- `.streamlit/config.toml` - Streamlit configuration

### Data Files (at least one required)
- `clientsFeedbackWithArea_utf8.csv` (recommended)
- `clientsFeedbackWithArea.csv`
- `clientsFeedbacks_utf8.csv`
- `clientsFeedbacks.csv`

## 🔧 Build Process

The deployment process includes:

1. **Install Dependencies**: `pip install -r requirements.txt`
2. **Run Setup**: `python setup.py` (downloads NLTK data)
3. **Start Application**: Streamlit server on assigned port

## 🏥 Health Check

The application includes a health check endpoint:
- **URL**: `https://your-app.onrender.com/?health=true`
- **Response**: JSON with status, timestamp, and dependency versions

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Fails - Missing Dependencies
**Error**: `ModuleNotFoundError`
**Solution**: Ensure all packages are listed in `requirements.txt`

#### 2. NLTK Data Missing
**Error**: `LookupError: Resource not found`
**Solution**: The app automatically downloads NLTK data. If it fails:
- Check the build logs
- Ensure `setup.py` runs successfully during build

#### 3. CSV File Not Found
**Error**: `FileNotFoundError: CSV file not found`
**Solutions**:
- Ensure your CSV file is committed to the repository
- Check the file name matches one of the expected formats
- Verify the file is not in `.gitignore`

#### 4. Memory Issues
**Error**: `MemoryError` or app crashes
**Solutions**:
- Upgrade to a paid Render plan for more memory
- Optimize data processing in `analyze_feedback.py`
- Reduce the dataset size for testing

#### 5. Slow Loading
**Issue**: Dashboard takes long to load
**Solutions**:
- Pre-run `python analyze_feedback.py` to generate insights
- Commit the generated `feedback_insights.json` file
- This enables faster dashboard loading

### Performance Optimization

1. **Pre-compute Analysis**:
   ```bash
   python analyze_feedback.py
   git add feedback_insights.json executive_summary.md processed_feedback.csv
   git commit -m "Add pre-computed analysis results"
   ```

2. **Enable Caching**: The app uses Streamlit's caching (1-hour TTL in production)

3. **Monitor Resource Usage**: Check Render's metrics dashboard

## 🔐 Security Considerations

- **Data Privacy**: Ensure sensitive client data is handled appropriately
- **Access Control**: Consider adding authentication for production use
- **HTTPS**: Render provides HTTPS by default
- **CORS**: Disabled for security (configured in startup)

## 📊 Monitoring

### Application Metrics
- **Health Check**: Monitor the `/health` endpoint
- **Response Times**: Use Render's built-in monitoring
- **Error Rates**: Check application logs

### Render Dashboard
- Monitor CPU, memory, and bandwidth usage
- Set up alerts for service downtime
- Review deployment logs for issues

## 🔄 Updates and Maintenance

### Deploying Updates
1. Push changes to your connected GitHub repository
2. Render will automatically trigger a new deployment
3. Monitor the build logs for any issues

### Data Updates
1. Update your CSV files in the repository
2. Optionally re-run analysis: `python analyze_feedback.py`
3. Commit and push the changes

## 💰 Cost Considerations

### Render Pricing (as of 2024)
- **Free Tier**: 750 hours/month, sleeps after 15min inactivity
- **Starter Plan**: $7/month, no sleep, custom domains
- **Standard Plan**: $25/month, more resources, better performance

### Recommendations
- **Development/Testing**: Free tier is sufficient
- **Production**: Starter or Standard plan for consistent availability
- **High Usage**: Standard plan for better performance

## 🆘 Support

### Getting Help
1. **Check Logs**: Render Dashboard → Service → Logs
2. **Review Documentation**: This guide and Render's docs
3. **GitHub Issues**: Create an issue in your repository
4. **Render Support**: Available for paid plans

### Useful Commands
```bash
# Local testing
streamlit run dashboard.py

# Run analysis locally
python analyze_feedback.py

# Install dependencies locally
pip install -r requirements.txt
python setup.py
```

## 🎯 Success Checklist

Before going live, ensure:

- [ ] All CSV data files are in the repository
- [ ] Build completes successfully
- [ ] Health check endpoint responds
- [ ] Dashboard loads without errors
- [ ] All visualizations render correctly
- [ ] Analysis insights are generated
- [ ] Performance is acceptable for your use case

---

**🎉 Congratulations!** Your Ontop Feedback Dashboard is now deployed and ready to provide valuable insights into client feedback!
