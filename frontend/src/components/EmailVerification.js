import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { firebaseAuthService } from '../services/firebaseAuthService';
import toast from 'react-hot-toast';

const EmailVerification = ({ user, onVerified }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Check verification status periodically
  useEffect(() => {
    const checkVerification = async () => {
      if (user?.emailVerified) {
        onVerified();
        return;
      }

      // Reload user to get latest verification status
      try {
        await user?.reload();
        if (user?.emailVerified) {
          toast.success('Email verified successfully!');
          onVerified();
        }
      } catch (error) {
        console.error('Error checking verification:', error);
      }
    };

    const interval = setInterval(checkVerification, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [user, onVerified]);

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      const result = await firebaseAuthService.sendEmailVerification(user);
      if (result.success) {
        toast.success('Verification email sent! Please check your inbox.');
      } else {
        toast.error(result.message || 'Failed to send verification email');
      }
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    try {
      await user?.reload();
      if (user?.emailVerified) {
        toast.success('Email verified successfully!');
        onVerified();
      } else {
        toast.error('Email not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (error) {
      toast.error('Error checking verification status');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-500 text-white p-4 border-2 border-black dark:border-dark-border">
              <Mail className="h-8 w-8" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-black dark:text-white text-shadow">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            We've sent a verification link to <strong>{user?.email}</strong>
          </p>
        </div>

        {/* Verification Status */}
        <div className="brutal-card p-8">
          <div className="space-y-6">
            {/* Instructions */}
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="mb-2">Please check your email and click the verification link to continue.</p>
                <p>Don't forget to check your spam folder if you don't see the email.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={handleCheckVerification}
                disabled={isChecking}
                className="w-full brutal-button-primary flex items-center justify-center space-x-2"
              >
                {isChecking ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>{isChecking ? 'Checking...' : 'I\'ve Verified My Email'}</span>
              </button>

              <button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="w-full brutal-button flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Sending...' : 'Resend Verification Email'}</span>
              </button>
            </div>

            {/* Help text */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This page will automatically redirect once your email is verified
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
