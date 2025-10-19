# Quick Reference Guide - IELTS Upload System

**Date**: October 19, 2025

---

## 🚀 Quick Start

### Current Status
- ✅ Firebase rules deployed
- ✅ JSON file fixed
- ✅ Backend running on port 5001
- ✅ Frontend running on port 3000
- ✅ Ready for testing

### Test Upload Now
1. Open http://localhost:3000
2. Log in as admin
3. Go to Admin Panel → Import Questions
4. Select `deepseek_json_20251019_0dba87.json`
5. Click Upload
6. Verify success message

---

## 📋 IELTS Question Types Quick Reference

### Listening (9 types)
| Type | Input | Example |
|------|-------|---------|
| Multiple Choice | Selection | Choose 1 from 3-4 |
| Form Completion | Text | Fill form blanks |
| Note Completion | Text | Fill note blanks |
| Table Completion | Text | Fill table blanks |
| Flow-chart Completion | Text | Fill flow-chart |
| Diagram Labeling | Text | Label diagram parts |
| Sentence Completion | Text | Complete sentences |
| Short-answer | Text | 1-3 word answers |
| Matching | Selection | Match items |

### Reading (14 types)
| Type | Input | Example |
|------|-------|---------|
| Multiple Choice | Selection | Choose 1 from 3-4 |
| True/False/Not Given | Selection | T/F/NG |
| Yes/No/Not Given | Selection | Y/N/NG |
| Matching Information | Selection | Match to paragraphs |
| Matching Headings | Selection | Match headings |
| Matching Features | Selection | Match features |
| Matching Sentence Endings | Selection | Complete sentences |
| Sentence Completion | Text | Fill blanks |
| Summary Completion | Selection/Text | Fill summary |
| Note Completion | Text | Fill notes |
| Table Completion | Text | Fill table |
| Flow-chart Completion | Text | Fill flow-chart |
| Diagram Labeling | Text | Label diagram |
| Short-answer | Text | 1-3 word answers |

### Writing (2 types)
| Type | Duration | Requirements |
|------|----------|--------------|
| Task 1 | 20 min | 150+ words, describe visual |
| Task 2 | 40 min | 250+ words, essay |

### Speaking (3 parts)
| Part | Duration | Format |
|------|----------|--------|
| Part 1 | 4-5 min | Interview (10-12 Q) |
| Part 2 | 3-4 min | Long turn (1-2 min) |
| Part 3 | 4-5 min | Discussion (4-5 Q) |

---

## 🔧 JSON Schema Quick Reference

### Minimal Reading Exam
```json
{
  "title": "IELTS Reading",
  "section": "Reading",
  "duration": 60,
  "passages": [
    {
      "passageNumber": 1,
      "title": "Passage Title",
      "text": "Passage text here...",
      "questions": [
        {
          "type": "true_false_ng",
          "number": 1,
          "text": "Question text",
          "answer": "True",
          "points": 1
        }
      ]
    }
  ]
}
```

### Minimal Listening Exam (Future)
```json
{
  "title": "IELTS Listening",
  "section": "Listening",
  "duration": 30,
  "parts": [
    {
      "partNumber": 1,
      "audioFile": "part1.mp3",
      "questions": [
        {
          "type": "multiple_choice",
          "number": 1,
          "text": "Question text",
          "options": ["A", "B", "C"],
          "answer": "A",
          "points": 1
        }
      ]
    }
  ]
}
```

---

## 🎯 Implementation Phases

### Phase 1: Core (Weeks 1-2)
- [ ] Update JSON schema
- [ ] Enhance validation
- [ ] Update frontend UI
- [ ] Deploy to staging
- [ ] Test thoroughly
- [ ] Deploy to production

### Phase 2: Listening (Weeks 3-4)
- [ ] Audio upload handler
- [ ] Audio validation
- [ ] Listening question types
- [ ] Upload endpoint
- [ ] Testing
- [ ] Deployment

### Phase 3: Writing & Speaking (Weeks 5-6)
- [ ] Image upload handler
- [ ] Writing task support
- [ ] Speaking section support
- [ ] Upload endpoints
- [ ] Testing
- [ ] Deployment

### Phase 4: Advanced (Weeks 7-8)
- [ ] Batch import
- [ ] Template system
- [ ] Question bank
- [ ] Analytics
- [ ] Testing
- [ ] Deployment

---

## 🔐 Firebase Rules

### Current Rules (Deployed)
```json
{
  "exams": {
    ".read": "auth != null",
    ".write": true,
    "$examId": {
      ".read": "auth != null",
      ".write": true
    }
  },
  "exams_full": {
    ".read": "auth != null",
    ".write": true,
    "$examId": {
      ".read": "auth != null",
      ".write": true
    }
  }
}
```

### Deploy Rules
```bash
firebase deploy --only database
```

---

## 🐛 Troubleshooting

### Error: PERMISSION_DENIED
**Solution**: Redeploy Firebase rules
```bash
firebase deploy --only database
```

### Error: Invalid JSON
**Solution**: Validate JSON file
```bash
# Use online JSON validator
# Or check for special characters
```

### Error: Backend not running
**Solution**: Start backend server
```bash
cd functions
node server.js
```

### Error: Frontend not running
**Solution**: Start frontend server
```bash
cd frontend
npm start
```

### Error: Upload timeout
**Solution**: Check Firebase connection
```bash
# Verify internet connection
# Check Firebase console
# Restart backend
```

---

## 📊 File Locations

### Backend
- `functions/server.js` - Main server
- `functions/serviceAccountKey.json` - Firebase credentials

### Frontend
- `frontend/src/components/admin/ExamImport.jsx` - Upload component
- `frontend/src/services/functionsService.js` - API service
- `frontend/src/setupProxy.js` - Proxy configuration

### Configuration
- `firebase-rules.json` - Database rules
- `.firebaserc` - Firebase project config
- `firebase.json` - Firebase configuration

### Documentation
- `IELTS_QUESTION_TYPES_COMPREHENSIVE_ANALYSIS.md` - Question types
- `OPTIMAL_QUESTION_UPLOAD_SYSTEM_DESIGN.md` - System design
- `IMPLEMENTATION_PLAN_DETAILED.md` - Implementation plan
- `COMPLETE_SOLUTION_SUMMARY.md` - Summary
- `QUICK_REFERENCE_GUIDE.md` - This file

---

## 🔗 Useful Commands

### Firebase
```bash
# Deploy database rules
firebase deploy --only database

# Deploy hosting
firebase deploy --only hosting

# Deploy functions
firebase deploy --only functions

# View database
firebase database:get / --pretty

# View specific path
firebase database:get /exams --pretty
```

### Node.js
```bash
# Start backend
cd functions && node server.js

# Install dependencies
npm install

# Run tests
npm test
```

### React
```bash
# Start frontend
cd frontend && npm start

# Build frontend
npm run build

# Run tests
npm test
```

---

## 📞 Support

### Common Issues
1. **Upload fails**: Check backend console
2. **Questions don't display**: Check Firebase data
3. **Scoring doesn't work**: Check submission endpoint
4. **Audio doesn't play**: Check audio file path

### Debug Steps
1. Check browser console (F12)
2. Check backend console
3. Check Firebase console
4. Check network tab (F12 → Network)
5. Check Firebase rules

---

## ✅ Checklist

### Before Testing
- [ ] Firebase rules deployed
- [ ] JSON file fixed
- [ ] Backend running
- [ ] Frontend running
- [ ] Browser console open

### During Testing
- [ ] Select JSON file
- [ ] Enter exam title
- [ ] Click upload
- [ ] Check console for success
- [ ] Verify in Firebase

### After Testing
- [ ] Check exam in Firebase
- [ ] Test as student
- [ ] Verify all questions display
- [ ] Test submission
- [ ] Check scoring

---

## 🎯 Next Actions

1. **Today**: Test JSON upload
2. **This Week**: Get approval for Phase 1
3. **Next Week**: Start Phase 1 implementation
4. **Week 3**: Complete Phase 1
5. **Weeks 4-8**: Implement Phases 2-4

---

**Last Updated**: October 19, 2025  
**Status**: ✅ READY FOR TESTING

