import React, { useState } from 'react';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { auth, googleProvider } from '../config/firebase';
import toast from 'react-hot-toast';

const FirebaseTestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (test, status, message, details = null) => {
    setTestResults(prev => [...prev, { test, status, message, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runDiagnostics = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test 1: Check Firebase Auth initialization
    try {
      if (auth) {
        addTestResult('Firebase Auth', 'SUCCESS', 'Firebase Auth is initialized');
      } else {
        addTestResult('Firebase Auth', 'FAILED', 'Firebase Auth is not initialized');
      }
    } catch (error) {
      addTestResult('Firebase Auth', 'FAILED', 'Error checking Firebase Auth', error.message);
    }

    // Test 2: Check Google Provider
    try {
      if (googleProvider) {
        addTestResult('Google Provider', 'SUCCESS', 'Google Provider is configured');
      } else {
        addTestResult('Google Provider', 'FAILED', 'Google Provider is not configured');
      }
    } catch (error) {
      addTestResult('Google Provider', 'FAILED', 'Error checking Google Provider', error.message);
    }

    // Test 3: Check Firebase Config
    try {
      const config = auth.app.options;
      addTestResult('Firebase Config', 'SUCCESS', 'Firebase config loaded', {
        projectId: config.projectId,
        authDomain: config.authDomain,
        apiKey: config.apiKey ? 'Present' : 'Missing'
      });
    } catch (error) {
      addTestResult('Firebase Config', 'FAILED', 'Error checking Firebase config', error.message);
    }

    // Test 4: Try Google Sign-in
    try {
      addTestResult('Google Sign-in Test', 'RUNNING', 'Testing Google sign-in...');
      const result = await firebaseAuthService.signInWithGoogle();
      
      if (result.success) {
        addTestResult('Google Sign-in Test', 'SUCCESS', 'Google sign-in successful', {
          user: result.user.email,
          uid: result.user.uid
        });
        // Sign out immediately after test
        await firebaseAuthService.signOut();
        addTestResult('Sign Out', 'SUCCESS', 'Signed out after test');
      } else {
        addTestResult('Google Sign-in Test', 'FAILED', result.message, {
          errorCode: result.error,
          details: result.details
        });
      }
    } catch (error) {
      addTestResult('Google Sign-in Test', 'FAILED', 'Exception during Google sign-in', error.message);
    }

    setIsLoading(false);
  };

  const testBasicGoogleAuth = async () => {
    try {
      addTestResult('Basic Google Test', 'RUNNING', 'Testing basic Google popup...');
      
      // Import signInWithPopup directly for testing
      const { signInWithPopup } = await import('firebase/auth');
      const result = await signInWithPopup(auth, googleProvider);
      
      addTestResult('Basic Google Test', 'SUCCESS', 'Basic Google auth successful', {
        email: result.user.email,
        displayName: result.user.displayName
      });
      
      // Sign out
      await result.user.delete();
    } catch (error) {
      addTestResult('Basic Google Test', 'FAILED', `Error: ${error.code}`, error.message);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Firebase Authentication Diagnostics</h1>
        
        <div className="mb-8">
          <button
            onClick={runDiagnostics}
            disabled={isLoading}
            className="brutal-button-primary mr-4 px-6 py-3"
          >
            {isLoading ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
          </button>
          
          <button
            onClick={testBasicGoogleAuth}
            className="brutal-button-secondary px-6 py-3"
          >
            Test Basic Google Auth
          </button>
        </div>

        <div className="brutal-card p-6">
          <h2 className="text-xl font-bold mb-4">Test Results:</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500">No tests run yet. Click "Run Full Diagnostics" to start.</p>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className={`p-4 rounded border-2 ${
                  result.status === 'SUCCESS' ? 'border-green-500 bg-green-50' :
                  result.status === 'FAILED' ? 'border-red-500 bg-red-50' :
                  'border-yellow-500 bg-yellow-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {result.test} 
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${
                          result.status === 'SUCCESS' ? 'bg-green-500 text-white' :
                          result.status === 'FAILED' ? 'bg-red-500 text-white' :
                          'bg-yellow-500 text-white'
                        }`}>
                          {result.status}
                        </span>
                      </h3>
                      <p className="mt-1">{result.message}</p>
                      
                      {result.details && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <strong>Details:</strong>
                          <pre className="mt-1 whitespace-pre-wrap">
                            {typeof result.details === 'object' ? 
                              JSON.stringify(result.details, null, 2) : 
                              result.details
                            }
                          </pre>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 ml-4">{result.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 brutal-card p-6">
          <h2 className="text-xl font-bold mb-4">Common Solutions:</h2>
          <div className="space-y-4 text-sm">
            <div>
              <strong>1. Firebase Console - Enable Google Provider:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Firebase Console</a></li>
                <li>Select project "blogpost7172"</li>
                <li>Go to Authentication → Sign-in method</li>
                <li>Enable Google provider</li>
              </ul>
            </div>
            
            <div>
              <strong>2. Authorized Domains:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>In Firebase Console → Authentication → Settings</li>
                <li>Add "localhost" to authorized domains</li>
                <li>Add your production domain when deploying</li>
              </ul>
            </div>
            
            <div>
              <strong>3. Browser Issues:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Allow popups for localhost:3000</li>
                <li>Clear browser cache and cookies</li>
                <li>Try incognito/private mode</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTestPage;
