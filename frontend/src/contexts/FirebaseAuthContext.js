import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseAuthService } from '../services/firebaseAuthService';

const FirebaseAuthContext = createContext();

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      setIsFirebaseLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email, password) => {
    setIsFirebaseLoading(true);
    const result = await firebaseAuthService.signInWithEmail(email, password);
    setIsFirebaseLoading(false);
    return result;
  };

  const signUpWithEmail = async (email, password, displayName) => {
    setIsFirebaseLoading(true);
    const result = await firebaseAuthService.signUpWithEmail(email, password, displayName);
    setIsFirebaseLoading(false);
    return result;
  };

  const signInWithGoogle = async () => {
    setIsFirebaseLoading(true);
    const result = await firebaseAuthService.signInWithGoogle();
    setIsFirebaseLoading(false);
    return result;
  };

  const signInWithFacebook = async () => {
    setIsFirebaseLoading(true);
    const result = await firebaseAuthService.signInWithFacebook();
    setIsFirebaseLoading(false);
    return result;
  };

  const signOut = async () => {
    setIsFirebaseLoading(true);
    const result = await firebaseAuthService.signOut();
    setIsFirebaseLoading(false);
    return result;
  };

  const resetPassword = async (email) => {
    return await firebaseAuthService.resetPassword(email);
  };

  const value = {
    firebaseUser,
    isFirebaseLoading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    resetPassword
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export default FirebaseAuthContext;
