# 🚀 Deployment Guide - Nuxt Feedback Analytics

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Code pushed to GitHub
3. **Google Service Account**: Credentials from `ENVIRONMENT_SETUP.md`

## 🔧 Deployment Steps

### **1. Deploy to Vercel**

#### **Option A: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### **Option B: Vercel Dashboard**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Nuxt.js
5. Click **"Deploy"**

### **2. Configure Environment Variables**

In Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Required Environment Variables
GOOGLE_PROJECT_ID=omega-cosmos-469700-v8
GOOGLE_PRIVATE_KEY_ID=9a944fbca32d21390e1ce9f29f752d90f1367db4
GOOGLE_CLIENT_EMAIL=whatsappvalidaor@omega-cosmos-469700-v8.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=114119840940751151687
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[PASTE YOUR FULL PRIVATE KEY FROM ENVIRONMENT_SETUP.md]
-----END PRIVATE KEY-----"
```

⚠️ **Important**: 
- Include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- Make sure there are no extra spaces or characters
- Set all variables for **Production**, **Preview**, and **Development** environments

### **3. Test Deployment**

1. **Visit your deployed URL** (e.g., `https://your-app.vercel.app`)
2. **Click "Test Connection"** to verify Google Sheets integration
3. **Click "Refresh Data"** to load live Salesforce feedback

## ✅ Expected Features

Your deployed dashboard will have:

- ✅ **Real-time Google Sheets Integration**
- ✅ **Sentiment Analysis** with visual charts
- ✅ **Interactive Dashboard** with metrics cards
- ✅ **Recent Feedback Display**
- ✅ **Responsive Design** (mobile-friendly)
- ✅ **Fast Loading** (Nuxt.js optimizations)

## 🔧 Local Development

### **Setup**
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your Google credentials
# (Use the values from ENVIRONMENT_SETUP.md)

# Start development server
npm run dev
```

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run generate     # Generate static site
```

## 🌟 Performance Optimizations

### **Automatic Optimizations**
- ✅ **Server-Side Rendering (SSR)**
- ✅ **Automatic Code Splitting**
- ✅ **Image Optimization**
- ✅ **CSS Optimization**
- ✅ **JavaScript Minification**

### **Vercel Benefits**
- ✅ **Global CDN** for fast loading worldwide
- ✅ **Automatic HTTPS** with SSL certificates
- ✅ **Auto-scaling** based on traffic
- ✅ **Edge Functions** for API endpoints
- ✅ **Analytics** and performance monitoring

## 🔍 Troubleshooting

### **Common Issues**

#### **1. Google Sheets Connection Failed**
- ✅ Check all environment variables are set correctly
- ✅ Verify the Google Service Account has access to the sheet
- ✅ Ensure the private key includes BEGIN/END lines

#### **2. Build Errors**
```bash
# Clear cache and reinstall
rm -rf .nuxt node_modules package-lock.json
npm install
npm run build
```

#### **3. Environment Variables Not Working**
- ✅ Set variables in all environments (Production, Preview, Development)
- ✅ Redeploy after setting environment variables
- ✅ Check for typos in variable names

### **Debug Steps**
1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Project → Functions tab
   - Click on function to see logs

2. **Test API Endpoints**:
   - Visit: `https://your-app.vercel.app/api/sheets/test`
   - Should return connection status

3. **Local Testing**:
   ```bash
   npm run dev
   # Visit: http://localhost:3000
   ```

## 📊 Monitoring & Analytics

### **Vercel Analytics** (Optional)
```bash
npm install @vercel/analytics
```

Add to `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  // ... existing config
  modules: [
    '@vercel/analytics/nuxt'
  ]
})
```

### **Performance Monitoring**
- **Vercel Dashboard**: Real-time performance metrics
- **Core Web Vitals**: Automatic tracking
- **Function Logs**: API performance monitoring

## 🔄 Continuous Deployment

### **Automatic Deployments**
- ✅ **Main Branch**: Auto-deploy to production
- ✅ **Pull Requests**: Preview deployments
- ✅ **Branch Deployments**: Feature branch previews

### **Deployment Hooks**
Set up webhooks for:
- Slack notifications
- Email alerts
- Custom integrations

---

## 🎉 Success!

Your Nuxt.js Feedback Analytics Dashboard is now:
- ✅ **Deployed** on Vercel with global CDN
- ✅ **Connected** to live Google Sheets data
- ✅ **Optimized** for performance and SEO
- ✅ **Scalable** with automatic scaling
- ✅ **Secure** with HTTPS and environment variables

**Your dashboard URL**: `https://your-project-name.vercel.app`

Enjoy your modern, fast, and powerful feedback analytics platform! 🚀
