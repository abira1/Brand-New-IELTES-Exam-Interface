# Import Questions JSON Upload Issue - Investigation & Diagnosis

**Date**: October 19, 2025  
**Issue**: JSON upload returns HTML error instead of JSON response  
**Error Message**: `Failed to execute 'json' on 'Response': Unexpected token '<', "<!doctype "... is not valid JSON`

---

## 🔍 Root Cause Analysis

### The Problem
When uploading a JSON file from DeepSeek, the frontend receives an HTML response instead of JSON. This indicates:

1. **Backend Server Not Running**: The functions/server.js is not running on port 5001
2. **Proxy Connection Failed**: The proxy (setupProxy.js) tries to connect to localhost:5001 but gets an error page
3. **HTML Error Page Returned**: Instead of JSON, the browser receives an HTML error page

### Error Flow
```
Frontend (ExamImport.jsx)
  ↓
functionsService.uploadJson()
  ↓
fetch('/functions/uploadJson')
  ↓
setupProxy.js (rewrites to http://localhost:5001/uploadJson)
  ↓
functions/server.js (NOT RUNNING!)
  ↓
Connection refused / 404 error
  ↓
Browser returns HTML error page
  ↓
Frontend tries to parse HTML as JSON
  ↓
Error: "<!doctype" is not valid JSON
```

---

## 🔧 Solution Steps

### Step 1: Start the Backend Server
```bash
# Navigate to the functions directory
cd functions

# Install dependencies (if not already installed)
npm install

# Start the server
npm start
```

**Expected Output**:
```
🚀 Firebase Functions Emulator started
📡 Listening on http://0.0.0.0:5001
📝 Project: exam-interface-shah-sultan

Available functions:
  - GET  /healthCheck
  - POST /uploadJson
  - ...
```

### Step 2: Verify Backend is Running
```bash
# In another terminal, test the health check
curl http://localhost:5001/healthCheck

# Expected response:
# {"status":"ok","service":"IELTS Platform Functions (Local)","timestamp":"..."}
```

### Step 3: Rebuild Frontend (if needed)
```bash
cd frontend
npm run build
npm start
```

### Step 4: Test JSON Upload
1. Navigate to Admin Panel → Exam Management → Import Questions
2. Upload the JSON file: `deepseek_json_20251019_0dba87.json`
3. Check browser console (F12) for detailed logs

---

## 📊 Improved Error Handling

### New Console Logs
The updated `functionsService.js` now provides detailed diagnostics:

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
✅ [uploadJson] Upload successful: {...}
```

### Error Diagnostics
If backend is not running:
```
📤 [uploadJson] Response status: 404
❌ [uploadJson] Backend returned HTML instead of JSON: <!DOCTYPE html>...
❌ [uploadJson] Error uploading JSON: Backend error (HTTP 404): Backend server may not be running or endpoint not found. Check if functions/server.js is running on port 5001.
```

---

## 🧪 Testing Checklist

### Prerequisites
- [ ] Backend server running on port 5001
- [ ] Frontend running on port 3000
- [ ] setupProxy.js configured correctly
- [ ] JSON file is valid (deepseek_json_20251019_0dba87.json)

### Test Steps
1. [ ] Open browser console (F12)
2. [ ] Navigate to Admin Panel → Import Questions
3. [ ] Select the JSON file
4. [ ] Click "Upload"
5. [ ] Check console for logs
6. [ ] Verify success message appears
7. [ ] Check Firebase for imported exam

### Expected Success Response
```json
{
  "success": true,
  "examId": "uuid-here",
  "message": "JSON imported successfully",
  "data": {
    "title": "IELTS Reading Partial",
    "totalQuestions": 40,
    "sections": [
      {
        "name": "Reading",
        "questionTypes": ["true_false_ng", "sentence_completion", "table_completion", ...],
        "questionCount": 40
      }
    ]
  }
}
```

---

## 🔍 Troubleshooting

### Issue: "Backend server may not be running"
**Solution**: 
```bash
cd functions
npm start
```

### Issue: "Port 5001 already in use"
**Solution**:
```bash
# Find process using port 5001
lsof -i :5001  # macOS/Linux
netstat -ano | findstr :5001  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: "Module not found" errors
**Solution**:
```bash
cd functions
npm install
npm start
```

### Issue: Firebase initialization errors
**Solution**:
- Ensure `serviceAccountKey.json` exists in functions directory
- Or set `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Backend will fall back to client SDK if service account not available

---

## 📋 File Locations

| File | Purpose |
|------|---------|
| `functions/server.js` | Backend server with /uploadJson endpoint |
| `frontend/src/services/functionsService.js` | Frontend service with improved error handling |
| `frontend/src/setupProxy.js` | Proxy configuration for local development |
| `frontend/src/components/admin/ExamImport.jsx` | Import Questions UI component |
| `deepseek_json_20251019_0dba87.json` | Test JSON file to upload |

---

## 🚀 Next Steps

1. **Start Backend Server**
   ```bash
   cd functions && npm start
   ```

2. **Rebuild Frontend** (if needed)
   ```bash
   cd frontend && npm run build && npm start
   ```

3. **Test Upload**
   - Navigate to Import Questions page
   - Upload the JSON file
   - Check console for detailed logs

4. **Verify Success**
   - Check Firebase Console for imported exam
   - Verify questions are stored correctly
   - Test exam can be accessed by students

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12) for detailed error messages
2. Check backend server logs for processing errors
3. Verify backend is running: `curl http://localhost:5001/healthCheck`
4. Check Firebase connectivity and rules
5. Verify JSON file format matches expected structure

---

**Status**: Investigation Complete  
**Action Required**: Start backend server and test upload  
**Expected Outcome**: JSON file successfully imported into Firebase

