import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { getToken } from '../services/api';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      // Store user data in localStorage as backup
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: true, 
        user: action.payload.user,
        error: null 
      };
    case 'FIREBASE_LOGIN_SUCCESS':
      // Handle Firebase user login
      const firebaseUser = {
        id: action.payload.uid,
        name: action.payload.displayName || action.payload.email,
        email: action.payload.email,
        profilePicture: action.payload.photoURL,
        authProvider: 'firebase',
        firebaseUser: action.payload
      };
      localStorage.setItem('user', JSON.stringify(firebaseUser));
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: firebaseUser,
        error: null
      };
    case 'LOGIN_FAILURE':
      localStorage.removeItem('user');
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: false, 
        user: null, 
        error: action.payload 
      };
    case 'LOGOUT':
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null, 
        loading: false,
        error: null 
      };
    case 'UPDATE_USER':
      return { 
        ...state, 
        user: { ...state.user, ...action.payload } 
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const isLoggingOut = useRef(false);

  // Helper function to register Firebase user with backend
  const registerFirebaseUserWithBackend = async (firebaseUser) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/auth/firebase-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Firebase User',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.token) {
        // Store the JWT token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          ...data.user,
          authProvider: 'firebase',
          firebaseUid: firebaseUser.uid
        }));
        
        return {
          success: true,
          user: data.user,
          token: data.token,
          isNewUser: data.isNewUser
        };
      }
      
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Failed to register Firebase user with backend:', error);
      return { success: false, message: error.message };
    }
  };

  // Keep alive mechanism - refresh user data periodically without forcing logout
  useEffect(() => {
    if (state.isAuthenticated) {
      const keepAlive = setInterval(async () => {
        try {
          const response = await authService.getProfile();
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            dispatch({ 
              type: 'UPDATE_USER', 
              payload: response.user 
            });
          }
        } catch (error) {
          console.log('Keep alive failed, but not logging out:', error.message);
          // Don't logout on keep alive failure - user can continue working
        }
      }, 5 * 60 * 1000); // Every 5 minutes

      return () => clearInterval(keepAlive);
    }
  }, [state.isAuthenticated]);

  // Check for existing token on mount and monitor Firebase auth state
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication...');
      
      // Skip authentication check if we're in the middle of a logout
      if (isLoggingOut.current) {
        console.log('⏸️ Skipping auth check during logout process');
        return;
      }
      
      const token = getToken();
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Try to use stored user data first
          const user = JSON.parse(storedUser);
          console.log('✅ Using stored user data:', user.name);
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { user } 
          });
          
          // Optionally verify in background (logout on 401/403 errors)
          authService.getProfile().then(response => {
            console.log('🔄 Background profile verification successful');
            if (response.user) {
              localStorage.setItem('user', JSON.stringify(response.user));
              dispatch({ 
                type: 'UPDATE_USER', 
                payload: response.user 
              });
            }
          }).catch(error => {
            console.log('⚠️ Background verification failed:', error.message);
            // If the error suggests invalid token, logout the user
            if (error.message.includes('Invalid token') || 
                error.message.includes('Unauthorized') ||
                error.message.includes('401') ||
                error.message.includes('403')) {
              console.log('🚪 Logging out due to invalid authentication');
              authService.logout();
              dispatch({ type: 'LOGOUT' });
            }
          });
          
        } catch (parseError) {
          console.log('❌ Failed to parse stored user data, trying profile fetch');
          // Fallback to profile fetch
          try {
            const response = await authService.getProfile();
            dispatch({ 
              type: 'LOGIN_SUCCESS', 
              payload: { user: response.user } 
            });
          } catch (error) {
            console.log('❌ Profile fetch failed, logging out');
            authService.logout();
            dispatch({ type: 'LOGOUT' });
          }
        }
      } else if (token) {
        // Have token but no stored user data
        try {
          const response = await authService.getProfile();
          console.log('✅ Profile fetched successfully:', response.user?.name);
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { user: response.user } 
          });
        } catch (error) {
          console.log('❌ Profile fetch failed:', error.message);
          authService.logout();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        console.log('❌ No token found');
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuth();
    
    // Monitor Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Firebase auth state changed:', firebaseUser?.email || 'null');
      console.log('🔄 isLoggingOut flag:', isLoggingOut.current);
      console.log('📊 Current state.isAuthenticated:', state.isAuthenticated);
      
      // Skip processing if we're in the middle of a logout
      if (isLoggingOut.current) {
        console.log('⏸️ Skipping auth state change during logout process');
        return;
      }
      
      if (firebaseUser) {
        // Firebase user is signed in
        const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
        
        // Check if email is verified (skip for social logins as they're pre-verified)
        const isEmailPassword = firebaseUser.providerData.some(provider => provider.providerId === 'password');
        
        if (isEmailPassword && !firebaseUser.emailVerified) {
          console.log('❌ Firebase user email not verified');
          // Don't proceed with login until email is verified
          return;
        }
        
        // Check if user already exists in localStorage and context state
        const isCurrentlyAuthenticated = state.isAuthenticated;
        
        // Always register/update if user is not currently authenticated or if it's a different user
        if (!currentUser || !isCurrentlyAuthenticated || currentUser.authProvider !== 'firebase' || 
            (currentUser.id !== firebaseUser.uid && currentUser.firebaseUid !== firebaseUser.uid)) {
          console.log('✅ Registering/updating Firebase user with backend...');
          
          const result = await registerFirebaseUserWithBackend(firebaseUser);
          
          if (result.success) {
            console.log('✅ Firebase user registered with backend');
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { 
                user: {
                  ...result.user,
                  authProvider: 'firebase',
                  firebaseUid: firebaseUser.uid,
                  emailVerified: firebaseUser.emailVerified
                }
              }
            });
          } else {
            console.error('❌ Failed to register Firebase user:', result.message);
            // Still set Firebase user info even if backend registration fails
            dispatch({
              type: 'FIREBASE_LOGIN_SUCCESS',
              payload: firebaseUser
            });
          }
        } else {
          // User already exists and is authenticated, just ensure state is current
          console.log('✅ Firebase user already authenticated, refreshing state');
          console.log('Current user in localStorage:', currentUser);
          console.log('Current isAuthenticated state:', isCurrentlyAuthenticated);
          console.log('Firebase user UID:', firebaseUser.uid);
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { 
              user: {
                ...currentUser,
                emailVerified: firebaseUser.emailVerified
              }
            }
          });
        }
      } else {
        // Firebase user is signed out
        const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
        
        // Only logout if the current user is a Firebase user
        if (currentUser && currentUser.authProvider === 'firebase') {
          console.log('🚪 Firebase user signed out, logging out from context');
          dispatch({ type: 'LOGOUT' });
        }
      }
    });

    // Cleanup function
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount to prevent authentication loops

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login({ email, password });
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: response.user } 
      });
      return response;
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error.message 
      });
      throw error;
    }
  };

  const register = async (name, email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.register({ name, email, password });
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: response.user } 
      });
      return response;
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error.message 
      });
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 Starting logout process...');
    isLoggingOut.current = true;
    
    // Check if current user is a Firebase user
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    
    try {
      // Clear all localStorage data first to prevent re-authentication
      console.log('🗑️ Clearing localStorage...');
      authService.logout(); // This removes the token
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // If user is Firebase user, logout from Firebase
      if (currentUser && currentUser.authProvider === 'firebase') {
        console.log('🔥 Signing out Firebase user...');
        const { signOut, setPersistence, browserSessionPersistence } = await import('firebase/auth');
        
        // Set persistence to session only and then sign out
        await setPersistence(auth, browserSessionPersistence);
        await signOut(auth);
        console.log('✅ Firebase user signed out successfully');
      }
      
      // Dispatch logout action
      console.log('📤 Dispatching logout action...');
      dispatch({ type: 'LOGOUT' });
      
      console.log('✅ Logout completed successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if Firebase logout fails, clear local state
      authService.logout();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    } finally {
      // Reset the logout flag after a longer delay to prevent immediate re-authentication
      setTimeout(() => {
        console.log('🔄 Resetting logout flag...');
        isLoggingOut.current = false;
      }, 5000); // Increased from 1 second to 5 seconds
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
