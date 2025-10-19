# Routing Quick Reference Card

**Date**: October 19, 2025  
**Status**: ✅ LIVE  
**Live URL**: https://exam-interface-shah-sultan.web.app

---

## 🚀 Quick Start

### For Students
```
1. Visit: https://exam-interface-shah-sultan.web.app/login
2. Click "Continue with Google"
3. Sign in with any Google account
4. See "Account Pending" page
5. Wait for admin approval
```

### For Admins
```
1. Visit: https://exam-interface-shah-sultan.web.app/admin/login
2. Click "Continue with Google"
3. Sign in with:
   - shahsultanweb@gmail.com OR
   - toiral.dev@gmail.com
4. See Admin Dashboard
```

---

## 📍 Route Map

| Route | Unauthenticated | Authenticated |
|-------|-----------------|---------------|
| `/` | → `/login` | → based on role |
| `/login` | ✅ Public | → based on role |
| `/admin` | → `/admin/login` | → `/admin/dashboard` |
| `/admin/login` | ✅ Public | → based on role |
| `/admin/*` | → `/admin/login` | Admin only |
| `/student/*` | → `/login` | Student only |
| `/pending` | → `/login` | Pending only |

---

## 🔐 User Roles & Access

### Admin Role
- **Login**: `/admin/login`
- **Access**: `/admin/*` (Admin Dashboard)
- **Redirect**: `/student/*` → `/admin`
- **Redirect**: `/login` → `/admin`

### Student Role (Approved)
- **Login**: `/login`
- **Access**: `/student/*` (Student Dashboard)
- **Redirect**: `/admin/*` → `/login`
- **Redirect**: `/admin/login` → `/login`

### Pending Role
- **Login**: `/login`
- **Access**: `/pending` (Account Pending)
- **Redirect**: `/admin/*` → `/pending`
- **Redirect**: `/student/*` → `/pending`

### Unauthenticated
- **Admin Route**: `/admin` → `/admin/login`
- **Student Route**: `/student` → `/login`
- **Login Routes**: ✅ Public access

---

## ✅ What's Fixed

| Issue | Before | After |
|-------|--------|-------|
| `/admin` redirect | → `/login` | → `/admin/login` |
| `/admin/login` access | Requires auth | Public |
| Admin email validation | No redirect | → `/admin` or `/login` |
| Route protection | All → `/login` | Admin → `/admin/login` |

---

## 🧪 Test Scenarios

### Test 1: Unauthenticated Admin Access
```
Visit: /admin
Expected: Redirect to /admin/login
```

### Test 2: Authorized Admin Login
```
Visit: /admin/login
Sign in: shahsultanweb@gmail.com
Expected: Redirect to /admin
```

### Test 3: Unauthorized Admin Login
```
Visit: /admin/login
Sign in: any other email
Expected: Error message + redirect to /login (after 2 seconds)
```

### Test 4: Student Login
```
Visit: /login
Sign in: any email
Expected: Redirect to /pending
```

### Test 5: Cross-Role Access
```
Admin visiting /student: Redirect to /admin
Student visiting /admin: Redirect to /login
```

---

## 🔗 Important URLs

```
Student Login:    https://exam-interface-shah-sultan.web.app/login
Admin Login:      https://exam-interface-shah-sultan.web.app/admin/login
Admin Dashboard:  https://exam-interface-shah-sultan.web.app/admin
Student Dashboard: https://exam-interface-shah-sultan.web.app/student
Firebase Console: https://console.firebase.google.com/project/exam-interface-shah-sultan
```

---

## 🐛 Troubleshooting

### Not redirecting to `/admin/login`
- Clear cache: `Ctrl+Shift+Delete`
- Hard refresh: `Ctrl+F5`
- Check console for errors

### Authorized admin not redirecting to `/admin`
- Check email is in authorized list
- Check Firebase for admin whitelist entry
- Try signing out and back in

### Unauthorized user not redirecting to `/login`
- Wait 2 seconds for redirect
- Check console for error message
- Verify email is NOT in authorized list

### Student can access admin routes
- Check user role in Firebase
- Verify student status is "approved"
- Clear browser cache

---

## 📊 Routing Decision Tree

```
User visits URL
    ↓
Is user authenticated?
    ├─ NO
    │   ├─ Admin route (/admin/*) → /admin/login
    │   ├─ Student route (/student/*) → /login
    │   └─ Public route (/login, /admin/login) → Allow
    │
    └─ YES
        ├─ User role = admin
        │   ├─ Visiting /admin/* → Allow
        │   ├─ Visiting /student/* → /admin
        │   └─ Visiting /login → /admin
        │
        ├─ User role = student
        │   ├─ Visiting /student/* → Allow
        │   ├─ Visiting /admin/* → /login
        │   └─ Visiting /login → /student
        │
        └─ User role = pending
            ├─ Visiting /pending → Allow
            ├─ Visiting /admin/* → /pending
            └─ Visiting /student/* → /pending
```

---

## ✅ Checklist

- [ ] `/admin` redirects to `/admin/login`
- [ ] `/admin/login` is publicly accessible
- [ ] Authorized admin can log in
- [ ] Unauthorized user is rejected
- [ ] Student login works
- [ ] Route protection working
- [ ] Cross-role redirects working

---

## 📞 Support

**Issue**: Route not redirecting correctly
**Solution**: 
1. Clear browser cache
2. Hard refresh page
3. Check console for errors
4. Verify Firebase configuration

**Issue**: Can't log in as admin
**Solution**:
1. Use authorized email
2. Check email is in list
3. Try different browser
4. Check Firebase console

---

**Prepared by**: Augment Agent  
**Date**: October 19, 2025  
**Status**: ✅ LIVE & READY

For detailed testing: See **ROUTING_FIX_TESTING_GUIDE.md**

