// Firebase Configuration and Initialization
let auth, database, storage, functions, googleProvider, app;

// Check if Firebase environment variables are configured
const isFirebaseConfigured = process.env.REACT_APP_FIREBASE_API_KEY && 
                            process.env.REACT_APP_FIREBASE_PROJECT_ID;

if (isFirebaseConfigured) {
  try {
    const { initializeApp } = require('firebase/app');
    const { getAuth, GoogleAuthProvider } = require('firebase/auth');
    const { getDatabase } = require('firebase/database');
    const { getStorage } = require('firebase/storage');
    const { getFunctions } = require('firebase/functions');

    // Firebase config - these will be set via environment variables
    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID
    };

    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Firebase services
    auth = getAuth(app);
    database = getDatabase(app);
    storage = getStorage(app);
    functions = getFunctions(app);

    // Google Auth Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase not configured. Using mock services for development.');
  
  // Mock services for development
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      callback(null);
      return () => {};
    }
  };
  
  database = {
    ref: () => ({
      set: () => Promise.resolve(),
      get: () => Promise.resolve({ exists: () => false, val: () => null }),
      push: () => ({ key: 'mock-key' }),
      update: () => Promise.resolve(),
      remove: () => Promise.resolve(),
      on: () => {},
      off: () => {}
    })
  };
  
  storage = {
    ref: () => ({
      put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('mock-url') } })
    })
  };
  
  functions = {
    httpsCallable: () => () => Promise.resolve({ data: {} })
  };
  
  googleProvider = {
    addScope: () => {}
  };
  
  app = null;
}

export { auth, database, storage, functions, googleProvider };
export default app;