import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import emailValidator from 'email-validator';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    // Check if all fields are filled
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return false;
    }

    // Validate name (at least 2 characters)
    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return false;
    }

    // Email validation with stricter checking
    if (!emailValidator.validate(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Check for obviously fake domains
    const invalidDomains = ['test.com', 'example.com', 'invalid.com', 'fake.com', 'mail.com'];
    const domain = formData.email.split('@')[1]?.toLowerCase();
    if (invalidDomains.includes(domain)) {
      toast.error('Please use a real email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!validateForm()) {
        return;
      }

      // Use Firebase for email/password registration
      const result = await firebaseAuthService.signUpWithEmail(
        formData.email, 
        formData.password, 
        formData.name
      );
      
      if (result.success) {
        if (result.requiresEmailVerification) {
          toast.success('Account created! Please check your email and verify your account before signing in.', {
            duration: 6000
          });
          // Stay on registration page with verification message
          setIsLoading(false);
          return;
        } else {
          toast.success('Registration successful! Welcome to Blog360!');
          // Firebase AuthContext will handle the navigation
        }
      } else {
        toast.error(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Google Sign Up
  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await firebaseAuthService.signInWithGoogle();
      if (result.success) {
        toast.success('Signed up with Google successfully!');
        // Don't navigate immediately - AuthContext will handle the state update
      } else {
        console.error('Google sign-up error:', result);
        toast.error(result.message || 'Google sign up failed. Please try again.');
      }
    } catch (error) {
      console.error('Google sign-up exception:', error);
      toast.error('Google sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Facebook Sign Up
  const handleFacebookSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await firebaseAuthService.signInWithFacebook();
      if (result.success) {
        toast.success('Signed up with Facebook successfully!');
        // Don't navigate - let AuthContext handle state update
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Facebook sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Email Sign Up
  const handleFirebaseEmailSignUp = async () => {
    setIsLoading(true);
    try {
      if (!validateForm()) {
        return;
      }

      const result = await firebaseAuthService.signUpWithEmail(
        formData.email, 
        formData.password, 
        formData.name
      );
      
      if (result.success) {
        toast.success('Firebase registration successful!');
        // Don't navigate - let AuthContext handle state update
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Firebase registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-accent-500 text-white p-4 border-2 border-black dark:border-dark-border">
              <UserPlus className="h-8 w-8" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-black dark:text-white text-shadow">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Join our community and get access to premium content
          </p>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6 brutal-card p-8" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black dark:text-white mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="brutal-input pl-10 pr-3 py-3"
                  placeholder="Full Name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black dark:text-white mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="brutal-input pl-10 pr-3 py-3"
                  placeholder="Email address"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black dark:text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="brutal-input pl-10 pr-10 py-3"
                  placeholder="Password (min 6 characters)"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black dark:text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="brutal-input pl-10 pr-10 py-3"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-2 border-black"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm font-medium">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-500 hover:text-primary-600 font-bold">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-500 hover:text-primary-600 font-bold">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="brutal-button-primary w-full flex justify-center items-center py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account (Traditional)
                </div>
              )}
            </button>
          </div>

          {/* OR Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-cream dark:bg-dark-bg text-gray-500">Or continue with Firebase</span>
            </div>
          </div>

          {/* Firebase Auth Options */}
          <div className="space-y-3">
            {/* Firebase Email Registration */}
            <button
              type="button"
              onClick={handleFirebaseEmailSignUp}
              disabled={isLoading}
              className="brutal-button-secondary w-full flex justify-center items-center py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Creating Firebase account...
                </div>
              ) : (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Create Account with Firebase
                </div>
              )}
            </button>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="brutal-button w-full flex justify-center items-center py-3 px-4 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Signing up with Google...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </div>
              )}
            </button>

            {/* Facebook Sign Up */}
            <button
              type="button"
              onClick={handleFacebookSignUp}
              disabled={isLoading}
              className="brutal-button w-full flex justify-center items-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Signing up with Facebook...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Sign up with Facebook
                </div>
              )}
            </button>
          </div>

          {/* Sign in link */}
          <div className="text-center">
            <p className="text-sm opacity-80">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-primary-500 hover:text-primary-600"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
