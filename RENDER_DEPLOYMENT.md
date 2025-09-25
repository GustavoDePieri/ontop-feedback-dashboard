# 🚀 Deploy to Render

This guide will help you deploy your Ontop Feedback Analytics Dashboard to Render.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Google Sheets Credentials**: Service account JSON from Google Cloud Console

## 🔧 Step-by-Step Deployment

### 1. Connect to Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your `ontop-feedback-dashboard` repository

### 2. Configure the Service

**Basic Settings:**
- **Name**: `ontop-feedback-dashboard`
- **Environment**: `Python 3`
- **Region**: Choose closest to your users
- **Branch**: `main`

**Build & Deploy Settings:**
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `streamlit run dashboard.py --server.port $PORT --server.address 0.0.0.0 --server.headless true --server.enableCORS false --server.enableXsrfProtection false`

### 3. Set Environment Variables

In the Render dashboard, go to **Environment** and add these variables:

```bash
GOOGLE_PROJECT_ID=omega-cosmos-469700-v8
GOOGLE_PRIVATE_KEY_ID=9a944fbca32d21390e1ce9f29f752d90f1367db4
GOOGLE_CLIENT_EMAIL=whatsappvalidaor@omega-cosmos-469700-v8.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=114119840940751151687
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
[PASTE THE FULL PRIVATE KEY HERE]
-----END PRIVATE KEY-----
```

⚠️ **Important**: For `GOOGLE_PRIVATE_KEY`, paste the entire private key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines.

### 4. Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your app
3. Build time: ~5-10 minutes
4. You'll get a URL like: `https://ontop-feedback-dashboard.onrender.com`

## 🎯 Features Available

Your deployed dashboard will include:

- ✅ **Real-time Google Sheets integration** with Salesforce data
- ✅ **Advanced sentiment analysis** (TextBlob + VADER + ML)
- ✅ **Topic modeling** using LDA (Latent Dirichlet Allocation)
- ✅ **Interactive visualizations** with Plotly
- ✅ **Word frequency analysis** and keyword extraction
- ✅ **Responsive design** for mobile and desktop
- ✅ **Data refresh controls** and freshness indicators
- ✅ **Export capabilities** for charts and data

## 🔧 Troubleshooting

### Build Issues
- Check the build logs in Render dashboard
- Ensure all dependencies are in `requirements.txt`
- Python version is automatically managed by Render

### Environment Variables
- Double-check all Google credentials are correctly set
- Ensure private key includes BEGIN/END lines
- Test Google Sheets connection using the dashboard button

### Performance
- Render automatically handles scaling
- First load might be slower (cold start)
- Subsequent loads are fast with persistent containers

## 🌟 Advantages of Render

- **No size limits** (unlike Vercel's 250MB limit)
- **Persistent containers** (better for Streamlit)
- **Automatic HTTPS** and custom domains
- **Built-in monitoring** and logs
- **Auto-scaling** based on traffic
- **Free tier available** for testing

## 🔄 Updates

To update your app:
1. Push changes to your GitHub repository
2. Render automatically rebuilds and redeploys
3. Zero-downtime deployments

---

**🎉 Your Ontop Feedback Analytics Dashboard is now live on Render!**
