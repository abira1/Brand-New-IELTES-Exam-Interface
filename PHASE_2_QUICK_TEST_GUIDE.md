# Phase 2: Track Manager - Quick Test Guide

## 🚀 Live URL
https://exam-interface-shah-sultan.web.app

---

## ✅ Test 1: Create Track (5 minutes)

### Steps:
1. Go to https://exam-interface-shah-sultan.web.app
2. Log in as admin (shahsultanweb@gmail.com or toiral.dev@gmail.com)
3. Click "Admin Dashboard"
4. Click "Tracks" in sidebar
5. Click "Create Track" button
6. Enter:
   - Track Name: "IELTS Academic Practice"
   - Description: "Practice tests for academic IELTS"
   - Difficulty: "Intermediate"
7. Click "Create Track"

### Expected Results:
- ✅ Track appears in list
- ✅ Shows track name and description
- ✅ Shows "0 exams" badge
- ✅ Shows difficulty level

---

## ✅ Test 2: Import and Publish to Track (10 minutes)

### Steps:
1. Go to Admin → Exams
2. Click "Import Exam"
3. Select a JSON file
4. Enter exam title
5. Click "Import Exam"
6. ✅ Success message appears
7. Click "Publish to Track" button
8. Select the track you created
9. Click "Publish to Track"

### Expected Results:
- ✅ Modal closes
- ✅ Import form closes
- ✅ Exam list shows
- ✅ Toast: "✅ Exam published to track!"

---

## ✅ Test 3: View Exams in Track (5 minutes)

### Steps:
1. Go to Admin → Tracks
2. Click "View Exams" on your track
3. See the exam you just published

### Expected Results:
- ✅ Exam appears in track
- ✅ Shows exam title
- ✅ Shows question count and duration
- ✅ Shows status badges (Published, Active, Visible)

---

## ✅ Test 4: Toggle Exam Visibility (5 minutes)

### Steps:
1. In track view, find the exam
2. Click "Visible" button
3. Observe status change

### Expected Results:
- ✅ Button changes to "Hidden"
- ✅ Toast: "✅ Exam is now hidden"
- ✅ Status indicator updates

---

## ✅ Test 5: Toggle Exam Status (5 minutes)

### Steps:
1. In track view, find the exam
2. Click "Active" button
3. Observe status change

### Expected Results:
- ✅ Button changes to "Inactive"
- ✅ Toast: "✅ Exam is now inactive"
- ✅ Status indicator updates

---

## ✅ Test 6: Student Access (5 minutes)

### Steps:
1. Make sure exam is Visible and Active
2. Log out (click profile → Logout)
3. Log in as student (any email)
4. Go to "Available Exams"

### Expected Results:
- ✅ Exam appears in list
- ✅ Can click "Start Exam"
- ✅ Exam loads correctly

---

## ✅ Test 7: Create Track During Publish (5 minutes)

### Steps:
1. Import another JSON exam
2. Click "Publish to Track"
3. Click "Create New Track"
4. Enter:
   - Track Name: "IELTS General Training"
   - Description: "General training practice"
   - Difficulty: "Beginner"
5. Click "Create & Publish"

### Expected Results:
- ✅ New track created
- ✅ Exam published to new track
- ✅ Toast: "✅ Exam published to new track!"

---

## ✅ Test 8: Edit Track (5 minutes)

### Steps:
1. Go to Admin → Tracks
2. Click "Edit" on a track
3. Change:
   - Name: "IELTS Academic - Updated"
   - Description: "Updated description"
   - Difficulty: "Advanced"
4. Click "Update Track"

### Expected Results:
- ✅ Track details updated
- ✅ Changes appear in list
- ✅ Toast: "Track updated successfully"

---

## ✅ Test 9: Remove Exam from Track (5 minutes)

### Steps:
1. Go to Admin → Tracks
2. Click "View Exams"
3. Click "Remove" on an exam
4. Confirm deletion

### Expected Results:
- ✅ Exam removed from track
- ✅ Toast: "Exam removed from track"
- ✅ Exam no longer in list

---

## ✅ Test 10: Delete Track (5 minutes)

### Steps:
1. Go to Admin → Tracks
2. Click "Delete" on a track
3. Confirm deletion

### Expected Results:
- ✅ Track deleted
- ✅ Toast: "Track deleted successfully"
- ✅ Track no longer in list

---

## 📊 Test Results Template

```
Test Date: _______________
Tester: ___________________

Test 1 - Create Track: [ ] PASS [ ] FAIL
Test 2 - Import & Publish: [ ] PASS [ ] FAIL
Test 3 - View Exams: [ ] PASS [ ] FAIL
Test 4 - Toggle Visibility: [ ] PASS [ ] FAIL
Test 5 - Toggle Status: [ ] PASS [ ] FAIL
Test 6 - Student Access: [ ] PASS [ ] FAIL
Test 7 - Create During Publish: [ ] PASS [ ] FAIL
Test 8 - Edit Track: [ ] PASS [ ] FAIL
Test 9 - Remove Exam: [ ] PASS [ ] FAIL
Test 10 - Delete Track: [ ] PASS [ ] FAIL

Overall Status: [ ] PASS [ ] FAIL

Issues Found:
_________________________________
_________________________________

Notes:
_________________________________
_________________________________
```

---

## ✅ Success Criteria

All tests pass when:
- ✅ Tracks can be created
- ✅ Exams can be published to tracks
- ✅ Exams appear in track view
- ✅ Visibility can be toggled
- ✅ Status can be toggled
- ✅ Students see published exams
- ✅ Tracks can be edited
- ✅ Exams can be removed
- ✅ Tracks can be deleted
- ✅ No errors in console

---

## 📈 Expected Timeline

- **Test 1-3:** 20 minutes (basic workflow)
- **Test 4-6:** 15 minutes (status management)
- **Test 7-10:** 20 minutes (advanced features)
- **Total:** ~55 minutes

---

## 🎯 Key Improvements

### Before Phase 2:
- ❌ 3 clicks to publish exam
- ❌ No track organization
- ❌ Scattered exam management

### After Phase 2:
- ✅ 1 click to publish exam
- ✅ Organized by tracks
- ✅ Centralized management
- ✅ Real-time updates

---

## 📞 Troubleshooting

### Issue: Track doesn't appear
**Solution:** Refresh page, check console for errors

### Issue: Publish button doesn't work
**Solution:** Check if exam imported successfully, verify Firebase connection

### Issue: Exam doesn't appear in track
**Solution:** Refresh page, verify exam was published to correct track

### Issue: Student can't see exam
**Solution:** Verify exam is Visible and Active, try logging out and back in

---

## 🎓 Key Features to Test

1. **One-Click Publishing** - Most important!
2. **Track Organization** - Verify exams group correctly
3. **Real-time Updates** - Check status changes immediately
4. **Student Access** - Verify students see published exams
5. **Error Handling** - Try invalid inputs


