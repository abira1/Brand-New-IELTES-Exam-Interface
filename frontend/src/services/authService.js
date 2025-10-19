// Authentication Service
import { auth, googleProvider, database } from '../config/firebase';

// Check if Firebase is properly initialized
const isFirebaseEnabled = auth && auth.onAuthStateChanged && typeof auth.onAuthStateChanged === 'function';

// Mock Firebase auth methods if not available
let signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged;
let ref, set, get, update;

if (isFirebaseEnabled) {
  const authModule = require('firebase/auth');
  const databaseModule = require('firebase/database');
  
  signInWithPopup = authModule.signInWithPopup;
  signInWithRedirect = authModule.signInWithRedirect;
  getRedirectResult = authModule.getRedirectResult;
  signOut = authModule.signOut;
  onAuthStateChanged = authModule.onAuthStateChanged;
  
  ref = databaseModule.ref;
  set = databaseModule.set;
  get = databaseModule.get;
  update = databaseModule.update;
} else {
  // Mock implementations
  signInWithPopup = () => Promise.reject(new Error('Firebase not configured'));
  signOut = () => Promise.resolve();
  onAuthStateChanged = (auth, callback) => {
    callback(null);
    return () => {};
  };
  
  ref = () => ({});
  set = () => Promise.resolve();
  get = () => Promise.resolve({ exists: () => false, val: () => null });
  update = () => Promise.resolve();
}

class AuthService {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
    this.loading = true;
  }

  // Normalize email for use as Firebase database path key
  // Firebase paths cannot contain: . # $ [ ] @
  // Replace these characters with underscores
  normalizeEmailForPath(email) {
    if (!email) return '';
    return email
      .toLowerCase()
      .replace(/\./g, '_')
      .replace(/@/g, '_')
      .replace(/#/g, '_')
      .replace(/\$/g, '_')
      .replace(/\[/g, '_')
      .replace(/\]/g, '_');
  }

  // Initialize auth state listener
  initAuthListener(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUser = user;
        await this.checkUserRole(user);
        await this.updateUserProfile(user);
      } else {
        this.currentUser = null;
        this.userRole = null;
      }
      this.loading = false;
      callback(user, this.userRole);
    });
  }

  // Sign in with Google
  async signInWithGoogle() {
    if (!isFirebaseEnabled) {
      return { 
        success: false, 
        error: 'Firebase authentication is not configured. Please set up your Firebase credentials.' 
      };
    }
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Create/update user profile in database
      await this.createUserProfile(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.userRole = null;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Create or update user profile
  async createUserProfile(user) {
    try {
      console.log('👤 [createUserProfile] Starting to create/update user profile');
      console.log('👤 [createUserProfile] User UID:', user.uid);
      console.log('👤 [createUserProfile] User email:', user.email);
      console.log('👤 [createUserProfile] User displayName:', user.displayName);
      console.log('👤 [createUserProfile] Firebase enabled:', isFirebaseEnabled);

      const userRef = ref(database, `students/${user.uid}`);
      console.log('👤 [createUserProfile] Created ref for path: students/' + user.uid);

      const snapshot = await get(userRef);
      console.log('👤 [createUserProfile] Snapshot exists:', snapshot.exists());

      if (!snapshot.exists()) {
        // New user - create profile
        console.log('👤 [createUserProfile] New user detected, creating profile...');
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          status: 'pending', // pending, approved, rejected
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          institution: '',
          phone: ''
        };

        console.log('👤 [createUserProfile] User data to save:', userData);
        await set(userRef, userData);
        console.log('✅ [createUserProfile] User profile created successfully');
      } else {
        // Existing user - update last login
        console.log('👤 [createUserProfile] Existing user detected, updating last login...');
        await update(userRef, {
          lastLogin: new Date().toISOString(),
          photoURL: user.photoURL,
          displayName: user.displayName
        });
        console.log('✅ [createUserProfile] User profile updated successfully');
      }
    } catch (error) {
      console.error('❌ [createUserProfile] Error creating/updating user profile:', error);
      console.error('❌ [createUserProfile] Error message:', error.message);
      console.error('❌ [createUserProfile] Error stack:', error.stack);
      throw error;
    }
  }

  // Check user role (admin or student)
  async checkUserRole(user) {
    try {
      // Check if user is admin - normalize email for Firebase path
      const normalizedEmail = this.normalizeEmailForPath(user.email);
      const adminRef = ref(database, `admin/whitelist/${normalizedEmail}`);
      const adminSnapshot = await get(adminRef);

      if (adminSnapshot.exists()) {
        this.userRole = 'admin';
        return 'admin';
      }

      // Check student status
      const studentRef = ref(database, `students/${user.uid}`);
      const studentSnapshot = await get(studentRef);

      if (studentSnapshot.exists()) {
        const userData = studentSnapshot.val();
        this.userRole = userData.status === 'approved' ? 'student' : 'pending';
        return this.userRole;
      }

      this.userRole = 'pending';
      return 'pending';
    } catch (error) {
      console.error('Error checking user role:', error);
      this.userRole = null;
      return null;
    }
  }

  // Validate if email is authorized admin
  isAuthorizedAdmin(email) {
    const authorizedAdmins = [
      'shahsultanweb@gmail.com',
      'toiral.dev@gmail.com'
    ];
    return authorizedAdmins.includes(email.toLowerCase());
  }

  // Sign in as admin (with email validation)
  async signInAsAdmin() {
    if (!isFirebaseEnabled) {
      return {
        success: false,
        error: 'Firebase authentication is not configured. Please set up your Firebase credentials.'
      };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Validate admin email
      if (!this.isAuthorizedAdmin(user.email)) {
        // Sign out the user immediately
        await signOut(auth);
        return {
          success: false,
          error: `Access denied. ${user.email} is not authorized as an admin. Only authorized admin emails can access the admin portal.`
        };
      }

      // Create/update user profile in database
      await this.createUserProfile(user);

      return { success: true, user };
    } catch (error) {
      console.error('Admin sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user profile information
  async updateUserProfile(user, additionalData = {}) {
    try {
      const userRef = ref(database, `students/${user.uid}`);
      await update(userRef, {
        ...additionalData,
        lastLogin: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user data
  getCurrentUser() {
    return this.currentUser;
  }

  // Get current user role
  getUserRole() {
    return this.userRole;
  }

  // Check if user is admin
  isAdmin() {
    return this.userRole === 'admin';
  }

  // Check if user is approved student
  isApprovedStudent() {
    return this.userRole === 'student';
  }

  // Check if user is pending approval
  isPending() {
    return this.userRole === 'pending';
  }
}

export default new AuthService();