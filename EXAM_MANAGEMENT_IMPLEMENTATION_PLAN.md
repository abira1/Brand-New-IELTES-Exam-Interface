# Exam Management Implementation Plan

## 🎯 Goal
Enable admins to publish imported exams and make them available to students.

---

## 📋 Phase 1: Core Exam Management (IMMEDIATE - 2-3 hours)

### Step 1: Update ExamManagement Component
**File:** `frontend/src/components/admin/ExamManagement.jsx`

**Changes:**
1. Add status badge showing: "Draft", "Published", "Active"
2. Add action buttons:
   - "Publish" (if status = draft)
   - "Unpublish" (if status = published)
   - "Activate" (if published but not active)
   - "Deactivate" (if active)
   - "Make Visible" (if not visible)
   - "Hide" (if visible)

**Code Structure:**
```javascript
// Add these functions
const handlePublish = async (examId) => {
  await databaseService.updateExam(examId, { 
    status: 'published',
    published: true 
  });
  toast.success('Exam published');
  fetchExams();
};

const handleActivate = async (examId) => {
  await databaseService.updateExam(examId, { 
    is_active: true 
  });
  toast.success('Exam activated');
  fetchExams();
};

const handleMakeVisible = async (examId) => {
  await databaseService.updateExam(examId, { 
    is_visible: true 
  });
  toast.success('Exam is now visible to students');
  fetchExams();
};
```

### Step 2: Add updateExam Method to databaseService
**File:** `frontend/src/services/databaseService.js`

**Add Method:**
```javascript
async updateExam(examId, updates) {
  try {
    // Update light metadata
    await update(ref(database, `exams/${examId}`), updates);
    
    // Also update full exam data
    await update(ref(database, `exams_full/${examId}`), updates);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating exam:', error);
    return { success: false, error: error.message };
  }
}
```

### Step 3: Update ExamImport Success Flow
**File:** `frontend/src/components/admin/ExamImport.jsx`

**Changes:**
1. After successful import, show:
   - ✅ Import successful message
   - 📋 Exam details (title, questions, sections)
   - 🎯 Next steps guidance
   - ✨ "Go to Exam Management" button
   - 🚀 "Publish Now" button (optional quick action)

**Code:**
```javascript
// After successful upload
setResult({
  success: true,
  examId: response.data.examId,
  message: response.data.message,
  details: response.data.data,
  nextSteps: [
    'Review exam details',
    'Click "Publish" to make visible to students',
    'Click "Activate" to allow students to take it'
  ]
});
```

### Step 4: Update Firebase Rules (if needed)
**File:** `firebase-rules.json`

**Current Rules:** Already allow authenticated writes to exams
**Status:** ✅ No changes needed

---

## 📋 Phase 2: Exam Organization (Next - 2-3 hours)

### Step 5: Create Exam Tracks Component
**File:** `frontend/src/components/admin/ExamTracks.jsx` (NEW)

**Features:**
- List all exam tracks
- Create new track
- Edit track
- Delete track
- Assign exams to tracks

**Database Schema:**
```
/exam_tracks/{trackId}
  - id: uuid
  - name: "IELTS Academic Practice"
  - description: string
  - difficulty: "beginner" | "intermediate" | "advanced"
  - exams: [examId1, examId2, ...]
  - createdAt: timestamp
```

### Step 6: Add Track Management to ExamManagement
**Changes:**
1. Add "Assign to Track" button
2. Show current track in exam card
3. Allow changing track

### Step 7: Update Student View
**File:** `frontend/src/components/student/AvailableExams.jsx`

**Changes:**
1. Add filter by track
2. Show track name in exam card
3. Group exams by track (optional)

---

## 📋 Phase 3: Advanced Features (Later - 4-5 hours)

### Step 8: Exam Scheduling
- Set availability dates
- Set expiration dates
- Auto-publish on date
- Auto-hide on date

### Step 9: Student Assignment
- Assign exams to specific students
- Assign exams to groups
- Track access permissions

### Step 10: Analytics & Monitoring
- View student attempts per exam
- Track completion rates
- Monitor average scores
- Export results

---

## 🔧 Backend Changes Needed

### Update `/uploadJson` Endpoint
**File:** `functions/server.js`

**Current:** Sets `status: 'draft'`
**Change:** Add option to auto-publish

```javascript
// After successful import
const metadata = {
  ...existing fields...,
  status: 'draft',
  published: false,
  is_visible: false,
  is_active: false,
  // NEW: Allow auto-publish via query param
  // ?autoPublish=true
};
```

---

## 📊 UI/UX Design

### Exam Card (Admin View)

```
┌─────────────────────────────────────┐
│ IELTS Reading Partial               │
│ Status: [Draft] [Published] [Active]│
├─────────────────────────────────────┤
│ Type: Full Test                     │
│ Duration: 60 minutes                │
│ Questions: 40                       │
│ Created: Oct 19, 2025               │
│                                     │
│ Sections:                           │
│ • Reading (40 questions)            │
├─────────────────────────────────────┤
│ [View] [Edit] [Delete]              │
│ [Publish] [Activate] [Make Visible] │
│ [Assign to Track]                   │
└─────────────────────────────────────┘
```

### Import Success Screen

```
┌─────────────────────────────────────┐
│ ✅ Import Successful!               │
├─────────────────────────────────────┤
│ Title: IELTS Reading Partial        │
│ Questions: 40                       │
│ Sections: Reading                   │
│ Exam ID: effd9319-06c2-...          │
│                                     │
│ 📋 Next Steps:                      │
│ 1. Review exam details              │
│ 2. Click "Publish" button           │
│ 3. Click "Activate" button          │
│ 4. Students can now take exam       │
│                                     │
│ [Go to Exam Management]             │
│ [Publish Now] [Close]               │
└─────────────────────────────────────┘
```

---

## ✅ Testing Checklist

### Phase 1 Testing
- [ ] Import exam successfully
- [ ] See exam in ExamManagement list
- [ ] Click "Publish" button
- [ ] Exam status changes to "Published"
- [ ] Click "Activate" button
- [ ] Exam status changes to "Active"
- [ ] Click "Make Visible" button
- [ ] Exam status changes to "Visible"
- [ ] Log in as student
- [ ] See exam in "Available Exams"
- [ ] Click "Start Exam"
- [ ] Can take exam successfully

### Phase 2 Testing
- [ ] Create exam track
- [ ] Assign exam to track
- [ ] See track in exam card
- [ ] Filter exams by track
- [ ] Student sees track info

---

## 📈 Success Metrics

✅ **Phase 1 Complete When:**
- Admins can publish imported exams
- Admins can activate exams
- Admins can make exams visible
- Students can see and take published exams

✅ **Phase 2 Complete When:**
- Admins can organize exams into tracks
- Students can filter by track
- Exams show track information

✅ **Phase 3 Complete When:**
- Admins can schedule exam availability
- Admins can assign exams to students
- Analytics dashboard shows usage data


