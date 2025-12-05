# 🔑 Super Simple Login Setup (2 Minutes)

## Just Do This:

### 1. Generate JWT Secret (copy-paste this)

Open PowerShell and run:
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

It will output something like: `abc123xyz789...` 

**Copy that entire string**

### 2. Go to Vercel and Add These 2 Variables

Visit: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Click **Add New** and enter:

**First Variable:**
- Name: `JWT_SECRET`
- Value: [Paste the string from step 1]
- Environment: Select all 3 checkboxes (Production, Preview, Development)
- Click **Save**

**Second Variable:**
- Name: `ADMIN_PASSWORD`  
- Value: `ontop2024` (or change to whatever you want)
- Environment: Select all 3 checkboxes
- Click **Save**

### 3. Redeploy

Go to **Deployments** tab → Click the latest deployment → Click **Redeploy**

### 4. Login!

Go to your app: `https://your-app.vercel.app/login`

Enter password: `ontop2024` (or whatever you set)

**Done!** ✅

---

## Super Quick Example

**Want to use "admin123" as your password?**

Just set:
- `ADMIN_PASSWORD` = `admin123`

**Want to use "password"?**

Just set:
- `ADMIN_PASSWORD` = `password`

**Use whatever password you'll remember!**

---

## If it doesn't work:

1. Make sure both `JWT_SECRET` and `ADMIN_PASSWORD` are showing in Vercel environment variables
2. Make sure you clicked **Redeploy**
3. Clear your browser: Press F12 → Console tab → Type `localStorage.clear()` → Press Enter → Refresh page
4. Try logging in again

That's it! No complicated security stuff needed.

