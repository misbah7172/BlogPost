import React, { useState } from 'react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const FirebaseLogin = ({ mode = 'login', onModeChange, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    signInWithFacebook, 
    resetPassword 
  } = useFirebaseAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;

      if (mode === 'login') {
        result = await signInWithEmail(formData.email, formData.password);
      } else if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        result = await signUpWithEmail(formData.email, formData.password, formData.displayName);
      } else if (mode === 'reset') {
        result = await resetPassword(formData.email);
        if (result.success) {
          setError(''); // Clear any errors
          onModeChange('login');
          return;
        }
      }

      if (result.success) {
        onSuccess && onSuccess(result.user);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        onSuccess && onSuccess(result.user);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to sign in with Google');
    }

    setLoading(false);
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithFacebook();
      if (result.success) {
        onSuccess && onSuccess(result.user);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to sign in with Facebook');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000000]">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {mode === 'login' && 'Firebase Login'}
        {mode === 'register' && 'Create Firebase Account'}
        {mode === 'reset' && 'Reset Password'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-bold mb-2">
              <User className="inline w-4 h-4 mr-1" />
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              required={mode === 'register'}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-bold mb-2">
            <Mail className="inline w-4 h-4 mr-1" />
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>

        {mode !== 'reset' && (
          <div>
            <label className="block text-sm font-bold mb-2">
              <Lock className="inline w-4 h-4 mr-1" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div>
            <label className="block text-sm font-bold mb-2">
              <Lock className="inline w-4 h-4 mr-1" />
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all disabled:opacity-50"
        >
          {loading ? 'Loading...' : (
            mode === 'login' ? 'Sign In' : 
            mode === 'register' ? 'Create Account' : 
            'Send Reset Email'
          )}
        </button>
      </form>

      {mode !== 'reset' && (
        <>
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t-2 border-black"></div>
            <span className="mx-4 text-gray-500 font-bold">OR</span>
            <div className="flex-1 border-t-2 border-black"></div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all disabled:opacity-50"
            >
              Sign in with Google
            </button>

            <button
              onClick={handleFacebookSignIn}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all disabled:opacity-50"
            >
              Sign in with Facebook
            </button>
          </div>
        </>
      )}

      <div className="mt-6 text-center text-sm">
        {mode === 'login' && (
          <>
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => onModeChange('register')}
                className="text-blue-600 hover:underline font-bold"
              >
                Sign up
              </button>
            </p>
            <p className="mt-2">
              <button
                onClick={() => onModeChange('reset')}
                className="text-blue-600 hover:underline font-bold"
              >
                Forgot password?
              </button>
            </p>
          </>
        )}
        {mode === 'register' && (
          <p>
            Already have an account?{' '}
            <button
              onClick={() => onModeChange('login')}
              className="text-blue-600 hover:underline font-bold"
            >
              Sign in
            </button>
          </p>
        )}
        {mode === 'reset' && (
          <p>
            Remember your password?{' '}
            <button
              onClick={() => onModeChange('login')}
              className="text-blue-600 hover:underline font-bold"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default FirebaseLogin;
