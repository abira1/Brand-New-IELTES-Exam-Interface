# Track Manager User Guide - Phase 2

## 🎯 Overview

The Track Manager is a new admin feature that simplifies exam publishing and organization. Instead of clicking 3 buttons to publish an exam, you now click 1 button and select a track.

---

## 🚀 Quick Start

### Step 1: Access Track Manager
1. Log in as admin
2. Click "Admin Dashboard"
3. Click "Tracks" in the sidebar

### Step 2: Create Your First Track
1. Click "Create Track"
2. Enter:
   - **Track Name:** e.g., "IELTS Academic Practice"
   - **Description:** e.g., "Practice tests for academic IELTS"
   - **Difficulty:** Select from Beginner, Intermediate, Advanced
3. Click "Create Track"

### Step 3: Publish an Exam to Track
1. Go to Admin → Exams
2. Click "Import Exam"
3. Select JSON file and enter title
4. Click "Import Exam"
5. Click "Publish to Track"
6. Select your track
7. Click "Publish to Track"
8. ✅ Done! Exam is published and visible to students

---

## 📋 Features

### 1. Create Track
**Purpose:** Organize exams into categories

**Steps:**
1. Click "Create Track"
2. Fill in track details
3. Click "Create Track"

**What it does:**
- Creates a new track
- Assigns unique ID
- Sets creation timestamp
- Ready to add exams

### 2. View Exams in Track
**Purpose:** See all exams in a track

**Steps:**
1. Click "View Exams" on a track
2. See list of exams

**What you see:**
- Exam title
- Question count
- Duration
- Status badges (Published, Active, Visible)

### 3. Toggle Exam Visibility
**Purpose:** Show/hide exam from students

**Steps:**
1. In track view, click "Visible" or "Hidden"
2. Status updates immediately

**What it does:**
- Sets `is_visible: true/false`
- Exam appears/disappears from student list
- Real-time update (no refresh needed)

### 4. Toggle Exam Status
**Purpose:** Activate/deactivate exam

**Steps:**
1. In track view, click "Active" or "Inactive"
2. Status updates immediately

**What it does:**
- Sets `is_active: true/false`
- Students can/cannot start exam
- Real-time update (no refresh needed)

### 5. Remove Exam from Track
**Purpose:** Remove exam from track

**Steps:**
1. In track view, click "Remove"
2. Confirm deletion
3. Exam removed from track

**What it does:**
- Removes exam from track
- Exam still exists in system
- Can be added to another track

### 6. Edit Track
**Purpose:** Update track details

**Steps:**
1. Click "Edit" on a track
2. Update details
3. Click "Update Track"

**What you can change:**
- Track name
- Description
- Difficulty level

### 7. Delete Track
**Purpose:** Remove track

**Steps:**
1. Click "Delete" on a track
2. Confirm deletion
3. Track deleted

**What it does:**
- Deletes track
- Exams remain in system
- Exams no longer associated with track

---

## 🔄 Workflows

### Workflow 1: Import and Publish Exam
```
1. Go to Admin → Exams
2. Click "Import Exam"
3. Select JSON file
4. Enter exam title
5. Click "Import Exam"
6. Click "Publish to Track"
7. Select track
8. Click "Publish to Track"
✅ Exam published and visible to students
```

### Workflow 2: Create Track During Publish
```
1. Import exam (steps 1-5 above)
2. Click "Publish to Track"
3. Click "Create New Track"
4. Enter track details
5. Click "Create & Publish"
✅ New track created and exam published
```

### Workflow 3: Manage Exam Visibility
```
1. Go to Admin → Tracks
2. Click "View Exams"
3. Click "Visible" to hide exam
4. Click "Active" to deactivate exam
✅ Exam status updated in real-time
```

### Workflow 4: Organize Exams
```
1. Create multiple tracks
2. Import exams
3. Publish each exam to appropriate track
4. Use Track Manager to organize
✅ Exams organized by track
```

---

## 💡 Tips & Tricks

### Tip 1: Create Tracks First
Create all your tracks before importing exams. This makes publishing faster.

### Tip 2: Use Descriptive Names
Use clear track names like "IELTS Academic" instead of "Track 1"

### Tip 3: Set Difficulty Levels
Use difficulty levels to help students find appropriate exams

### Tip 4: Batch Operations
You can manage multiple exams in one track at once

### Tip 5: Real-time Updates
Changes appear immediately - no page refresh needed!

---

## ⚠️ Important Notes

### Publishing Exam
When you publish an exam to a track, it automatically:
- Sets `published: true`
- Sets `is_active: true`
- Sets `is_visible: true`
- Becomes immediately available to students

### Removing Exam
When you remove an exam from a track:
- Exam is NOT deleted
- Exam can be added to another track
- Exam remains in system

### Deleting Track
When you delete a track:
- Track is deleted
- Exams remain in system
- Exams are no longer associated with track

### Real-time Updates
All changes are real-time:
- Students see updates immediately
- No page refresh needed
- Changes sync across all devices

---

## 🎓 Best Practices

### 1. Organization
- Create tracks for different exam types
- Use consistent naming conventions
- Group related exams together

### 2. Publishing
- Always publish exams to a track
- Don't leave exams unpublished
- Use "Publish to Track" button

### 3. Management
- Regularly review exam status
- Hide exams that are outdated
- Delete unused tracks

### 4. Student Experience
- Keep track names clear
- Use appropriate difficulty levels
- Ensure exams are visible when ready

---

## 📊 Status Indicators

### Published Badge
- ✅ Green - Exam is published
- ❌ Gray - Exam is draft

### Active Badge
- ✅ Green - Students can start exam
- ❌ Gray - Exam is inactive

### Visible Badge
- ✅ Green - Exam appears in student list
- ❌ Gray - Exam is hidden

---

## 🔍 Troubleshooting

### Issue: Track doesn't appear
**Solution:** Refresh page, check console for errors

### Issue: Publish button doesn't work
**Solution:** Check if exam imported successfully, verify Firebase connection

### Issue: Exam doesn't appear in track
**Solution:** Refresh page, verify exam was published to correct track

### Issue: Student can't see exam
**Solution:** Verify exam is Visible and Active, try logging out and back in

### Issue: Can't delete track
**Solution:** Remove all exams from track first, then delete

---

## 📞 Support

### Need Help?
1. Check this guide
2. Review PHASE_2_QUICK_TEST_GUIDE.md
3. Check browser console for errors
4. Verify Firebase connection

### Common Questions

**Q: Can I move exam to different track?**
A: Yes, remove from current track and add to new track

**Q: Can I have exam in multiple tracks?**
A: Not currently, but you can duplicate exam

**Q: What happens if I delete track?**
A: Track is deleted, exams remain in system

**Q: Can students see track names?**
A: No, tracks are admin-only feature

---

## 🎯 Summary

The Track Manager makes exam management simple:
1. ✅ Create tracks to organize exams
2. ✅ Publish exams with one click
3. ✅ Manage visibility and status
4. ✅ Real-time updates for students
5. ✅ Centralized exam management

**Result:** Better organized exams, simpler workflow, improved user experience!


