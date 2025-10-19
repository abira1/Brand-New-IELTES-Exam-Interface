# 🔧 Troubleshooting & Monitoring Guide

**Goal**: Diagnose and fix common issues  
**Status**: Complete troubleshooting reference

---

## 🆘 Common Issues & Solutions

### Issue 1: CORS Error

**Error Message**:
```
Access to XMLHttpRequest at 'https://ielts-backend-xxxx.onrender.com/uploadJson' 
from origin 'https://exam-interface-shah-sultan.web.app' has been blocked by CORS policy
```

**Diagnosis**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for failed request
4. Check Response headers

**Solutions**:

**Solution A: Update CORS in Backend**
```javascript
// functions/server.js
const corsOptions = {
  origin: [
    'https://exam-interface-shah-sultan.web.app',
    'https://exam-interface-shah-sultan.firebaseapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
```

**Solution B: Redeploy Backend**
```bash
cd c:\Users\Aminul\Downloads\ILTES Mock Exam
git add functions/server.js
git commit -m "Fix CORS configuration"
git push origin main
# Wait for Render to redeploy (2-3 minutes)
```

**Solution C: Clear Browser Cache**
- Press: Ctrl+Shift+Delete
- Select: All time
- Check: Cookies and cached images
- Click: Clear data

---

### Issue 2: 404 Not Found

**Error Message**:
```
POST https://ielts-backend-xxxx.onrender.com/uploadJson 404 (Not Found)
```

**Diagnosis**:
1. Check if backend is running
2. Verify endpoint exists
3. Check URL is correct

**Solutions**:

**Solution A: Test Backend Health**
```bash
# In browser console
fetch('https://ielts-backend-xxxx.onrender.com/healthCheck')
  .then(r => r.json())
  .then(d => console.log('✅ Backend OK', d))
  .catch(e => console.error('❌ Backend Error', e))
```

**Solution B: Verify Endpoint Exists**
```bash
# Check functions/server.js has this line:
app.post('/uploadJson', (req, res) => {
  // ... implementation
});
```

**Solution C: Check Render Logs**
1. Go to: https://dashboard.render.com
2. Select your service
3. Click "Logs"
4. Look for errors
5. Check if server started

---

### Issue 3: Timeout Error

**Error Message**:
```
Failed to fetch: timeout
```

**Diagnosis**:
1. Backend might be slow
2. Firebase connection issue
3. Large file upload

**Solutions**:

**Solution A: Check Render Logs**
```
1. Dashboard → Logs
2. Look for slow requests
3. Check Firebase connection
```

**Solution B: Increase Timeout**
```javascript
// frontend/src/services/functionsService.js
const response = await fetch(url, {
  method: 'POST',
  body: formData,
  timeout: 60000  // 60 seconds
});
```

**Solution C: Check Firebase Connection**
```bash
# In Render logs, look for:
✅ Firebase Admin initialized successfully
# or
❌ Firebase Admin initialization error
```

---

### Issue 4: Upload Fails with "Invalid JSON"

**Error Message**:
```
Invalid JSON format: Unexpected token '<'
```

**Diagnosis**:
1. JSON file is corrupted
2. Backend returned HTML error
3. Wrong file type

**Solutions**:

**Solution A: Verify JSON File**
```bash
# Test JSON validity
node -e "console.log(JSON.parse(require('fs').readFileSync('deepseek_json_20251019_0dba87.json', 'utf8')))"
```

**Solution B: Check File Type**
- File must end with `.json`
- Not `.txt` or `.json.txt`

**Solution C: Check Backend Response**
```javascript
// Browser console
fetch('https://ielts-backend-xxxx.onrender.com/uploadJson', {
  method: 'POST',
  body: formData
})
.then(r => r.text())  // Get raw response
.then(t => console.log('Response:', t))
```

---

### Issue 5: Firebase Permission Denied

**Error Message**:
```
PERMISSION_DENIED: Permission denied
```

**Diagnosis**:
1. Firebase rules too restrictive
2. Backend not authenticated
3. Wrong database path

**Solutions**:

**Solution A: Check Firebase Rules**
```bash
# View current rules
firebase database:get / --pretty | head -50
```

**Solution B: Update Rules**
```json
{
  "rules": {
    "exams": {
      ".read": "auth != null",
      ".write": true
    },
    "exams_full": {
      ".read": "auth != null",
      ".write": true
    }
  }
}
```

**Solution C: Deploy Rules**
```bash
firebase deploy --only database
```

---

## 📊 Monitoring & Logs

### 1. Check Render Logs

**Steps**:
1. Go to: https://dashboard.render.com
2. Select your service
3. Click "Logs" tab
4. Watch real-time logs

**What to Look For**:
```
✅ Server started on port 3000
✅ Firebase Admin initialized
✅ POST /uploadJson - 200 OK
❌ Error: PERMISSION_DENIED
❌ Error: JSON parse error
```

### 2. Check Firebase Logs

**Steps**:
1. Go to: https://console.firebase.google.com
2. Select project
3. Go to: Realtime Database → Rules
4. Check "Logs" tab

**What to Look For**:
```
✅ write to /exams/[id] - allowed
✅ write to /exams_full/[id] - allowed
❌ write to /exams/[id] - denied
```

### 3. Check Browser Console

**Steps**:
1. Open: https://exam-interface-shah-sultan.web.app
2. Press: F12
3. Go to: Console tab
4. Upload JSON file
5. Watch console output

**What to Look For**:
```
✅ [uploadJson] Starting JSON upload...
✅ [uploadJson] Response status: 200
✅ [uploadJson] Upload successful
❌ [uploadJson] Error: ...
```

---

## 🔍 Debugging Checklist

### Before Deployment
- [ ] JSON file is valid
- [ ] functions/server.js has /uploadJson endpoint
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Frontend .env updated

### After Deployment
- [ ] Backend health check works
- [ ] CORS preflight works
- [ ] JSON upload works
- [ ] Data appears in Firebase
- [ ] No errors in logs

### Production Testing
- [ ] Open production URL
- [ ] Log in as admin
- [ ] Upload JSON file
- [ ] Check success message
- [ ] Verify data in Firebase

---

## 📈 Performance Monitoring

### 1. Upload Speed

**Expected**:
- Small file (< 1MB): < 5 seconds
- Medium file (1-10MB): 5-15 seconds
- Large file (> 10MB): 15-30 seconds

**If Slower**:
1. Check Render CPU usage
2. Check Firebase write speed
3. Check network latency

### 2. Error Rate

**Expected**:
- Success rate: > 99%
- Error rate: < 1%

**If Higher**:
1. Check logs for patterns
2. Verify Firebase rules
3. Check file validity

### 3. Uptime

**Expected**:
- Render: 99.9% uptime
- Firebase: 99.95% uptime

**Monitor**:
1. Render dashboard
2. Firebase console
3. Uptime monitoring service

---

## 🚨 Emergency Procedures

### If Backend is Down

**Steps**:
1. Check Render dashboard
2. Check service status
3. Restart service:
   - Dashboard → Service → Manual Deploy
4. Check logs for errors
5. Redeploy if needed

### If Firebase is Down

**Steps**:
1. Check Firebase status: https://status.firebase.google.com
2. Wait for recovery
3. Retry upload after recovery

### If CORS is Broken

**Steps**:
1. Update CORS in functions/server.js
2. Commit and push to GitHub
3. Wait for Render to redeploy
4. Clear browser cache
5. Test again

---

## 📞 Support Resources

### Render Support
- Docs: https://render.com/docs
- Status: https://status.render.com
- Support: https://render.com/support

### Firebase Support
- Docs: https://firebase.google.com/docs
- Status: https://status.firebase.google.com
- Support: https://firebase.google.com/support

### Express.js Support
- Docs: https://expressjs.com
- GitHub: https://github.com/expressjs/express

---

## ✅ Troubleshooting Checklist

- [ ] Identified the issue
- [ ] Checked logs
- [ ] Applied solution
- [ ] Tested fix
- [ ] Verified success
- [ ] Documented issue

---

**Status**: ✅ Troubleshooting guide complete  
**Next**: Monitor and maintain

