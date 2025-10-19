# Admin Whitelist Setup - Quick Guide

**Time**: 5 minutes  
**Status**: Ready to configure

---

## Your Admin Email

**Original**: `shahsultanweb@gmail.com`  
**Normalized**: `shahsultanweb@gmail_com`

---

## Setup Steps

### 1. Open Firebase Console
https://console.firebase.google.com/project/exam-interface-shah-sultan/database/data

### 2. Click on "Data" Tab

### 3. Create Admin Node
- Click **+** next to root
- Enter: `admin`
- Click **Add**

### 4. Create Whitelist Node
- Click on `admin` node
- Click **+**
- Enter: `whitelist`
- Click **Add**

### 5. Add Your Email
- Click on `whitelist` node
- Click **+**
- Enter key: `shahsultanweb@gmail_com`
- Enter value: `true`
- Click **Add**

### 6. Done! ✅

---

## Result

Your database should look like:
```
admin/
  whitelist/
    shahsultanweb@gmail_com: true
```

---

## Test It

1. Visit: https://exam-interface-shah-sultan.web.app
2. Sign in with: `shahsultanweb@gmail.com`
3. Should see: "Admin Panel"
4. Go to: "Student Management"
5. Should see: List of students

---

## Email Normalization

**Replace these characters with `_`**:
- `.` (period) → `_`
- `@` (at sign) → `_`

**Example**:
- `shahsultanweb@gmail.com` → `shahsultanweb@gmail_com`
- `toiral.dev@gmail.com` → `toiral_dev@gmail_com`

---

## Adding More Admins

Add to `admin/whitelist`:
```
admin/
  whitelist/
    shahsultanweb@gmail_com: true
    admin2@example_com: true
    admin3@example_com: true
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Still loading | Check email is normalized correctly |
| Permission denied | Verify whitelist exists in Firebase |
| Can't see students | Check database rules deployed |

---

**Status**: ✅ Ready to deploy

