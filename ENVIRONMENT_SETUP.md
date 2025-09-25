# 🔐 Environment Variables Setup Guide

## 🚨 IMPORTANT: Required for Google Sheets Integration

Your dashboard needs these environment variables to connect to Google Sheets securely.

## 📋 Required Environment Variables

### **For Vercel Deployment:**

Go to your Vercel project → Settings → Environment Variables and add:

```bash
GOOGLE_PROJECT_ID=omega-cosmos-469700-v8
GOOGLE_PRIVATE_KEY_ID=9a944fbca32d21390e1ce9f29f752d90f1367db4
GOOGLE_CLIENT_EMAIL=whatsappvalidaor@omega-cosmos-469700-v8.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=114119840940751151687
```

**GOOGLE_PRIVATE_KEY** (copy this exactly):
```
-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDNyX/x5GkATgvH
QbSJ98og4qPRMlnV4SS5Cjq6gURh0jzEF+X7xzOvW8DQS9vGmKLzmj0Y13wK72oo
vihTjPtxqzEVWBF1J0fjMy3HgqUl5XtG8O3H9VwD3ihV6VzOfxDni/3Lq5ilBXI4
2GIcRDrwnnnwQ1n3ovFMp1OsS/afz/sBA+Opw7gYwZGoEnudmscaBsaDqWA/lGgH
HSS04SXzWk0GiWqBe310CIRq1+XONam+IG/trWGvWH6ebDnf1T4BGCczPC8/W9mf
YryaXxhjnSuYeAQa+hGMXNPsKIDxJg3LCebUteVuEPChjX+zzxBHVmvVCjcwUYJS
RgPtgaQbAgMBAAECggEADNJ+1eAhCMNUKYy3Bpe5cPYeNfU4ssJuCteP1DokvCGg
5qkEi/0cA9OoPnJTldrB4ILeRrN6h6XmS/aZRad1rV3413ce01loucfhFNrXlnZn
iYKOllR78MPBaKT7QuSY9Yx7+lpNTw75UIBvEIrRz1dYirdvniX5egi9BnHPQqLS
otk6HKRAn8yf3+3MIePXPy8jfaGexw9UuXRdouKlhj4q/PBICrSwjS6U0GTc5Y3U
/TjR8fY9N5Z7XyDninrEZHF3HPIdtJ/nLuvDQ+ztD9N33gpZ8wCxIPmrpvfYj1HK
7eUt69M7pooeIyomB3feBxK4pHjz1c/xx1KOmH4KgQKBgQD+4/X/GtbUzfYzsvyJ
BJHPAfZ+qnH/SGnpAJO8xjUWIn1qdc1OMa61sPToHucn8z+/TYp9aezzTDb/Jhvk
ewEO4VJ8ze9wwMSlR3xyAbjc/gKNk8/1mEuif0Y3OzE0G5hAZRfjRPL8kqcEUbJS
v+ZuEQ/12PY0RYhZuEy7acRpmwKBgQDOrtH2XvGSswDM6utAQrX1DUmx58D16KVq
gfBe650lm6g9vkNeS43CaPMS8QbigOvp71QEVSkVSElXPx88UxlnQEFSGb4Ml8Eg
KvQKW3Nb2u3L6F51LTlphhhcBDhfOUYRYAuqiiQNI2XeUGcHHHn71T6sc4fQdyJU
0D5PwJqXgQKBgAOa99zO5WEHNMdQbdAGV4WlEnaCNLCWtqDMGErgRtn0TO/XkLrd
awo44Y3y+fQPtcQf9aiGegqK9nAves+FieNK/p6zTwK6R03LMBBww8ukcCbOg2+G
4vL+d+DKHo0NIt8uTuMxE3rNHD2sZihTfI/r/9zLX9gnb6FNQRCZk2SnAoGAGqEz
tEavYXNm2wA5p2HxB83afO2bUxPSnFJ5ogFBkiLoHmxxSaj6bt4O05XyiSSLQOzx
Kk2+qVtS98bOQ3uBfmgtAmMGtaCn5XkjUGJQDrm6gddCtF5LU2lPoit5B+vdN0fk
uOhrlLXG3koFvEjS/ruPA7EvApEW/06FeMkcIgECgYAFPmxTuSsgTxf3BXxuaCzY
Vodna386lXKNvk6rwEqD9bptM/K1oijhZZGlT4L90gFsjGtdS09szAw4bVWqX7eP
AO4SYBOIazNN9gAc207QPXqHdxf5YgrZnjByUy1UwOoBFzqYr6eDOFV9zDbt5Ld3
HL9HbPLiM9vESKFpFYLyxQ==
-----END PRIVATE KEY-----
```

## 🚀 Quick Deployment Steps

### **1. Deploy to Vercel:**

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add the environment variables above
4. Deploy!

### **2. Your Dashboard Will Be Live At:**
`https://your-project-name.vercel.app`

## ✅ What You'll Get

- 📊 **Real-time Salesforce data** from Google Sheets
- 🤖 **Full ML analytics** (topic modeling, word clouds, sentiment analysis)
- 🔄 **Auto-refresh** every 5 minutes
- 📱 **Mobile-responsive** design
- 🔐 **Secure** authentication

## 🆘 Need Help?

If you get authentication errors:
1. Double-check all environment variables are set correctly
2. Make sure the private key has no extra spaces
3. Verify the Google Sheets ID is correct

**Your secure, real-time Salesforce feedback dashboard is ready to deploy! 🎉**
