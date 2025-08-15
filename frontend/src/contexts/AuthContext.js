import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { getToken } from '../services/api';

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

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication...');
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
          
          // Optionally verify in background (don't logout on failure)
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
            console.log('⚠️ Background verification failed, but keeping user logged in');
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
  }, []);

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

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
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
