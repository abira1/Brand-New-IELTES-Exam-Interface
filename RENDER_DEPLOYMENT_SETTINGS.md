# Render.com Deployment Configuration

## Web Service Settings

### Basic Configuration

| Field | Value |
|-------|-------|
| **Name** | `Brand-New-IELTES-Exam-Interface` |
| **Language** | Node |
| **Branch** | main |
| **Region** | Singapore (Southeast Asia) |
| **Root Directory** | `functions` |

### Build & Start Commands

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
node server.js
```

---

## Environment Variables

Add these in the Render dashboard under "Environment":

```
FIREBASE_API_KEY=AIzaSyCGTgMm-OG1ObUOjYRmIWlPFY-ZTpqsEqw
FIREBASE_AUTH_DOMAIN=exam-interface-shah-sultan.firebaseapp.com
FIREBASE_DATABASE_URL=https://exam-interface-shah-sultan-default-rtdb.asia-southeast1.firebasedatabase.app
FIREBASE_PROJECT_ID=exam-interface-shah-sultan
FIREBASE_STORAGE_BUCKET=exam-interface-shah-sultan.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=1097444515731
FIREBASE_APP_ID=1:1097444515731:web:2165644b143a679ea85266
PORT=3000
NODE_ENV=production
```

---

## Step-by-Step Instructions

### 1. **Name**
- Enter: `Brand-New-IELTES-Exam-Interface`

### 2. **Language**
- Select: **Node**

### 3. **Branch**
- Enter: `main`

### 4. **Region**
- Select: **Singapore (Southeast Asia)**

### 5. **Root Directory** ⭐ IMPORTANT
- Enter: `functions`
- This tells Render to run commands from the `functions` folder

### 6. **Build Command**
- Clear the default
- Enter: `npm install`

### 7. **Start Command**
- Clear the default
- Enter: `node server.js`

### 8. **Environment Variables**
- Click "Add Environment Variable"
- Add all variables from the table above
- Copy-paste each one

### 9. **Plan**
- Select: **Free**

### 10. **Deploy**
- Click "Create Web Service"
- Wait 2-5 minutes for deployment

---

## After Deployment

Once deployed, you'll get a URL like:
```
https://brand-new-ieltes-exam-interface-xxxx.onrender.com
```

### Update Frontend

1. Open `frontend/.env`
2. Add:
```
REACT_APP_BACKEND_URL=https://brand-new-ieltes-exam-interface-xxxx.onrender.com
```

3. Rebuild and deploy:
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

---

## Verification

Test the deployment:
1. Go to: https://exam-interface-shah-sultan.web.app
2. Log in as admin
3. Upload JSON file
4. Should work without errors ✅


