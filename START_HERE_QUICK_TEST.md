# START HERE - Quick Test Guide

**Status**: ✅ BOTH SERVERS RUNNING  
**Time**: 5 minutes  
**Goal**: Test JSON upload successfully

---

## ✅ Current Status

### Backend Server
```
✅ Running on port 5001
✅ All endpoints available
✅ Firebase connected
```

### Frontend Server
```
✅ Running on port 3000
✅ Proxy configured
✅ Ready to use
```

---

## 🚀 Quick Test (5 Minutes)

### Step 1: Open Browser (30 seconds)
```
URL: http://localhost:3000
```

You should see the IELTS Platform homepage.

---

### Step 2: Log In as Admin (1 minute)
1. Click **"Admin Login"** button
2. Click **"Continue with Google"**
3. Sign in with: **shahsultanweb@gmail.com**
   - Or: **toiral.dev@gmail.com**
4. You'll be redirected to the Admin Panel

---

### Step 3: Navigate to Import Questions (1 minute)
1. In Admin Panel, click **"Exam Management"**
2. Click **"Import Questions"**

You should see:
- AI Prompt Generator section
- File upload area
- Exam title input field

---

### Step 4: Upload JSON File (1 minute)
1. Click **"Select File"** or drag-and-drop
2. Select: **`deepseek_json_20251019_0dba87.json`**
3. Verify title auto-fills: **"IELTS Reading Partial"**
4. Click **"Upload"** button

---

### Step 5: Monitor Console (1 minute)
1. Open browser console: **F12**
2. Click **"Console"** tab
3. Watch for these logs:

```
📤 [uploadJson] Starting JSON upload...
📤 [uploadJson] File: deepseek_json_20251019_0dba87.json
📤 [uploadJson] Response status: 200
✅ [uploadJson] Upload successful
✅ Exam ID: abc123...
```

---

## ✅ Success Indicators

### On Page
- [ ] No red error message
- [ ] Green success message appears
- [ ] Exam ID displayed
- [ ] Form resets

### In Console
- [ ] All 📤 logs appear
- [ ] Response status is 200
- [ ] ✅ Success message shown
- [ ] No ❌ error messages

### In Firebase
- [ ] New exam in `exams` collection
- [ ] Full data in `exams_full` collection
- [ ] 40 questions imported

---

## 🎯 Expected Success Response

### Console Output
```
✅ Response status: 200
✅ Upload successful: {
  "success": true,
  "examId": "abc123...",
  "message": "JSON imported successfully",
  "data": {
    "title": "IELTS Reading Partial",
    "totalQuestions": 40,
    "sections": [...]
  }
}
```

### Page Display
```
Success! JSON imported successfully
Exam ID: abc123...
Total Questions: 40
Sections: Reading
```

---

## ❌ If Something Goes Wrong

### Error: "Backend server may not be running"
**Solution**: Backend is already running on port 5001
- Check terminal for backend server output
- If not running: `cd functions && node server.js`

### Error: "Cannot connect to localhost:3000"
**Solution**: Frontend is already running on port 3000
- Check terminal for frontend server output
- If not running: `cd frontend && npm start`

### Error: "<!doctype" is not valid JSON
**Solution**: This was the original issue - now fixed!
- Verify backend is running on port 5001
- Check console for detailed error message
- Verify JSON file is valid

### Error: "File not found"
**Solution**: Verify JSON file location
- File should be: `deepseek_json_20251019_0dba87.json`
- Location: workspace root directory
- Check file exists before uploading

---

## 📋 Checklist

- [x] Backend running on port 5001
- [x] Frontend running on port 3000
- [ ] Browser opened to http://localhost:3000
- [ ] Logged in as admin
- [ ] On Import Questions page
- [ ] JSON file selected
- [ ] Upload button clicked
- [ ] Console shows success logs
- [ ] Success message displayed
- [ ] No error messages

---

## 🔧 Quick Commands

### Check Backend
```bash
curl http://localhost:5001/healthCheck
```

### Check Frontend
```bash
curl http://localhost:3000
```

### Stop Backend
```bash
# Press Ctrl+C in backend terminal
```

### Stop Frontend
```bash
# Press Ctrl+C in frontend terminal
```

---

## 📞 Need Help?

### Backend Not Running
```bash
cd functions && node server.js
```

### Frontend Not Running
```bash
cd frontend && npm start
```

### Port Already In Use
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### JSON File Invalid
- Use online JSON validator
- Check file structure
- Verify file is readable

---

## 🎉 You're Ready!

**All systems are running and ready for testing.**

1. Open: http://localhost:3000
2. Log in as admin
3. Go to Import Questions
4. Upload JSON file
5. Check console for success

**Expected time: 5 minutes**

---

**Status**: ✅ READY TO TEST  
**Backend**: ✅ Running  
**Frontend**: ✅ Running  
**Next**: Open http://localhost:3000

