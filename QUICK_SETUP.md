# 🚀 Quick Setup - JWT Authentication on Vercel

## Step-by-Step Setup (5 minutes)

### 1️⃣ Generate Your JWT Secret

Run this command in your terminal:

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

**Copy the output** - you'll need it in the next step.

### 2️⃣ Add Environment Variables to Vercel

Go to: https://vercel.com/[your-username]/[your-project]/settings/environment-variables

Add these **2 variables**:

| Variable Name | Value | 
|--------------|-------|
| `JWT_SECRET` | [paste your generated secret] |
| `ADMIN_PASSWORD` | `ontop2024` (or any simple password you want) |

**Use any simple password like:**
- `ontop2024`
- `admin123`  
- `password`
- Whatever you'll remember!

**Important:** 
- Select **All Environments** (Production, Preview, Development)
- Click **Save** after each variable

### 3️⃣ Redeploy Your Application

**Option A - Via Dashboard:**
1. Go to **Deployments** tab
2. Click on latest deployment
3. Click **⋯** (three dots) → **Redeploy**

**Option B - Via Git:**
```bash
git commit --allow-empty -m "Trigger redeploy for JWT config"
git push origin main
```

### 4️⃣ Test Your Login

1. Visit: `https://your-app.vercel.app/login`
2. Enter the password you set in `ADMIN_PASSWORD`
3. ✅ You should be logged in!

---

## 🆘 Quick Fixes

### If login doesn't work:

**Clear your browser data:**
```javascript
// Open browser console (F12) and run:
localStorage.clear()
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
})
location.reload()
```

**Then try logging in again.**

### Verify environment variables are set:

Using Vercel CLI:
```bash
vercel env ls
```

You should see:
- ✅ JWT_SECRET (Production, Preview, Development)
- ✅ ADMIN_PASSWORD (Production, Preview, Development)

---

## 📋 Current Login Credentials

After setup, use:
- **Password:** Whatever you set in `ADMIN_PASSWORD` env variable

**Examples of easy passwords:**
- `ontop2024`
- `admin123`
- `password`
- Anything you want!

---

## 📚 Full Documentation

For detailed troubleshooting and advanced configuration:
- See `VERCEL_JWT_SETUP.md` for complete guide
- See `ENVIRONMENT_VARIABLES.md` for all env vars

