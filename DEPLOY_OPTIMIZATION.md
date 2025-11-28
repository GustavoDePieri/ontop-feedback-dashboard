# Vercel Deployment Optimization Guide

## Problem
Your Vercel deployment is taking **5+ minutes** because it's installing massive Python ML libraries (PyTorch, transformers, CUDA libraries) totaling **~3.5GB** of dependencies that aren't needed for the web app.

### Current Build Times (from your logs):
- torch-2.9.1: **899.7 MB** - 15 seconds
- nvidia_cudnn_cu12: **706.8 MB** - 20 seconds  
- nvidia_cublas_cu12: **594.3 MB** - 10 seconds
- Other CUDA libraries: **~1.5 GB** - 2+ minutes

**Total Python package installation: ~4 minutes out of 5 minute build!**

## Root Cause
The `requirements.txt` file in your repository contains heavy ML dependencies that were needed for local Python scripts but are NOT needed for the Vercel deployment (which is a Node.js/Nuxt app).

## Solution

### Option 1: Remove Python Dependencies from Vercel (RECOMMENDED)

Since your Python scripts run separately (locally or via GitHub Actions), you should exclude `requirements.txt` from Vercel entirely:

**Update `.vercelignore`:**
```
# Exclude Python files - not needed for web deployment
*.py
requirements.txt
__pycache__/
*.pyc
```

This will:
- ? Reduce build time from 5 minutes to **~1 minute**
- ? Reduce deployment size significantly
- ? Keep Python scripts in repo for local/CI use

### Option 2: Keep Only Essential Python Packages

If you need some Python packages on Vercel (unlikely), keep requirements.txt minimal:

**Minimal `requirements.txt`:**
```
# Only lightweight packages needed for Vercel serverless functions (if any)
supabase>=1.0.0
python-dotenv>=1.0.0
chardet>=5.0.0
```

### Option 3: Separate Requirements Files

Create two files:
- `requirements.txt` - Lightweight (for Vercel)
- `requirements-dev.txt` - Full ML stack (for local development)

**requirements.txt (Vercel):**
```
supabase>=1.0.0
python-dotenv>=1.0.0
chardet>=5.0.0
```

**requirements-dev.txt (Local):**
```
-r requirements.txt
transformers>=4.40.0
torch>=2.1.0
scipy>=1.12.0
```

Then locally run:
```bash
pip install -r requirements-dev.txt
```

## Implementation Steps

### Quick Fix (5 minutes):

1. **Update `.vercelignore`** to exclude Python:
```bash
echo "*.py" >> .vercelignore
echo "requirements.txt" >> .vercelignore
```

2. **Commit and push:**
```bash
git add .vercelignore
git commit -m "chore: exclude Python files from Vercel deployment"
git push
```

3. **Trigger redeploy** in Vercel dashboard or push another commit

### Expected Results:
- Build time: **5 minutes ? ~1 minute** (80% faster!)
- Bundle size: Much smaller
- Deploy succeeds in under 2 minutes total

## Why This Works

Your Nuxt/Node.js app doesn't use Python at runtime. The Python scripts are for:
- Data analysis (local)
- Sentiment aggregation (local/GitHub Actions)
- Transcript processing (local)

None of these run in Vercel's serverless environment, so there's no reason to install PyTorch and ML libraries during deployment.

## Verification

After implementing, check your next Vercel build log. You should see:
```
Installing dependencies...
? Successfully installed 3 packages in 10s  # Instead of 4 minutes!
```

## Alternative: Use Vercel Build Cache

If you DO need Python packages, at least leverage build cache properly by creating a `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "cacheDirectories": [".cache/pip"],
  "github": {
    "silent": true
  }
}
```

But **Option 1 (exclude Python entirely) is still recommended**.

## Summary

| Approach | Build Time | Best For |
|----------|-----------|----------|
| **Exclude Python** | ~1 min | Most cases (recommended) |
| Minimal requirements.txt | ~1.5 min | Need some Python packages |
| Full ML requirements | ~5 min | Not recommended for Vercel |

---

## Quick Commands

**Exclude Python from Vercel:**
```bash
cd c:\Users\gusta\Documents\Ontop\feedbackAnalysis

# Add to .vercelignore
echo. >> .vercelignore
echo # Exclude Python dependencies >> .vercelignore
echo *.py >> .vercelignore
echo requirements.txt >> .vercelignore
echo __pycache__/ >> .vercelignore

# Commit
git add .vercelignore
git commit -m "chore: exclude Python files from Vercel to speed up deployment"
git push origin fix/report-stats
```

**Or update requirements.txt to minimal:**
```bash
# Edit requirements.txt to only have:
supabase>=1.0.0
python-dotenv>=1.0.0
chardet>=5.0.0

git add requirements.txt
git commit -m "chore: remove heavy ML dependencies from requirements.txt"
git push origin fix/report-stats
```

Choose one approach and your next deployment will be **4x faster**! ??
