# Admin Setup Guide - IELTS Mock Exam Platform

**Purpose**: Configure admin access and student approval workflow  
**Time Required**: 5-10 minutes  
**Prerequisites**: Firebase Console access

---

## Quick Start (5 Minutes)

### 1. Deploy Updated Database Rules

```bash
cd c:\Users\Aminul\Downloads\ILTES Mock Exam
firebase deploy --only database
```

Wait for confirmation:
```
✓ database: rules syntax for database exam-interface-shah-sultan-default-rtdb is valid
✓ database: rules for database exam-interface-shah-sultan-default-rtdb released successfully
```

### 2. Add Admin Email to Whitelist

**Your Admin Email**: `shahsultanweb@gmail.com`

**Normalized Format**: `shahsultanweb@gmail_com`

**Steps**:
1. Open Firebase Console: https://console.firebase.google.com/project/exam-interface-shah-sultan/database/data
2. Click on the **Data** tab
3. Look for the root node (should show `admin`, `exams`, `students`, etc.)
4. If `admin` node doesn't exist, create it:
   - Click the **+** button next to root
   - Enter key: `admin`
   - Click **Add**
5. Click on `admin` node
6. Click **+** button to add child
   - Enter key: `whitelist`
   - Click **Add**
7. Click on `whitelist` node
8. Click **+** button to add child
   - Enter key: `shahsultanweb@gmail_com` (normalized format - replace `.` and `@` with `_`)
   - Enter value: `true`
   - Click **Add**

**Result**: Your database should look like:
```
root
├── admin
│   └── whitelist
│       └── shahsultanweb@gmail_com: true
├── exams
├── exams_full
├── students
├── submissions
├── results
└── reports
```

### 3. Test Admin Access

1. Visit: https://exam-interface-shah-sultan.web.app?demo=admin
2. You should see Admin Dashboard
3. Go to "Student Management"
4. You should see a list of students (if any exist)

---

## Complete Setup Process (Detailed)

### Phase 1: Prepare

**Check Current Status**:
```bash
firebase projects:list
```

**Expected Output**:
```
exam-interface-shah-sultan
```

### Phase 2: Deploy Rules

**Deploy Database Rules**:
```bash
firebase deploy --only database
```

**Verify Deployment**:
- Check Firebase Console → Database → Rules tab
- Rules should show the updated configuration

### Phase 3: Configure Admin Whitelist

**Option A: Firebase Console (Recommended)**

1. Go to: https://console.firebase.google.com/project/exam-interface-shah-sultan/database/data
2. Create structure:
   ```
   admin/whitelist/{normalized_email}: true
   ```
3. Add your email:
   - Key: `toiral_dev@gmail_com`
   - Value: `true`

**Option B: Firebase CLI (Advanced)**

Create a file `admin_setup.json`:
```json
{
  "admin": {
    "whitelist": {
      "toiral_dev@gmail_com": true
    }
  }
}
```

Then import:
```bash
firebase database:set /admin/whitelist admin_setup.json
```

### Phase 4: Test Workflow

**Test 1: Student Registration**
1. Visit: https://exam-interface-shah-sultan.web.app
2. Click "Sign in with Google"
3. Sign in with a test account (e.g., test@gmail.com)
4. You should see "Account Pending" page
5. Check Firebase Console → Database → students
6. Verify student record created

**Test 2: Admin Access**
1. Visit: https://exam-interface-shah-sultan.web.app?demo=admin
2. Go to "Student Management"
3. You should see the test student
4. Click "Approve"
5. Verify status changes to "approved"

**Test 3: Student Access After Approval**
1. Sign out from admin panel
2. Sign in with test account
3. You should see "Student Dashboard"
4. Verify you can access "Available Exams"

---

## Email Normalization Reference

**Firebase paths cannot contain: `.` `@` `#` `$` `[` `]`**

**Normalize by replacing these characters with `_`**:

| Original Email | Normalized Key |
|---|---|
| `shahsultanweb@gmail.com` | `shahsultanweb@gmail_com` |
| `toiral.dev@gmail.com` | `toiral_dev@gmail_com` |
| `admin@example.com` | `admin@example_com` |
| `john.doe@company.co.uk` | `john_doe@company_co_uk` |
| `test.user+tag@domain.org` | `test_user+tag@domain_org` |

**Rule**: Replace `.` with `_` and `@` with `_` (and any other invalid characters)

---

## Adding Multiple Admins

To add more admins, repeat the process for each email:

```
admin/whitelist/
  toiral_dev@gmail_com: true
  admin1@example_com: true
  admin2@example_com: true
```

---

## Troubleshooting

### Problem: "Failed to load students" in Admin Panel

**Check 1**: Verify database rules deployed
```bash
firebase deploy --only database
```

**Check 2**: Verify admin whitelist exists
- Go to Firebase Console → Database → Data
- Check `admin/whitelist` path exists
- Check your email is there (normalized)

**Check 3**: Check browser console
- Open DevTools (F12)
- Go to Console tab
- Look for Firebase permission errors
- Example error: `Permission denied: /students`

**Check 4**: Verify email normalization
- Your email: `shahsultanweb@gmail.com`
- Should be: `shahsultanweb@gmail_com` (replace `.` and `@` with `_`)

### Problem: Admin sees empty student list

**Possible Causes**:
1. No students have registered yet
2. Database rules not deployed
3. Admin whitelist not configured

**Solution**:
1. Create a test student account
2. Verify database rules deployed
3. Verify admin whitelist configured
4. Refresh page (Ctrl+F5)

### Problem: Student still sees "Account Pending" after approval

**Solution**:
1. Sign out completely
2. Clear browser cache (Ctrl+Shift+Delete)
3. Close browser completely
4. Reopen browser and sign in again

---

## Database Rules Explanation

The updated rules allow:

**Admins** (users in `admin/whitelist`):
- Read all students
- Create/update/delete exams
- Read/update submissions and results
- Full access to reports

**Students** (users with `status: 'approved'`):
- Read only their own student record
- Read available exams
- Create/update their own submissions
- Read their own results

**Pending Students** (users with `status: 'pending'`):
- Read only their own student record
- Cannot access exams or submissions

---

## Security Notes

1. **Email Normalization**: Ensures consistent key format
2. **Whitelist-based Access**: Only whitelisted admins can manage students
3. **Role-based Rules**: Different permissions for admins vs students
4. **User-scoped Data**: Students can only access their own data

---

## Next Steps

1. ✅ Deploy database rules
2. ✅ Configure admin whitelist
3. ✅ Test student registration
4. ✅ Test admin approval
5. ✅ Test student access
6. 📋 Monitor for issues
7. 📋 Add more admins as needed

---

## Support Resources

- **Firebase Console**: https://console.firebase.google.com/project/exam-interface-shah-sultan
- **Database Rules**: https://console.firebase.google.com/project/exam-interface-shah-sultan/database/rules
- **Database Data**: https://console.firebase.google.com/project/exam-interface-shah-sultan/database/data
- **Firebase Docs**: https://firebase.google.com/docs/database/security

---

**Status**: ✅ READY TO CONFIGURE  
**Last Updated**: October 19, 2025

