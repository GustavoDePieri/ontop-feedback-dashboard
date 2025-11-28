# 🔑 Get Your HuggingFace API Key

## ⚠️ Required for BART Script

The BART analysis script needs a HuggingFace API key to work.

**Good news**: It's 100% FREE! No credit card required.

---

## 📋 Steps to Get Your Key

### 1. Go to HuggingFace
Visit: **https://huggingface.co/settings/tokens**

### 2. Sign Up (if you don't have an account)
- Click "Sign Up" at top right
- Use email or GitHub to sign up
- **No credit card needed**

### 3. Create an Access Token
- Once logged in, go to: https://huggingface.co/settings/tokens
- Click **"New token"**
- Give it a name: `ontop-feedback-analysis`
- Role: Select **"Read"** (that's all you need)
- Click **"Generate a token"**

### 4. Copy Your Token
- Your token will look like: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Copy it immediately** (you can't see it again)

### 5. Add to Your `.env` File
Open `.env` file and replace:
```env
HUGGINGFACE_API_KEY=YOUR_HUGGINGFACE_API_KEY_HERE
```

With:
```env
HUGGINGFACE_API_KEY=hf_your_actual_token_here
```

---

## ✅ Verify It Works

Run the script again:
```bash
npx tsx scripts/run-bart-analysis.ts
```

You should now see:
```
✅ HuggingFace API key loaded
```

---

## 💰 Cost

**FREE!**
- No credit card required
- No charges ever
- Rate limit: 30-50 requests/second (very generous)

---

## 🔒 Security Note

**Never commit your API key to Git!**

Your `.env` file is already in `.gitignore`, so it won't be committed.

---

## 🆘 Troubleshooting

### "Invalid API key"
- Make sure you copied the full token (starts with `hf_`)
- Check for extra spaces before/after the key

### "Rate limit exceeded"
- Free tier has generous limits (30-50 req/sec)
- If you hit it, just wait 60 seconds and retry
- Or increase `DELAY_BETWEEN_BATCHES` in the script

### "Token expired"
- Tokens don't expire by default
- If yours did, create a new one at the same URL

---

**Once you have your key, the BART script will work perfectly! 🚀**
