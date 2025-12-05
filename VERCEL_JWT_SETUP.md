# JWT Authentication Setup for Vercel

## 🚀 Quick Setup Guide

Follow these steps to configure JWT authentication on Vercel after deployment.

## Step 1: Install Dependencies

Make sure you have the JWT dependencies installed:

```bash
npm install jsonwebtoken @types/jsonwebtoken
```

This has already been added to `package.json`.

## Step 2: Configure Environment Variables in Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to: **Project Settings** → **Environment Variables**
3. Add the following environment variables:

#### Required Variables:

**JWT_SECRET** (Critical - Must be secure!)
```
Variable Name: JWT_SECRET
Value: [Generate a secure random string - see below]
Environment: Production, Preview, Development
```

**ADMIN_PASSWORD**
```
Variable Name: ADMIN_PASSWORD
Value: YourSecurePassword123!
Environment: Production, Preview, Development
```

#### How to Generate a Secure JWT_SECRET:

Run this command in your terminal:
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Example output:** `8kJh3n9mX+pQ2wR5tYu7vZ1aB4cD6eF8gH0iJ2kL4mN=`

Use this generated string as your `JWT_SECRET`.

### Option B: Using Vercel CLI

If you have Vercel CLI installed:

```bash
# Set JWT_SECRET
vercel env add JWT_SECRET production

# When prompted, paste your generated secret

# Set ADMIN_PASSWORD
vercel env add ADMIN_PASSWORD production

# When prompted, enter your admin password
```

## Step 3: Set Additional Environment Variables

Make sure all other required environment variables are also set:

```bash
# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_ANON_KEY=your-supabase-anon-key

# DIIO API (If using DIIO features)
DIIO_CLIENT_ID=your-client-id
DIIO_CLIENT_SECRET=your-client-secret
DIIO_REFRESH_TOKEN=your-refresh-token
DIIO_SUBDOMAIN=your-subdomain

# OpenAI (If using AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Google Sheets (If using sheets integration)
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_PRIVATE_KEY_ID=your-key-id
```

## Step 4: Redeploy

After adding environment variables, redeploy your application:

### Via Dashboard:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy**

### Via CLI:
```bash
vercel --prod
```

### Via Git:
```bash
git commit -m "Update JWT authentication"
git push origin main
```

Vercel will automatically redeploy.

## Step 5: Test Login

1. Navigate to your deployed application: `https://your-app.vercel.app/login`
2. Enter the password you set in `ADMIN_PASSWORD`
3. You should be redirected to the dashboard

## 🔐 Security Best Practices

### JWT_SECRET Requirements:
- **Minimum 32 characters** (256 bits)
- Use **cryptographically random** values
- **Never commit** to version control
- **Different secrets** for production and development
- **Rotate regularly** (every 90 days recommended)

### Password Requirements:
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Don't use common passwords
- Store securely (use password manager)

## 🐛 Troubleshooting

### Issue: "Cannot login" or "Invalid credentials"

**Check:**
1. Environment variables are set in Vercel dashboard
2. `JWT_SECRET` and `ADMIN_PASSWORD` are present
3. No extra spaces in environment variable values
4. Variables are set for the correct environment (Production/Preview)

**Solution:**
```bash
# Verify environment variables
vercel env ls

# If missing, add them
vercel env add JWT_SECRET production
vercel env add ADMIN_PASSWORD production

# Redeploy
vercel --prod
```

### Issue: "jwt malformed" or "invalid token"

**Cause:** JWT_SECRET not set or different between deployments

**Solution:**
1. Ensure JWT_SECRET is set in Vercel
2. Redeploy the application
3. Clear browser cookies and localStorage
4. Try logging in again

### Issue: Token expired after deployment

**Cause:** Tokens generated with old JWT_SECRET are invalid with new secret

**Solution:**
1. Users need to log out and log back in
2. Clear browser data: `localStorage.clear()` in console
3. Log in with the correct password

### Issue: Login works locally but not on Vercel

**Common causes:**
1. Environment variables not set on Vercel
2. Different `NODE_ENV` causing issues
3. Cookie settings (secure flag in production)

**Solution:**
```bash
# Check current environment variables
vercel env pull .env.production

# Verify JWT_SECRET and ADMIN_PASSWORD are present
cat .env.production

# Re-add if missing
vercel env add JWT_SECRET production
vercel env add ADMIN_PASSWORD production
```

## 🔄 Migrating from Old Auth System

If users were logged in with the old authentication system:

1. They will be automatically logged out
2. Old cookies/localStorage will be ignored
3. Users need to log in again with the new system
4. Their sessions will now be JWT-based and more secure

### Clear Old Authentication

If you're still seeing issues, clear old auth data:

**JavaScript Console (Browser):**
```javascript
localStorage.removeItem('ontop_authenticated')
localStorage.removeItem('ontop_auth_timestamp')
document.cookie = 'ontop_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
localStorage.clear()
location.reload()
```

## 📋 Environment Variable Checklist

Before going to production, verify all these are set:

- [ ] `JWT_SECRET` (32+ character random string)
- [ ] `ADMIN_PASSWORD` (your secure password)
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_KEY` or `SUPABASE_ANON_KEY`
- [ ] `DIIO_CLIENT_ID` (if using DIIO)
- [ ] `DIIO_CLIENT_SECRET` (if using DIIO)
- [ ] `DIIO_REFRESH_TOKEN` (if using DIIO)
- [ ] `OPENAI_API_KEY` (if using AI features)
- [ ] All variables set for **Production** environment
- [ ] Application redeployed after setting variables

## 🆘 Still Having Issues?

1. Check Vercel deployment logs for errors
2. Verify environment variables are visible in Vercel dashboard
3. Ensure you're using the correct password (check for typos)
4. Try regenerating JWT_SECRET and redeploying
5. Contact your development team with error logs

## 📚 Related Documentation

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- Main Environment Variables Guide: See `ENVIRONMENT_VARIABLES.md`

