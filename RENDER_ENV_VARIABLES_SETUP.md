# Render.com Environment Variables Setup

## 📋 All Environment Variables Needed

Copy and paste each variable into Render's environment variable form.

### Firebase Configuration Variables

```
NAME_OF_VARIABLE: REACT_APP_FIREBASE_API_KEY
value: AIzaSyCGTgMm-OG1ObUOjYRmIWlPFY-ZTpqsEqw
```

```
NAME_OF_VARIABLE: REACT_APP_FIREBASE_AUTH_DOMAIN
value: exam-interface-shah-sultan.firebaseapp.com
```

```
NAME_OF_VARIABLE: REACT_APP_FIREBASE_DATABASE_URL
value: https://exam-interface-shah-sultan-default-rtdb.asia-southeast1.firebasedatabase.app
```

```
NAME_OF_VARIABLE: REACT_APP_FIREBASE_PROJECT_ID
value: exam-interface-shah-sultan
```

```
NAME_OF_VARIABLE: REACT_APP_FIREBASE_STORAGE_BUCKET
value: exam-interface-shah-sultan.firebasestorage.app
```

```
NAME_OF_VARIABLE: REACT_APP_FIREBASE_MESSAGING_SENDER_ID
value: 1097444515731
```

```
NAME_OF_VARIABLE: REACT_APP_FIREBASE_APP_ID
value: 1:1097444515731:web:2165644b143a679ea85266
```

### Server Configuration Variables

```
NAME_OF_VARIABLE: PORT
value: 3000
```

```
NAME_OF_VARIABLE: NODE_ENV
value: production
```

---

## 🎯 How to Add in Render Dashboard

### Method 1: Add One by One (Recommended)

1. In Render dashboard, scroll to **"Environment"** section
2. Click **"Add Environment Variable"** button
3. Fill in:
   - **NAME_OF_VARIABLE**: `REACT_APP_FIREBASE_API_KEY`
   - **value**: `AIzaSyCGTgMm-OG1ObUOjYRmIWlPFY-ZTpqsEqw`
4. Click **"Add"**
5. Repeat for each variable above

### Method 2: Add from .env File

1. Click **"Add from .env"** button
2. Paste all variables at once:

```
REACT_APP_FIREBASE_API_KEY=AIzaSyCGTgMm-OG1ObUOjYRmIWlPFY-ZTpqsEqw
REACT_APP_FIREBASE_AUTH_DOMAIN=exam-interface-shah-sultan.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://exam-interface-shah-sultan-default-rtdb.asia-southeast1.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=exam-interface-shah-sultan
REACT_APP_FIREBASE_STORAGE_BUCKET=exam-interface-shah-sultan.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1097444515731
REACT_APP_FIREBASE_APP_ID=1:1097444515731:web:2165644b143a679ea85266
PORT=3000
NODE_ENV=production
```

---

## ✅ Verification Checklist

After adding all variables, you should see:

- [ ] REACT_APP_FIREBASE_API_KEY
- [ ] REACT_APP_FIREBASE_AUTH_DOMAIN
- [ ] REACT_APP_FIREBASE_DATABASE_URL
- [ ] REACT_APP_FIREBASE_PROJECT_ID
- [ ] REACT_APP_FIREBASE_STORAGE_BUCKET
- [ ] REACT_APP_FIREBASE_MESSAGING_SENDER_ID
- [ ] REACT_APP_FIREBASE_APP_ID
- [ ] PORT
- [ ] NODE_ENV

**Total: 9 environment variables**

---

## 🚀 Next Steps

1. Add all 9 environment variables
2. Click "Create Web Service"
3. Wait for deployment (2-5 minutes)
4. Copy the Render URL from the dashboard
5. Update frontend `.env` with the Render URL
6. Redeploy frontend to Firebase Hosting


