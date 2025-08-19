import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  deleteUser
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from '../config/firebase';
import emailValidator from 'email-validator';

export const firebaseAuthService = {
  // Sign in with email and password
  signInWithEmail: async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: result.user,
        message: 'Signed in successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: getFirebaseErrorMessage(error.code)
      };
    }
  },

  // Sign up with email and password
  signUpWithEmail: async (email, password, displayName) => {
    try {
      // First validate email format more strictly
      if (!emailValidator.validate(email)) {
        return {
          success: false,
          error: 'invalid-email',
          message: 'Please enter a valid email address'
        };
      }

      // Check for common invalid domains
      const invalidDomains = ['test.com', 'example.com', 'invalid.com', 'fake.com'];
      const domain = email.split('@')[1]?.toLowerCase();
      if (invalidDomains.includes(domain)) {
        return {
          success: false,
          error: 'invalid-email',
          message: 'Please use a valid email address'
        };
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      if (displayName) {
        await updateProfile(result.user, {
          displayName: displayName
        });
      }

      // Try to send email verification
      try {
        await sendEmailVerification(result.user);
        
        return {
          success: true,
          user: result.user,
          message: 'Account created successfully! Please check your email to verify your account.',
          requiresEmailVerification: true
        };
      } catch (verificationError) {
        console.error('Failed to send verification email:', verificationError);
        
        // If verification email fails to send, delete the user account
        try {
          await deleteUser(result.user);
        } catch (deleteError) {
          console.error('Failed to delete user after verification failure:', deleteError);
        }
        
        return {
          success: false,
          error: 'verification-failed',
          message: 'Failed to send verification email. The email address may not exist. Please check your email and try again.'
        };
      }
      
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: getFirebaseErrorMessage(error.code)
      };
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return {
        success: true,
        user: result.user,
        message: 'Signed in with Google successfully'
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: error.code,
        message: getFirebaseErrorMessage(error.code),
        details: error.message
      };
    }
  },

  // Sign in with Facebook
  signInWithFacebook: async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return {
        success: true,
        user: result.user,
        message: 'Signed in with Facebook successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: getFirebaseErrorMessage(error.code)
      };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return {
        success: true,
        message: 'Signed out successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: 'Failed to sign out'
      };
    }
  },

  // Send email verification
  sendEmailVerification: async (user = null) => {
    try {
      const currentUser = user || auth.currentUser;
      if (!currentUser) {
        return {
          success: false,
          message: 'No user is currently signed in'
        };
      }

      await sendEmailVerification(currentUser);
      return {
        success: true,
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: getFirebaseErrorMessage(error.code)
      };
    }
  },

  // Check if user email is verified
  isEmailVerified: () => {
    return auth.currentUser?.emailVerified || false;
  },

  // Send password reset email
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: getFirebaseErrorMessage(error.code)
      };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
};

// Helper function to get user-friendly error messages
const getFirebaseErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completion.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by the browser. Please allow popups for this site.';
    case 'auth/cancelled-popup-request':
      return 'Only one popup request is allowed at one time.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for OAuth operations. Please add it to Firebase Console.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Please enable it in Firebase Console.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in credentials.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later.';
    default:
      console.error('Unhandled Firebase error code:', errorCode);
      return `Authentication error: ${errorCode}. Please try again or contact support.`;
  }
};

export default firebaseAuthService;
