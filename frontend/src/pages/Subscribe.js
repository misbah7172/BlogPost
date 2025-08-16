import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Smartphone, Copy, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionService } from '../services/transactionService';

const Subscribe = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const lifetimePlan = {
    id: 'lifetime',
    name: 'Lifetime Access',
    price: 30,
    duration: 'Forever',
    features: [
      'Unlimited access to all premium content',
      'Ad-free reading experience',
      'Download articles for offline reading',
      'Priority customer support',
      'Access to all future content',
      'No monthly charges ever',
      'Exclusive member community access',
      'Early access to new features'
    ]
  };

  const bkashNumber = '+8801824032222';

  const copyBkashNumber = () => {
    navigator.clipboard.writeText(bkashNumber);
    toast.success('bKash number copied to clipboard');
  };

  const handleSubscribeClick = () => {
    setShowPaymentForm(true);
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    
    // Check authentication first
    if (!isAuthenticated) {
      toast.error('Please login to submit a transaction');
      navigate('/login');
      return;
    }
    
    if (!transactionId.trim()) {
      toast.error('Please enter the transaction ID');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await transactionService.submitTransaction({
        trxId: transactionId,
        amount: lifetimePlan.price,
        planType: 'lifetime'
      });

      toast.success('Transaction submitted successfully! We will verify and activate your lifetime subscription within 24 hours.');
      setTransactionId('');
      setShowPaymentForm(false);
      
      // Navigate to dashboard or home
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Transaction submission error:', error);
      // Show more specific error message if available
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || 'Failed to submit transaction');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-4 rounded-2xl">
              <Crown className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Unlock Premium Content
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get unlimited access to our exclusive educational content, programming tutorials, and expert insights
          </p>
        </div>

        {!showPaymentForm ? (
          /* Lifetime Plan */
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-center py-2 text-sm font-medium">
                ⭐ Lifetime Access - Best Value
              </div>
              
              <div className="p-8 pt-16">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {lifetimePlan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      ৳{lifetimePlan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 block text-lg mt-2">
                      One-time payment • {lifetimePlan.duration}
                    </span>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      🎉 Special Launch Offer - Pay once, access forever!
                    </p>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {lifetimePlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleSubscribeClick}
                  className="w-full py-4 px-6 rounded-xl font-medium text-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700 transition-colors"
                >
                  Get Lifetime Access - ৳{lifetimePlan.price}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Complete Your Payment
                </h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    Selected Plan: {lifetimePlan.name} - ৳{lifetimePlan.price}
                  </p>
                </div>
              </div>

              {/* bKash Payment Instructions */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  bKash Payment Instructions
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Step 1: Send Money</h4>
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border">
                      <span className="font-mono text-lg">{bkashNumber}</span>
                      <button
                        onClick={copyBkashNumber}
                        className="flex items-center text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Send exactly ৳{lifetimePlan.price} to this bKash number
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Step 2: Note Transaction ID</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      After sending money, you'll receive an SMS with a transaction ID. Copy this ID and paste it below.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Step 3: Submit Transaction ID</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enter your transaction ID below and submit. We'll verify and activate your subscription within 24 hours.
                    </p>
                  </div>
                </div>
              </div>

              {/* bKash QR Code Section */}
              <div className="mb-8 text-center">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Or scan this QR code with bKash app:
                </h4>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 inline-block">
                  <img 
                    src="/images/bkash-qr.svg" 
                    alt="bKash QR Code" 
                    className="w-48 h-48 rounded-lg"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Amount: ৳{lifetimePlan.price}
                </p>
              </div>

              {/* Transaction ID Form */}
              <form onSubmit={handleSubmitTransaction} className="space-y-6">
                <div>
                  <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter your bKash transaction ID"
                    required
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Example: 8A5B9C2D3E (You'll receive this in SMS after payment)
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Back to Plans
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Transaction'
                    )}
                  </button>
                </div>
              </form>

              {/* Processing Time Notice */}
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Processing Time
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your subscription will be activated within 24 hours after verification. 
                      You'll receive an email confirmation once activated.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                How long does it take to activate my subscription?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We manually verify all transactions within 24 hours. You'll receive an email confirmation once your subscription is activated.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What if I enter the wrong transaction ID?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Contact our support team immediately. We can help you correct the transaction ID before verification.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I cancel my subscription?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can cancel anytime from your dashboard. Your access will continue until the end of your billing period.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is my payment secure?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, we use bKash's secure payment system. We only store transaction IDs for verification purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
