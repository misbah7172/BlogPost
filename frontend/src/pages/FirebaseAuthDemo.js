import React, { useState } from 'react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import FirebaseLogin from '../components/FirebaseLogin';
import Layout from '../components/Layout';
import { LogOut, User, Mail, Calendar, Shield } from 'lucide-react';

const FirebaseAuthDemo = () => {
  const { firebaseUser, signOut, isFirebaseLoading } = useFirebaseAuth();
  const [authMode, setAuthMode] = useState('login');

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      console.log('Signed out successfully');
    }
  };

  const handleAuthSuccess = (user) => {
    console.log('Firebase Auth Success:', user);
    // You can integrate this with your existing auth system here
    // For example, create a user in your backend database if it doesn't exist
  };

  if (isFirebaseLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-lg">Loading Firebase Auth...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Firebase Authentication Demo</h1>
          
          {firebaseUser ? (
            // User is signed in
            <div className="max-w-2xl mx-auto">
              <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000000] mb-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-green-600">
                  <Shield className="inline w-6 h-6 mr-2" />
                  Authenticated Successfully!
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 border-2 border-gray-300">
                    <User className="w-5 h-5 mr-3 text-gray-600" />
                    <div>
                      <label className="text-sm font-bold text-gray-600">Display Name:</label>
                      <p className="text-lg">{firebaseUser.displayName || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 border-2 border-gray-300">
                    <Mail className="w-5 h-5 mr-3 text-gray-600" />
                    <div>
                      <label className="text-sm font-bold text-gray-600">Email:</label>
                      <p className="text-lg">{firebaseUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 border-2 border-gray-300">
                    <Calendar className="w-5 h-5 mr-3 text-gray-600" />
                    <div>
                      <label className="text-sm font-bold text-gray-600">Created:</label>
                      <p className="text-lg">
                        {new Date(firebaseUser.metadata.creationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 border-2 border-gray-300">
                    <Shield className="w-5 h-5 mr-3 text-gray-600" />
                    <div>
                      <label className="text-sm font-bold text-gray-600">Email Verified:</label>
                      <p className={`text-lg ${firebaseUser.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {firebaseUser.emailVerified ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 border-2 border-gray-300">
                    <User className="w-5 h-5 mr-3 text-gray-600" />
                    <div>
                      <label className="text-sm font-bold text-gray-600">User ID:</label>
                      <p className="text-sm font-mono break-all">{firebaseUser.uid}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <button
                    onClick={handleSignOut}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all"
                  >
                    <LogOut className="inline w-5 h-5 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 border-2 border-blue-300 text-center">
                <h3 className="text-lg font-bold mb-2">Integration Notes</h3>
                <p className="text-sm text-gray-700">
                  This Firebase user can now be integrated with your existing auth system. 
                  You can sync this user data with your backend database and use Firebase tokens 
                  for authentication in your API calls.
                </p>
              </div>
            </div>
          ) : (
            // User is not signed in
            <div>
              <div className="text-center mb-8">
                <p className="text-lg text-gray-600 mb-4">
                  Sign in or create an account using Firebase Authentication
                </p>
                <div className="bg-yellow-50 p-4 border-2 border-yellow-300 max-w-2xl mx-auto">
                  <p className="text-sm text-gray-700">
                    <strong>Features:</strong> Email/Password, Google Sign-in, Facebook Sign-in, 
                    Password Reset, and User Profile Management
                  </p>
                </div>
              </div>
              
              <FirebaseLogin
                mode={authMode}
                onModeChange={setAuthMode}
                onSuccess={handleAuthSuccess}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FirebaseAuthDemo;
