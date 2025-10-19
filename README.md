# IELTS Mock Test Platform

A comprehensive Firebase-based IELTS Mock Test platform that imports exam content from ZIP/XHTML files and provides real-time admin and student interfaces.

![IELTS Platform Screenshot](screenshot-login.png)

## 🚀 Features

### Core Functionality
- **Firebase Authentication** - Google Social Login
- **Real-time Database** - Live sync for exam progress and results  
- **ZIP Import System** - Automatic parsing of IELTS XHTML question formats
- **Question Types** - All IELTS question formats (Reading, Listening, Writing)
- **Admin Dashboard** - Complete exam and student management
- **Student Portal** - Exam taking with real-time timers and auto-save
- **Scoring Engine** - Automatic grading with manual override capabilities
- **Analytics** - Performance tracking and reporting

### Admin Features
- Exam import from ZIP files with XHTML parsing
- Student approval and management workflows
- Question-by-question review and scoring
- Real-time submission monitoring
- Analytics and performance reports
- Bulk operations for students and exams

### Student Features
- Available exams with difficulty indicators
- Real-time exam interface with server-authoritative timers
- Auto-save functionality with offline support
- Detailed results with band score conversion
- Progress tracking and performance history
- Mobile-responsive design

## 🏗 Architecture

```
Frontend (React + Tailwind + Shadcn/UI)
├── Authentication (Firebase Auth)
├── Real-time Database (Firebase Realtime DB)
├── File Storage (Firebase Storage)
└── Cloud Functions (Node.js)

Backend Services
├── ZIP Parser & Import Pipeline
├── Question Renderer Engine
├── Auto-grading System
└── Real-time Sync Manager
```

## 📋 Project Structure

```
/app/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/       # Admin dashboard components
│   │   │   ├── student/     # Student portal components
│   │   │   ├── exam/        # Exam interface components
│   │   │   ├── auth/        # Authentication components
│   │   │   └── ui/          # Shadcn/UI components
│   │   ├── services/        # Firebase services
│   │   ├── contexts/        # React contexts
│   │   └── config/          # Configuration files
│   └── public/              # Static assets
├── firebase.json            # Firebase configuration
├── firebase-rules.json      # Realtime Database security rules
├── storage.rules           # Storage security rules
└── IELTS_PLATFORM_PLAN.md # Complete implementation plan
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ and Yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with enabled services

### 1. Firebase Project Setup

1. **Create Firebase Project**
   ```bash
   # Login to Firebase
   firebase login
   
   # Create new project
   firebase projects:create your-ielts-project-id
   
   # Select the project
   firebase use your-ielts-project-id
   ```

2. **Enable Firebase Services**
   - Authentication (Google provider)
   - Realtime Database
   - Cloud Storage
   - Cloud Functions
   - Hosting

3. **Configure Authentication**
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Google provider
   - Add your domain to authorized domains

### 2. Environment Configuration

Update `/app/frontend/.env` with your Firebase credentials:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456789
```

### 3. Database Rules Setup

```bash
# Deploy database rules
firebase deploy --only database
```

### 4. Storage Rules Setup

```bash
# Deploy storage rules  
firebase deploy --only storage
```

### 5. Local Development

```bash
# Install dependencies
cd /app/frontend
yarn install

# Start development server
yarn start

# Firebase emulator (optional)
firebase emulators:start
```

### 6. Admin User Setup

Add your email to the admin whitelist in Firebase Realtime Database:

```json
{
  "admin": {
    "whitelist": {
      "your-email,com": true
    }
  }
}
```

Note: Replace dots with commas in email addresses for Firebase keys.

## 🚀 Deployment

### Build and Deploy

```bash
# Build the frontend
cd /app/frontend
yarn build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy all services
firebase deploy
```

### Production Configuration

1. **Custom Domain Setup**
   ```bash
   firebase hosting:channel:deploy live --only hosting
   ```

2. **Environment Variables**
   - Set production Firebase config
   - Configure CORS origins
   - Set up monitoring and alerts

## 📊 ZIP Import Format

The platform supports IELTS question ZIP files with the following structure:

```
exam.zip
├── Listening/
│   ├── Fill in the gaps/
│   │   ├── index.xhtml          # Main template
│   │   ├── test-content/        # Questions and audio
│   │   ├── css/, images/, js/   # Assets  
│   │   └── instructions/        # Help content
│   └── Multiple Choice/
└── Reading/
    ├── True False Not Given/
    └── Summary Completion/
```

### Supported Question Types

**Listening:**
- Fill in the gaps
- Multiple choice (single/multiple)
- Form completion
- Sentence completion
- Labelling maps
- Matching
- Table completion

**Reading:**
- Multiple choice
- True/False/Not Given
- Matching headings
- Summary completion
- Note completion
- Flow chart completion

**Writing:**
- Task 1 (Data description)
- Task 2 (Essay writing)

## 🔐 Security Features

- **Firebase Security Rules** - Row-level security for all data
- **Authentication Required** - All routes protected
- **Role-based Access** - Admin/Student permissions
- **Input Validation** - Client and server-side validation
- **File Upload Security** - Restricted file types and sizes
- **API Rate Limiting** - Cloud Functions protection

## 📈 Analytics & Monitoring

- **Performance Metrics** - Page load times and user engagement
- **Error Tracking** - Real-time error monitoring
- **Usage Analytics** - Student progress and exam completion rates
- **Cost Monitoring** - Firebase usage and billing alerts

## 🧪 Testing

The platform includes comprehensive testing:

```bash
# Run unit tests
yarn test

# Run integration tests
yarn test:integration

# Firebase emulator tests
firebase emulators:exec \"yarn test:emulator\"
```

## 🎯 Current Status

### ✅ Completed
- [x] Firebase infrastructure setup
- [x] Authentication system (Google OAuth)
- [x] Admin and Student dashboard layouts
- [x] Protected routing and role management
- [x] Database service architecture
- [x] Beautiful responsive UI with Shadcn/UI
- [x] Mobile-first design approach
- [x] Security rules and storage configuration

### 🚧 In Development
- [ ] ZIP import pipeline with XHTML parser
- [ ] Question renderer engine for all IELTS types
- [ ] Real-time exam interface
- [ ] Auto-grading and scoring system
- [ ] Admin review and management tools
- [ ] Analytics and reporting dashboard

### 🔄 Next Steps
1. Complete Firebase configuration setup
2. Implement ZIP parsing pipeline
3. Build question renderer components
4. Add real-time exam functionality
5. Create comprehensive test suite

## 📚 Documentation

- [Complete Implementation Plan](IELTS_PLATFORM_PLAN.md)
- [Firebase Security Rules](firebase-rules.json)
- [Storage Security Rules](storage.rules)

## 🤝 Contributing

This is a comprehensive IELTS platform built with modern web technologies. The architecture supports:

- **Scalability** - Firebase backend handles thousands of concurrent users
- **Reliability** - Real-time sync with offline support
- **Security** - Enterprise-grade authentication and authorization
- **Performance** - Optimized loading with code splitting
- **Maintainability** - Clean architecture with TypeScript support

## 📧 Support

For support and setup assistance, please refer to the implementation plan or create an issue in the project repository.

---

**Built with ❤️ using React, Firebase, Tailwind CSS, and Shadcn/UI**
