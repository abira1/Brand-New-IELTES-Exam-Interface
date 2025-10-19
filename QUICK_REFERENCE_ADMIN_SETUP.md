# Quick Reference - Admin Setup

**Time Required**: 5 minutes  
**Status**: ✅ Ready to configure

---

## One-Time Setup

### 1. Open Firebase Console
https://console.firebase.google.com/project/exam-interface-shah-sultan/database/data

### 2. Create Admin Whitelist Structure

**Click Data tab → Create this structure**:

```
admin/
  whitelist/
    shahsultanweb@gmail_com: true
```

**Steps**:
1. Click **+** next to root
2. Key: `admin` → Add
3. Click `admin` → Click **+**
4. Key: `whitelist` → Add
5. Click `whitelist` → Click **+**
6. Key: `shahsultanweb@gmail_com` (normalize: replace `.` and `@` with `_`)
7. Value: `true` → Add

### 3. Done! ✅

---

## Testing

### Test 1: Student Registration
```
1. Visit: https://exam-interface-shah-sultan.web.app
2. Sign in with Google
3. Should see "Account Pending" page
```

### Test 2: Admin Approval
```
1. Visit: https://exam-interface-shah-sultan.web.app?demo=admin
2. Go to "Student Management"
3. Click "Approve" on test student
```

### Test 3: Student Access
```
1. Sign out from admin
2. Sign in with test account
3. Should see "Student Dashboard"
```

---

## Adding More Admins

**Add to `admin/whitelist`**:
```
admin/
  whitelist/
    toiral.dev@gmail.com: true
    admin2@example.com: true
    admin3@example.com: true
```

---

## Email Normalization

**Replace `.` and `@` with `_` for Firebase paths**:
- ✅ `shahsultanweb@gmail.com` → `shahsultanweb@gmail_com`
- ✅ `admin@example.com` → `admin@example_com`
- ❌ `shahsultanweb@gmail.com` (wrong - must normalize)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to load students" | Check admin whitelist exists in Firebase |
| Student still pending after approval | Sign out, clear cache, sign in again |
| Admin can't see students | Verify email in whitelist (exact format) |
| Permission denied error | Check database rules deployed |

---

## Key Paths

| Path | Purpose |
|------|---------|
| `admin/whitelist/{email}` | Admin access control |
| `students/{uid}` | Student records |
| `exams/{examId}` | Exam metadata |
| `exams_full/{examId}` | Full exam data |
| `submissions/{id}` | Student submissions |
| `results/{id}` | Exam results |

---

## Status

- ✅ Database rules deployed
- ✅ Frontend deployed
- ⏳ Admin whitelist - needs configuration
- ⏳ Testing - ready to test

---

**Last Updated**: October 19, 2025

