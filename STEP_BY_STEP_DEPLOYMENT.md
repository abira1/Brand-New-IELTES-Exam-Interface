# 📋 Step-by-Step Deployment Guide

**Choose Your Path Below**

---

## 🎯 Path 1: Firebase Blaze Plan (⭐ RECOMMENDED)

### ⏱️ Time: 5 minutes
### 💰 Cost: $0-5/month
### 📊 Complexity: Very Low

---

### Step 1: Upgrade Firebase to Blaze Plan

1. **Open Firebase Console**:
   ```
   https://console.firebase.google.com/project/exam-interface-shah-sultan/usage/details
   ```

2. **Click "Upgrade to Blaze"** button

3. **Add Payment Method**:
   - Enter credit card details
   - Accept terms

4. **Confirm Upgrade**:
   - Wait for confirmation
   - Should take 1-2 minutes

---

### Step 2: Deploy Cloud Functions

1. **Open Terminal** in project root:
   ```bash
   cd c:\Users\Aminul\Downloads\ILTES Mock Exam
   ```

2. **Deploy Functions**:
   ```bash
   firebase deploy --only functions
   ```

3. **Wait for Deployment**:
   - Should see: `✔ Deploy complete!`
   - Functions deployed to Cloud Functions

4. **Verify Deployment**:
   ```bash
   firebase functions:list
   ```
   - Should show `uploadJson` function

---

### Step 3: Test Production Upload

1. **Open Production URL**:
   ```
   https://exam-interface-shah-sultan.web.app
   ```

2. **Log In as Admin**:
   - Email: shahsultanweb@gmail.com (or your admin email)
   - Password: Your password

3. **Navigate to Import Questions**:
   - Click "Admin Panel"
   - Click "Import Questions"

4. **Upload JSON File**:
   - Click "Choose File"
   - Select `deepseek_json_20251019_0dba87.json`
   - Click "Upload"

5. **Verify Success**:
   - Should see: "✅ Upload successful"
   - Title: "IELTS Reading Partial"
   - Total Questions: 40
   - Exam ID: [generated]

---

### Step 4: Verify in Firebase Console

1. **Open Firebase Console**:
   ```
   https://console.firebase.google.com/project/exam-interface-shah-sultan/database
   ```

2. **Check Data**:
   - Navigate to `exams` → [exam-id]
   - Should see metadata
   - Navigate to `exams_full` → [exam-id]
   - Should see all 40 questions

---

## 🎯 Path 2: Railway.app Deployment (⭐ FREE)

### ⏱️ Time: 15 minutes
### 💰 Cost: Free (with $5/month credit)
### 📊 Complexity: Low

---

### Step 1: Create Railway Account

1. **Go to Railway**:
   ```
   https://railway.app
   ```

2. **Sign Up**:
   - Click "Sign Up"
   - Choose "GitHub"
   - Authorize Railway

3. **Verify Email**:
   - Check email
   - Click verification link

---

### Step 2: Create Procfile

1. **Open Project Root**:
   ```
   c:\Users\Aminul\Downloads\ILTES Mock Exam
   ```

2. **Create File**: `Procfile` (no extension)
   ```
   web: cd functions && node server.js
   ```

3. **Save File**

---

### Step 3: Deploy to Railway

1. **Go to Railway Dashboard**:
   ```
   https://railway.app/dashboard
   ```

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub"

3. **Select Repository**:
   - Find your IELTS Mock Exam repo
   - Click "Deploy"

4. **Add Environment Variables**:
   - Click "Variables"
   - Add these variables:
   ```
   REACT_APP_FIREBASE_API_KEY=AIzaSyCGTgMm-OG1ObUOjYRmIWlPFY-ZTpqsEqw
   REACT_APP_FIREBASE_AUTH_DOMAIN=exam-interface-shah-sultan.firebaseapp.com
   REACT_APP_FIREBASE_DATABASE_URL=https://exam-interface-shah-sultan-default-rtdb.asia-southeast1.firebasedatabase.app
   REACT_APP_FIREBASE_PROJECT_ID=exam-interface-shah-sultan
   REACT_APP_FIREBASE_STORAGE_BUCKET=exam-interface-shah-sultan.firebasestorage.app
   PORT=3000
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)

6. **Get Railway URL**:
   - Go to "Settings"
   - Copy the public URL (e.g., `https://your-app.railway.app`)

---

### Step 4: Update Frontend Environment

1. **Edit `frontend/.env`**:
   ```
   REACT_APP_BACKEND_URL=https://your-app.railway.app
   REACT_APP_FIREBASE_API_KEY=AIzaSyCGTgMm-OG1ObUOjYRmIWlPFY-ZTpqsEqw
   REACT_APP_FIREBASE_AUTH_DOMAIN=exam-interface-shah-sultan.firebaseapp.com
   REACT_APP_FIREBASE_DATABASE_URL=https://exam-interface-shah-sultan-default-rtdb.asia-southeast1.firebasedatabase.app
   REACT_APP_FIREBASE_PROJECT_ID=exam-interface-shah-sultan
   REACT_APP_FIREBASE_STORAGE_BUCKET=exam-interface-shah-sultan.firebasestorage.app
   ```

2. **Replace `your-app.railway.app`** with your actual Railway URL

3. **Save File**

---

### Step 5: Rebuild and Deploy Frontend

1. **Open Terminal**:
   ```bash
   cd c:\Users\Aminul\Downloads\ILTES Mock Exam
   ```

2. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy to Firebase Hosting**:
   ```bash
   cd ..
   firebase deploy --only hosting
   ```

4. **Wait for Deployment**:
   - Should see: `✔ Deploy complete!`

---

### Step 6: Test Production Upload

1. **Open Production URL**:
   ```
   https://exam-interface-shah-sultan.web.app
   ```

2. **Log In as Admin**:
   - Email: shahsultanweb@gmail.com
   - Password: Your password

3. **Navigate to Import Questions**:
   - Click "Admin Panel"
   - Click "Import Questions"

4. **Upload JSON File**:
   - Click "Choose File"
   - Select `deepseek_json_20251019_0dba87.json`
   - Click "Upload"

5. **Verify Success**:
   - Should see: "✅ Upload successful"
   - Title: "IELTS Reading Partial"
   - Total Questions: 40

---

## ✅ Verification Checklist

### After Deployment (Both Paths)

- [ ] Production URL opens: https://exam-interface-shah-sultan.web.app
- [ ] Can log in as admin
- [ ] Admin Panel accessible
- [ ] Import Questions page loads
- [ ] Can select JSON file
- [ ] Upload button works
- [ ] Success message appears
- [ ] Exam ID generated
- [ ] Data in Firebase console
- [ ] Can log in as student
- [ ] Exam appears in student list
- [ ] Can start exam
- [ ] All 40 questions display

---

## 🆘 Troubleshooting

### Upload Still Fails

**Check 1: Browser Console**
- Press F12
- Go to Console tab
- Look for error message
- Screenshot and share

**Check 2: Backend Logs**
- Path 1: Check Firebase Functions logs
- Path 2: Check Railway logs

**Check 3: Environment Variables**
- Verify `REACT_APP_BACKEND_URL` is set correctly
- Verify Firebase credentials are correct

### 404 Error

**Path 1**: Cloud Functions not deployed
- Run: `firebase deploy --only functions`

**Path 2**: Railway URL incorrect
- Verify URL in `frontend/.env`
- Rebuild and redeploy

### CORS Error

**Path 2 Only**: Railway backend CORS issue
- Check `functions/server.js` has `cors()` enabled
- Redeploy to Railway

---

## 📞 Quick Reference

### Useful Commands

```bash
# Check Firebase status
firebase status

# List deployed functions
firebase functions:list

# View function logs
firebase functions:log

# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy only database rules
firebase deploy --only database
```

### Important URLs

- **Production**: https://exam-interface-shah-sultan.web.app
- **Firebase Console**: https://console.firebase.google.com/project/exam-interface-shah-sultan
- **Railway Dashboard**: https://railway.app/dashboard

---

## 🎯 Summary

### Path 1 (Blaze)
1. Upgrade Firebase ✅
2. Deploy functions ✅
3. Test ✅

### Path 2 (Railway)
1. Create Procfile ✅
2. Deploy to Railway ✅
3. Update frontend ✅
4. Rebuild and deploy ✅
5. Test ✅

---

**Choose your path and follow the steps!**  
**Timeline**: 5-15 minutes to production ✅

