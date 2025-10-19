# 📋 Copy-Paste Commands for Deployment

**Use these exact commands to deploy your backend to Render.com**

---

## 🎯 Step 1: Prepare Repository (Copy-Paste These)

### 1.1 Navigate to Project Directory
```bash
cd c:\Users\Aminul\Downloads\ILTES Mock Exam
```

### 1.2 Create Procfile
```bash
echo "web: cd functions && node server.js" > Procfile
```

### 1.3 Create .env.production
```bash
cat > .env.production << 'EOF'
REACT_APP_FIREBASE_API_KEY=AIzaSyCGTgMm-OG1ObUOjYRmIWlPFY-ZTpqsEqw
REACT_APP_FIREBASE_AUTH_DOMAIN=exam-interface-shah-sultan.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://exam-interface-shah-sultan-default-rtdb.asia-southeast1.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=exam-interface-shah-sultan
REACT_APP_FIREBASE_STORAGE_BUCKET=exam-interface-shah-sultan.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1097444515731
REACT_APP_FIREBASE_APP_ID=1:1097444515731:web:2165644b143a679ea85266
PORT=3000
NODE_ENV=production
EOF
```

### 1.4 Verify Files Created
```bash
ls -la Procfile .env.production
```

### 1.5 Push to GitHub
```bash
git add Procfile .env.production
git commit -m "Add Render deployment files"
git push origin main
```

---

## 🎯 Step 2: Deploy on Render (Manual Steps)

### 2.1 Create Render Account
1. Go to: https://render.com
2. Click "Get Started"
3. Choose "Sign up with GitHub"
4. Authorize Render

### 2.2 Create Web Service
1. Go to: https://dashboard.render.com
2. Click "New +"
3. Select "Web Service"
4. Choose "Build and deploy from a Git repository"

### 2.3 Connect Repository
1. Click "Connect account" (if needed)
2. Search for: `IELTS-Mock-Exam` (or your repo name)
3. Click "Connect"

### 2.4 Configure Service
**Fill in these values**:
```
Name: ielts-backend
Environment: Node
Build Command: npm install
Start Command: node functions/server.js
Plan: Free
```

### 2.5 Add Environment Variables
Click "Advanced" → "Add Environment Variable"

**Add these variables** (copy-paste each):
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

### 2.6 Deploy
1. Click "Create Web Service"
2. Wait 2-5 minutes for deployment
3. When complete, copy the URL (e.g., `https://ielts-backend-xxxx.onrender.com`)

---

## 🎯 Step 3: Update Frontend (Copy-Paste These)

### 3.1 Edit frontend/.env
**Replace this line**:
```
REACT_APP_BACKEND_URL=https://firebase-setup-2.preview.emergentagent.com
```

**With this** (use your actual Render URL):
```
REACT_APP_BACKEND_URL=https://ielts-backend-xxxx.onrender.com
```

### 3.2 Rebuild Frontend
```bash
cd c:\Users\Aminul\Downloads\ILTES Mock Exam\frontend
npm run build
cd ..
```

### 3.3 Deploy to Firebase
```bash
firebase deploy --only hosting
```

---

## 🎯 Step 4: Test (Copy-Paste These)

### 4.1 Test Backend Health Check
```bash
# Replace xxxx with your actual Render URL
curl https://ielts-backend-xxxx.onrender.com/healthCheck
```

**Expected response**:
```json
{"status":"ok","service":"IELTS Backend","timestamp":"...","cors":"enabled"}
```

### 4.2 Test in Browser Console
```javascript
// Open browser console (F12) and paste this:
fetch('https://ielts-backend-xxxx.onrender.com/healthCheck')
  .then(r => r.json())
  .then(d => console.log('✅ Backend OK', d))
  .catch(e => console.error('❌ Backend Error', e))
```

### 4.3 Test Production Upload
1. Open: https://exam-interface-shah-sultan.web.app
2. Log in with: shahsultanweb@gmail.com
3. Go to: Admin Panel → Import Questions
4. Upload: deepseek_json_20251019_0dba87.json
5. Verify: ✅ Upload successful

---

## 🔧 Troubleshooting Commands

### Check Render Logs
```bash
# Go to Render dashboard and click "Logs" tab
# Or use Render CLI:
render logs --service ielts-backend
```

### Check Firebase Logs
```bash
# Go to Firebase console
# Realtime Database → Rules → Logs tab
```

### Check Browser Console
```bash
# Press F12 in browser
# Go to Console tab
# Look for error messages
```

### Verify Render Deployment
```bash
# Check if backend is running
curl -I https://ielts-backend-xxxx.onrender.com/healthCheck

# Should return: HTTP/1.1 200 OK
```

### Verify Firebase Connection
```bash
# In browser console:
firebase.database().ref('exams').once('value')
  .then(snap => console.log('✅ Firebase OK', snap.val()))
  .catch(e => console.error('❌ Firebase Error', e))
```

---

## 📊 Environment Variables Reference

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://ielts-backend-xxxx.onrender.com
REACT_APP_FIREBASE_API_KEY=AIzaSyCGTgMm-OG1ObUOjYRmIWlPFY-ZTpqsEqw
REACT_APP_FIREBASE_AUTH_DOMAIN=exam-interface-shah-sultan.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://exam-interface-shah-sultan-default-rtdb.asia-southeast1.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=exam-interface-shah-sultan
REACT_APP_FIREBASE_STORAGE_BUCKET=exam-interface-shah-sultan.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1097444515731
REACT_APP_FIREBASE_APP_ID=1:1097444515731:web:2165644b143a679ea85266
WDS_SOCKET_PORT=443
REACT_APP_ENABLE_VISUAL_EDITS=true
ENABLE_HEALTH_CHECK=false
```

### Backend (Render Environment Variables)
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

---

## ✅ Verification Checklist

- [ ] Procfile created
- [ ] .env.production created
- [ ] Files pushed to GitHub
- [ ] Render account created
- [ ] Web service deployed
- [ ] Render URL obtained
- [ ] Frontend .env updated
- [ ] Frontend rebuilt
- [ ] Frontend deployed
- [ ] Health check works
- [ ] JSON upload works
- [ ] Data in Firebase

---

## 🎯 Quick Reference

| Step | Command | Time |
|------|---------|------|
| 1 | Create Procfile | 1 min |
| 2 | Create .env.production | 1 min |
| 3 | Push to GitHub | 1 min |
| 4 | Deploy on Render | 10 min |
| 5 | Update frontend .env | 1 min |
| 6 | Rebuild frontend | 2 min |
| 7 | Deploy to Firebase | 2 min |
| 8 | Test | 2 min |
| **TOTAL** | | **20 min** |

---

## 📞 Need Help?

1. Check: `TROUBLESHOOTING_MONITORING_GUIDE.md`
2. Check: Render logs
3. Check: Firebase logs
4. Check: Browser console (F12)

---

**Ready? Start with Step 1 above!**

**Let's deploy! 🚀**

