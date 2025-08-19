// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCErdb0E9rE-dCNjd1kFoTMJ7Xx3TIcTK4",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "blogpost7172.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "blogpost7172",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "blogpost7172.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "766939928918",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:766939928918:web:d10bebf86b9852bc7c9ef7",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-E7YM55F67H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics (optional)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Auth providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Optional: Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { analytics };
export default app;
