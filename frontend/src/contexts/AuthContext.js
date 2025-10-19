// Authentication Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize demo mode state handler
  const initializeDemoMode = React.useCallback(() => {
    // Check for demo mode in URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const demoParam = urlParams.get('demo');
    const storedDemoMode = localStorage.getItem('demoMode');
    
    // Prioritize URL parameter over localStorage for demo mode switching
    let effectiveDemoMode;
    if (demoParam) {
      effectiveDemoMode = demoParam; // URL parameter takes priority
      localStorage.setItem('demoMode', demoParam); // Update localStorage with URL param
    } else {
      effectiveDemoMode = storedDemoMode; // Fall back to localStorage
    }
    
    // Admin demo mode
    if (effectiveDemoMode === 'admin') {
      // Set demo admin user
      setUser({ uid: 'demo-admin', email: 'admin@demo.com', displayName: 'Demo Admin' });
      setUserRole('admin');
      setLoading(false);
      return true; // Indicate demo mode was set
    }
    
    if (effectiveDemoMode === 'student') {
      // Set demo student user
      setUser({ uid: 'demo-student', email: 'student@demo.com', displayName: 'Demo Student' });
      setUserRole('student');
      setLoading(false);
      return true; // Indicate demo mode was set
    }
    
    return false; // No demo mode
  }, []);

  // Effect to handle initial load and URL changes
  useEffect(() => {
    const isDemoMode = initializeDemoMode();
    
    if (!isDemoMode) {
      // Only set up Firebase listener if not in demo mode
      const unsubscribe = authService.initAuthListener((authUser, role) => {
        setUser(authUser);
        setUserRole(role);
        setLoading(false);
        setError(null);
      });

      return () => unsubscribe();
    }
  }, [initializeDemoMode]);

  // Effect to listen for URL changes (for demo mode switching)
  useEffect(() => {
    const handleLocationChange = () => {
      // Check if URL has demo parameter and current user state doesn't match
      const urlParams = new URLSearchParams(window.location.search);
      const demoParam = urlParams.get('demo');
      
      if (demoParam && (
        (demoParam === 'admin' && user?.uid !== 'demo-admin') ||
        (demoParam === 'student' && user?.uid !== 'demo-student')
      )) {
        // Re-initialize demo mode when URL parameter changes
        initializeDemoMode();
      }
    };

    // Listen for popstate events (back/forward button)
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [user, initializeDemoMode]);

  const signIn = async () => {
    setLoading(true);
    setError(null);

    const result = await authService.signInWithGoogle();

    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }

    return result;
  };

  const signInAsAdmin = async () => {
    setLoading(true);
    setError(null);

    const result = await authService.signInAsAdmin();

    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }

    return result;
  };

  const signOut = async () => {
    setLoading(true);

    // Clear demo mode from localStorage
    localStorage.removeItem('demoMode');

    const result = await authService.signOut();

    if (!result.success) {
      setError(result.error);
    } else {
      // Clear user state
      setUser(null);
      setUserRole(null);
    }

    setLoading(false);
    return result;
  };

  const updateProfile = async (additionalData) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    return await authService.updateUserProfile(user, additionalData);
  };

  const refreshDemoMode = React.useCallback(() => {
    // Use the same initialization logic for consistency
    initializeDemoMode();
  }, [initializeDemoMode]);

  const value = {
    user,
    userRole,
    loading,
    error,
    signIn,
    signInAsAdmin,
    signOut,
    updateProfile,
    refreshDemoMode,
    isAdmin: () => userRole === 'admin',
    isStudent: () => userRole === 'student',
    isPending: () => userRole === 'pending',
    isAuthenticated: () => !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};