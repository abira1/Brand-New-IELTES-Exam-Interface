# 🔗 System Integration & CORS Setup

**Goal**: Connect Firebase Hosting frontend to Render backend  
**Status**: Complete guide with all configurations

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Firebase Hosting (Frontend)                            │
│  https://exam-interface-shah-sultan.web.app             │
│  - React app                                            │
│  - Admin panel                                          │
│  - Student dashboard                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP Requests
                     │ /functions/uploadJson
                     │
┌────────────────────▼────────────────────────────────────┐
│  Render Backend                                         │
│  https://ielts-backend-xxxx.onrender.com                │
│  - Express server                                       │
│  - JSON upload handler                                  │
│  - File processing                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Firebase Admin SDK
                     │ Database writes
                     │
┌────────────────────▼────────────────────────────────────┐
│  Firebase Realtime Database                             │
│  - Stores exam metadata                                 │
│  - Stores questions                                     │
│  - Stores student data                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Step 1: CORS Configuration

### 1.1 Update functions/server.js

**File**: `functions/server.js`  
**Lines**: 1-20

**Current Code**:
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
```

**Update To**:
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// CORS Configuration for production
const corsOptions = {
  origin: [
    'http://localhost:3000',           // Local development
    'http://localhost:5000',           // Firebase emulator
    'https://exam-interface-shah-sultan.web.app',  // Production
    'https://exam-interface-shah-sultan.firebaseapp.com'  // Alternative
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400  // 24 hours
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // Preflight requests
```

### 1.2 Verify CORS Headers
Add this endpoint to test CORS:

```javascript
// Health check with CORS headers
app.get('/healthCheck', (req, res) => {
  res.json({
    status: 'ok',
    service: 'IELTS Backend',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});
```

---

## 🔧 Step 2: Environment Variables

### 2.1 Frontend Environment (.env)

**File**: `frontend/.env`

**Content**:
```
# Development
REACT_APP_BACKEND_URL=http://localhost:5001

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyCGTgMm-OG1ObUOjYRmIWlPFY-ZTpqsEqw
REACT_APP_FIREBASE_AUTH_DOMAIN=exam-interface-shah-sultan.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://exam-interface-shah-sultan-default-rtdb.asia-southeast1.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=exam-interface-shah-sultan
REACT_APP_FIREBASE_STORAGE_BUCKET=exam-interface-shah-sultan.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1097444515731
REACT_APP_FIREBASE_APP_ID=1:1097444515731:web:2165644b143a679ea85266

# Development Settings
WDS_SOCKET_PORT=443
REACT_APP_ENABLE_VISUAL_EDITS=true
ENABLE_HEALTH_CHECK=false
```

### 2.2 Frontend Environment (.env.production)

**File**: `frontend/.env.production`

**Content**:
```
# Production
REACT_APP_BACKEND_URL=https://ielts-backend-xxxx.onrender.com

# Firebase Configuration (same as development)
REACT_APP_FIREBASE_API_KEY=AIzaSyCGTgMm-OG1ObUOjYRmIWlPFY-ZTpqsEqw
REACT_APP_FIREBASE_AUTH_DOMAIN=exam-interface-shah-sultan.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://exam-interface-shah-sultan-default-rtdb.asia-southeast1.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=exam-interface-shah-sultan
REACT_APP_FIREBASE_STORAGE_BUCKET=exam-interface-shah-sultan.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1097444515731
REACT_APP_FIREBASE_APP_ID=1:1097444515731:web:2165644b143a679ea85266

# Production Settings
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

### 2.3 Backend Environment (Render)

**Set in Render Dashboard**:
```
REACT_APP_FIREBASE_API_KEY=AIzaSyCGTgMm-OG1ObUOjYRmIWlPFY-ZTpqsEqw
REACT_APP_FIREBASE_AUTH_DOMAIN=exam-interface-shah-sultan.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://exam-interface-shah-sultan-default-rtdb.asia-southeast1.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=exam-interface-shah-sultan
REACT_APP_FIREBASE_STORAGE_BUCKET=exam-interface-shah-sultan.firebasestorage.app
PORT=3000
NODE_ENV=production
```

---

## 🔧 Step 3: Frontend Routing Update

### 3.1 Update functionsService.js

**File**: `frontend/src/services/functionsService.js`  
**Lines**: 1-25

**Current Code**:
```javascript
const getFunctionsUrl = (functionName) => {
  if (process.env.NODE_ENV === 'development' && 
      window.location.hostname === 'localhost') {
    return `/functions/${functionName}`;
  }
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  if (backendUrl) {
    return `${backendUrl}/${functionName}`;
  }
  
  return `https://us-central1-exam-interface-shah-sultan.cloudfunctions.net/${functionName}`;
};
```

**This is already correct!** ✅

---

## 🔧 Step 4: Testing Procedure

### 4.1 Test Backend Health

**Command**:
```bash
curl https://ielts-backend-xxxx.onrender.com/healthCheck
```

**Expected Response**:
```json
{
  "status": "ok",
  "service": "IELTS Backend",
  "timestamp": "2025-10-19T20:00:00.000Z",
  "cors": "enabled"
}
```

### 4.2 Test CORS Preflight

**Browser Console**:
```javascript
fetch('https://ielts-backend-xxxx.onrender.com/healthCheck', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('✅ CORS OK', d))
.catch(e => console.error('❌ CORS Error', e))
```

### 4.3 Test JSON Upload

1. Open: https://exam-interface-shah-sultan.web.app
2. Log in as admin
3. Go to: Admin Panel → Import Questions
4. Upload JSON file
5. Check browser console for success

---

## 📊 Environment Variable Summary

| Variable | Development | Production |
|----------|-------------|------------|
| REACT_APP_BACKEND_URL | http://localhost:5001 | https://ielts-backend-xxxx.onrender.com |
| NODE_ENV | development | production |
| PORT | 3000 | 3000 |
| REACT_APP_FIREBASE_* | Same | Same |

---

## 🔍 Debugging CORS Issues

### Issue: CORS Error in Browser

**Error Message**:
```
Access to XMLHttpRequest at 'https://...' from origin 'https://exam-interface-shah-sultan.web.app' 
has been blocked by CORS policy
```

**Solution**:
1. Check `corsOptions` in functions/server.js
2. Verify frontend URL is in `origin` array
3. Redeploy backend: `git push` to Render
4. Clear browser cache (Ctrl+Shift+Delete)
5. Test again

### Issue: 404 Error

**Error Message**:
```
POST https://ielts-backend-xxxx.onrender.com/uploadJson 404 (Not Found)
```

**Solution**:
1. Verify Render URL is correct
2. Check backend is running: `https://ielts-backend-xxxx.onrender.com/healthCheck`
3. Check functions/server.js has `/uploadJson` endpoint
4. Redeploy backend

### Issue: Timeout Error

**Error Message**:
```
Failed to fetch: timeout
```

**Solution**:
1. Check Render logs for errors
2. Verify Firebase credentials are correct
3. Check network connectivity
4. Increase timeout in frontend (if needed)

---

## ✅ Integration Checklist

- [ ] CORS configured in functions/server.js
- [ ] Frontend .env updated with Render URL
- [ ] Frontend .env.production created
- [ ] Backend environment variables set in Render
- [ ] Frontend rebuilt: `npm run build`
- [ ] Frontend deployed: `firebase deploy --only hosting`
- [ ] Backend deployed to Render
- [ ] Health check endpoint working
- [ ] CORS preflight working
- [ ] JSON upload tested
- [ ] Success message appears
- [ ] Data in Firebase console

---

## 🎉 Integration Complete!

Your system is now fully integrated:
- ✅ Frontend on Firebase Hosting
- ✅ Backend on Render
- ✅ CORS configured
- ✅ Environment variables set
- ✅ Ready for production

**Next**: Test the complete workflow

