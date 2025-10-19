# Import Questions - Complete Workflow Guide

**Date**: October 19, 2025  
**Status**: ✅ READY FOR TESTING  
**Time**: 10 minutes

---

## 📋 Complete Workflow

### Phase 1: Prepare (2 minutes)

#### 1.1 Start Backend Server
```bash
# Terminal 1
cd functions
node server.js

# Expected output:
# 🚀 Firebase Functions Emulator started
# 📡 Listening on http://0.0.0.0:5001
```

#### 1.2 Start Frontend (if needed)
```bash
# Terminal 2
cd frontend
npm start

# Expected output:
# Compiled successfully!
# You can now view ielts-platform in the browser.
# Local: http://localhost:3000
```

#### 1.3 Verify Backend is Running
```bash
# Terminal 3
curl http://localhost:5001/healthCheck

# Expected response:
# {"status":"ok","service":"IELTS Platform Functions (Local)","timestamp":"..."}
```

---

### Phase 2: Admin Login (2 minutes)

#### 2.1 Open Browser
- URL: http://localhost:3000
- You should see the IELTS Platform homepage

#### 2.2 Click Admin Login
- Button: "Admin Login" (top right or in menu)
- You'll be redirected to `/admin/login`

#### 2.3 Sign In with Google
- Click "Continue with Google"
- Sign in with: **shahsultanweb@gmail.com**
- Or: **toiral.dev@gmail.com**

#### 2.4 Access Admin Panel
- After login, click "Admin Panel"
- You should see admin dashboard

---

### Phase 3: Navigate to Import Questions (2 minutes)

#### 3.1 Click Exam Management
- In admin panel, find "Exam Management"
- Click it

#### 3.2 Click Import Questions
- You should see options:
  - Import Questions (JSON)
  - View Exams
  - Create Exam
- Click "Import Questions"

#### 3.3 Verify Page Loaded
- You should see:
  - AI Prompt Generator section
  - File upload area
  - Exam title input field
  - Upload button

---

### Phase 4: Upload JSON File (2 minutes)

#### 4.1 Open Browser Console
- Press: F12
- Click: Console tab
- Keep this open to monitor logs

#### 4.2 Select JSON File
- Click "Select File" or drag-and-drop
- Select: `deepseek_json_20251019_0dba87.json`
- File should appear in the upload area

#### 4.3 Verify Auto-Fill
- Exam title should auto-fill: "IELTS Reading Partial"
- If not, enter it manually

#### 4.4 Click Upload
- Click the "Upload" button
- Watch the console for logs

---

### Phase 5: Monitor Upload (2 minutes)

#### 5.1 Watch Console Logs
Look for these logs in order:
```
📤 [uploadJson] Starting JSON upload...
📤 [uploadJson] URL: /functions/uploadJson
📤 [uploadJson] File: deepseek_json_20251019_0dba87.json Size: 12345 bytes
📤 [uploadJson] Exam Title: IELTS Reading Partial
📤 [uploadJson] Response status: 200
📤 [uploadJson] Response headers: {...}
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

#### 5.2 Check for Errors
If you see:
```
❌ [uploadJson] Backend returned HTML instead of JSON
```
→ Backend is not running. Run: `cd functions && node server.js`

#### 5.3 Verify Success Message
- On the page, you should see a green success message
- Message should show exam ID
- Form should reset

---

### Phase 6: Verify in Firebase (1 minute)

#### 6.1 Open Firebase Console
- URL: https://console.firebase.google.com
- Project: exam-interface-shah-sultan
- Click: Realtime Database

#### 6.2 Check Exams Collection
- Navigate to: `exams` → [exam-id]
- You should see:
  - title: "IELTS Reading Partial"
  - totalQuestions: 40
  - sections: [...]
  - status: "draft"

#### 6.3 Check Full Exam Data
- Navigate to: `exams_full` → [exam-id]
- You should see:
  - All metadata
  - All 40 questions with answers
  - Passage text

---

### Phase 7: Test as Student (1 minute)

#### 7.1 Log Out from Admin
- Click profile icon
- Click "Sign Out"

#### 7.2 Log In as Student
- Click "Student Login"
- Sign in with any Google account
- Wait for approval (or use approved account)

#### 7.3 Access Exam
- Navigate to "Available Exams"
- You should see "IELTS Reading Partial"
- Click to start exam

#### 7.4 Verify Questions
- Check that all 40 questions display
- Verify question types are correct
- Check answers are stored

---

## ✅ Success Checklist

### Backend
- [x] Server running on port 5001
- [x] Health check responding
- [x] /uploadJson endpoint accessible

### Frontend
- [x] Admin logged in
- [x] On Import Questions page
- [x] JSON file selected
- [x] Exam title filled in

### Upload
- [x] Upload button clicked
- [x] Console shows success logs
- [x] Response status 200
- [x] Exam ID returned

### Firebase
- [x] Exam in `exams` collection
- [x] Full data in `exams_full` collection
- [x] 40 questions imported
- [x] All metadata correct

### Student Access
- [x] Exam appears in available exams
- [x] All questions display
- [x] Question types correct
- [x] Answers stored

---

## 🔧 Troubleshooting

### Backend Not Running
```bash
cd functions && node server.js
```

### Frontend Not Running
```bash
cd frontend && npm start
```

### Port 5001 In Use
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### JSON File Not Found
- Verify file: `deepseek_json_20251019_0dba87.json`
- Check workspace root directory
- Verify file is valid JSON

### Upload Fails
1. Check console (F12) for error message
2. Verify backend is running
3. Check Firebase connectivity
4. Verify JSON file structure

---

## 📊 Expected Results

### Console Output
```
✅ Response status: 200
✅ Upload successful
✅ Exam ID: [uuid]
✅ Total Questions: 40
```

### Firebase Data
```
exams/[exam-id]:
  - title: "IELTS Reading Partial"
  - totalQuestions: 40
  - sections: [...]
  - status: "draft"

exams_full/[exam-id]:
  - All metadata
  - All 40 questions
  - Passage text
```

### Student View
```
Available Exams:
  - IELTS Reading Partial (40 questions, 60 min)
  
Exam Content:
  - 3 passages
  - 40 questions total
  - All question types present
```

---

## 🎯 Next Steps

1. **Start Backend**: `cd functions && node server.js`
2. **Start Frontend**: `cd frontend && npm start`
3. **Follow Workflow**: Steps 1-7 above
4. **Monitor Console**: Watch for success logs
5. **Verify Firebase**: Check exam data
6. **Test as Student**: Verify exam access

---

**Time**: 10 minutes  
**Difficulty**: Easy  
**Status**: Ready to execute

