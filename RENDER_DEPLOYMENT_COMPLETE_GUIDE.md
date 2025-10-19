# 🚀 Complete Render.com Deployment Guide

**Platform**: Render.com (Free Tier)  
**Time**: 15-20 minutes  
**Cost**: $0/month  
**Reliability**: ⭐⭐⭐⭐⭐

---

## 📋 Prerequisites

- [ ] GitHub account (with your repo pushed)
- [ ] Render.com account (free)
- [ ] Firebase credentials
- [ ] Project files ready

---

## 🎯 Step 1: Create Render Account

### 1.1 Sign Up
1. Go to: https://render.com
2. Click "Get Started"
3. Choose "Sign up with GitHub"
4. Authorize Render to access your GitHub

### 1.2 Verify Email
- Check your email
- Click verification link
- Dashboard opens

---

## 🎯 Step 2: Prepare Your Repository

### 2.1 Create Procfile
**Location**: Project root (`c:\Users\Aminul\Downloads\ILTES Mock Exam\Procfile`)

**Content**:
```
web: cd functions && node server.js
```

### 2.2 Create .env.production
**Location**: Project root (`.env.production`)

**Content**:
```
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyCGTgMm-OG1ObUOjYRmIWlPFY-ZTpqsEqw
REACT_APP_FIREBASE_AUTH_DOMAIN=exam-interface-shah-sultan.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://exam-interface-shah-sultan-default-rtdb.asia-southeast1.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=exam-interface-shah-sultan
REACT_APP_FIREBASE_STORAGE_BUCKET=exam-interface-shah-sultan.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1097444515731
REACT_APP_FIREBASE_APP_ID=1:1097444515731:web:2165644b143a679ea85266

# Backend Configuration
PORT=3000
NODE_ENV=production
```

### 2.3 Push to GitHub
```bash
cd c:\Users\Aminul\Downloads\ILTES Mock Exam
git add Procfile .env.production
git commit -m "Add Render deployment files"
git push origin main
```

---

## 🎯 Step 3: Deploy on Render

### 3.1 Create New Web Service
1. Go to: https://dashboard.render.com
2. Click "New +"
3. Select "Web Service"
4. Choose "Build and deploy from a Git repository"

### 3.2 Connect GitHub Repository
1. Click "Connect account" (if needed)
2. Search for your repository
3. Click "Connect"

### 3.3 Configure Service
**Name**: `ielts-backend` (or any name)

**Environment**: `Node`

**Build Command**:
```
npm install
```

**Start Command**:
```
node functions/server.js
```

### 3.4 Add Environment Variables
Click "Advanced" → "Add Environment Variable"

Add these variables:
```
REACT_APP_FIREBASE_API_KEY=AIzaSyCGTgMm-OG1ObUOjYRmIWlPFY-ZTpqsEqw
REACT_APP_FIREBASE_AUTH_DOMAIN=exam-interface-shah-sultan.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://exam-interface-shah-sultan-default-rtdb.asia-southeast1.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=exam-interface-shah-sultan
REACT_APP_FIREBASE_STORAGE_BUCKET=exam-interface-shah-sultan.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1097444515731
REACT_APP_FIREBASE_APP_ID=1:1097444515731:web:2165644b143a679ea85266
PORT=3000
NODE_ENV=production
```

### 3.5 Select Plan
- Choose: **Free**
- Click "Create Web Service"

### 3.6 Wait for Deployment
- Render builds and deploys
- Takes 2-5 minutes
- Watch the logs

### 3.7 Get Your URL
- Deployment completes
- URL appears: `https://ielts-backend-xxxx.onrender.com`
- Copy this URL

---

## 🎯 Step 4: Update Frontend

### 4.1 Update frontend/.env
**File**: `frontend/.env`

**Change**:
```
# OLD
REACT_APP_BACKEND_URL=https://firebase-setup-2.preview.emergentagent.com

# NEW
REACT_APP_BACKEND_URL=https://ielts-backend-xxxx.onrender.com
```

Replace `ielts-backend-xxxx` with your actual Render URL.

### 4.2 Rebuild Frontend
```bash
cd c:\Users\Aminul\Downloads\ILTES Mock Exam\frontend
npm run build
```

### 4.3 Deploy to Firebase Hosting
```bash
cd c:\Users\Aminul\Downloads\ILTES Mock Exam
firebase deploy --only hosting
```

---

## 🎯 Step 5: Test Production Upload

### 5.1 Open Production URL
```
https://exam-interface-shah-sultan.web.app
```

### 5.2 Log In as Admin
- Email: shahsultanweb@gmail.com
- Password: Your password

### 5.3 Navigate to Import Questions
- Click "Admin Panel"
- Click "Import Questions"

### 5.4 Upload JSON File
- Click "Choose File"
- Select `deepseek_json_20251019_0dba87.json`
- Click "Upload"

### 5.5 Verify Success
Expected output:
```
✅ Upload successful
Title: IELTS Reading Partial
Total Questions: 40
Exam ID: [generated-id]
```

---

## ✅ Verification Checklist

- [ ] Render account created
- [ ] Repository pushed to GitHub
- [ ] Procfile created
- [ ] Environment variables added
- [ ] Web service deployed
- [ ] Render URL obtained
- [ ] Frontend .env updated
- [ ] Frontend rebuilt
- [ ] Frontend deployed to Firebase
- [ ] Production upload tested
- [ ] Success message appears
- [ ] Data in Firebase console

---

## 📊 Render.com Free Tier Details

| Aspect | Limit |
|--------|-------|
| **Monthly Hours** | 750 hours |
| **Continuous Operation** | ~31 days |
| **Uptime** | 99.9% SLA |
| **Cold Starts** | None |
| **Bandwidth** | Unlimited |
| **Storage** | Ephemeral (resets on deploy) |
| **Environment Variables** | Unlimited |
| **Custom Domain** | Free subdomain |

---

## 🔧 Troubleshooting

### Deployment Fails
1. Check build logs in Render dashboard
2. Verify Procfile syntax
3. Check environment variables
4. Ensure functions/server.js exists

### Upload Still Fails
1. Check browser console (F12)
2. Check Render logs: Dashboard → Logs
3. Verify backend URL in frontend/.env
4. Rebuild frontend: `npm run build`

### CORS Error
1. Check functions/server.js has `cors()` enabled
2. Redeploy to Render
3. Clear browser cache

### 404 Error
1. Verify Render URL is correct
2. Check backend is running: `https://your-url/healthCheck`
3. Verify environment variables

---

## 📝 Important Notes

### Ephemeral Storage
- Render uses ephemeral storage
- Files don't persist between deploys
- This is OK for our use case (data goes to Firebase)

### Auto-Sleep
- Free tier doesn't auto-sleep
- Always-on (no cold starts)
- Perfect for our needs

### Scaling
- If you exceed free tier limits
- Upgrade to paid plan
- No downtime during upgrade

---

## 🎉 Success!

Your backend is now deployed on Render.com!

**Status**: ✅ Production Ready

**Next**: Test the complete workflow

---

**Render URL**: https://ielts-backend-xxxx.onrender.com  
**Frontend URL**: https://exam-interface-shah-sultan.web.app  
**Cost**: $0/month  
**Uptime**: 99.9%

