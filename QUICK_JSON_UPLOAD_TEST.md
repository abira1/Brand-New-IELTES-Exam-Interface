# Quick JSON Upload Test - 5 Minute Guide

**Status**: ✅ Backend Running & Ready  
**Time**: 5 minutes  
**Goal**: Successfully upload JSON file and verify import

---

## ✅ Prerequisites Check

### Backend Server
```bash
# Terminal 1: Check if backend is running
curl http://localhost:5001/healthCheck

# Expected: {"status":"ok",...}
# If error: Run: cd functions && node server.js
```

### Frontend
```bash
# Terminal 2: Check if frontend is running
# Visit: http://localhost:3000

# If not running: cd frontend && npm start
```

---

## 🚀 5-Minute Test

### Minute 1: Open Admin Panel
1. Open browser: http://localhost:3000
2. Click "Admin Login"
3. Sign in with: shahsultanweb@gmail.com
4. Click "Admin Panel"

### Minute 2: Navigate to Import Questions
1. Click "Exam Management"
2. Click "Import Questions"
3. You should see:
   - AI Prompt Generator section
   - File upload area
   - Exam title input

### Minute 3: Select JSON File
1. Click "Select File" or drag-and-drop
2. Select: `deepseek_json_20251019_0dba87.json`
3. Verify:
   - File name appears
   - Exam title auto-fills: "IELTS Reading Partial"
   - File size shows

### Minute 4: Upload & Monitor
1. Open browser console: F12 → Console tab
2. Click "Upload" button
3. Watch console for logs:
   ```
   📤 [uploadJson] Starting JSON upload...
   📤 [uploadJson] Response status: 200
   ✅ [uploadJson] Upload successful
   ```

### Minute 5: Verify Success
1. Look for success message on page
2. Check console for exam ID
3. Verify no error messages

---

## 📊 Expected Console Output

### Success (What You Should See)
```
📤 [uploadJson] Starting JSON upload...
📤 [uploadJson] URL: /functions/uploadJson
📤 [uploadJson] File: deepseek_json_20251019_0dba87.json Size: 12345 bytes
📤 [uploadJson] Exam Title: IELTS Reading Partial
📤 [uploadJson] Response status: 200
📤 [uploadJson] Response headers: {
  'content-type': 'application/json',
  'content-length': '1234'
}
✅ [uploadJson] Upload successful: {
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

### Error (If Backend Not Running)
```
📤 [uploadJson] Response status: 404
❌ [uploadJson] Backend returned HTML instead of JSON
❌ [uploadJson] Error uploading JSON: Backend error (HTTP 404): Backend server may not be running...
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

## 🔧 If Something Goes Wrong

### Backend Not Running
```bash
cd functions
node server.js
```

### Port 5001 In Use
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5001
kill -9 <PID>
```

### Frontend Not Running
```bash
cd frontend
npm start
```

### JSON File Not Found
- Verify file exists: `deepseek_json_20251019_0dba87.json`
- Check file location: workspace root directory
- Verify file is valid JSON

---

## 📋 Checklist

- [ ] Backend running on port 5001
- [ ] Frontend running on port 3000
- [ ] Logged in as admin
- [ ] On Import Questions page
- [ ] JSON file selected
- [ ] Exam title filled in
- [ ] Upload button clicked
- [ ] Console shows success logs
- [ ] Success message displayed
- [ ] No error messages

---

## 🎯 Next Steps After Success

1. **Verify in Firebase Console**
   - Go to: https://console.firebase.google.com
   - Project: exam-interface-shah-sultan
   - Database → Realtime Database
   - Check `exams` and `exams_full` collections

2. **Test as Student**
   - Log out from admin
   - Log in as student
   - Check if exam appears in available exams
   - Try taking the exam

3. **Verify Questions**
   - Check all 40 questions display
   - Verify question types are correct
   - Check answers are stored

---

## 📞 Troubleshooting

**Q: I see "<!doctype" error**
A: Backend not running. Run: `cd functions && node server.js`

**Q: Upload button does nothing**
A: Check console (F12) for errors. Backend may not be running.

**Q: File not uploading**
A: Verify JSON file is valid. Use online JSON validator.

**Q: Success message but no exam in Firebase**
A: Check Firebase rules. Verify database is accessible.

---

**Time**: 5 minutes  
**Difficulty**: Easy  
**Status**: Ready to test

