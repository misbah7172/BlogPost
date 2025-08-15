import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { transactionService } from '../services/transactionService';
import { blogService } from '../services/blogService';
import { 
  User, 
  CreditCard, 
  BookOpen, 
  Bookmark, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Crown,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    premiumBlogs: 0,
    savedBlogs: 0,
    likesGiven: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, savedBlogsRes] = await Promise.all([
        transactionService.getUserTransactions(),
        blogService.getSavedBlogs()
      ]);

      setTransactions(transactionsRes.transactions || []);
      setSavedBlogs(savedBlogsRes.blogs || []);
      
      // Calculate stats
      setStats({
        totalBlogs: savedBlogsRes.totalCount || 0,
        premiumBlogs: savedBlogsRes.premiumCount || 0,
        savedBlogs: savedBlogsRes.blogs?.length || 0,
        likesGiven: savedBlogsRes.likesCount || 0
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!user) return null;
    
    switch (user.subscription_status) {
      case 'active':
        return {
          status: 'Active',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: CheckCircle,
          expires: user.subscription_expiry
        };
      case 'expired':
        return {
          status: 'Expired',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: XCircle,
          expires: user.subscription_expiry
        };
      default:
        return {
          status: 'Free',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: AlertCircle,
          expires: null
        };
    }
  };

  const getTransactionStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    
    return statusConfig[status] || statusConfig.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const subscriptionInfo = getSubscriptionStatus();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login to view your dashboard
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscription, view your activity, and explore premium content.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Subscription Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${subscriptionInfo.bgColor}`}>
                <subscriptionInfo.icon className={`h-6 w-6 ${subscriptionInfo.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Subscription
                </p>
                <p className={`text-xl font-bold ${subscriptionInfo.color}`}>
                  {subscriptionInfo.status}
                </p>
                {subscriptionInfo.expires && (
                  <p className="text-xs text-gray-500">
                    Expires: {formatDate(subscriptionInfo.expires)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Saved Blogs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Bookmark className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Saved Blogs
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.savedBlogs}
                </p>
              </div>
            </div>
          </div>

          {/* Premium Access */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Crown className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Premium Access
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.subscription_status === 'active' ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>

          {/* Total Blogs Read */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Blogs Read
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalBlogs}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'transactions', label: 'Transactions', icon: CreditCard },
              { id: 'saved', label: 'Saved Blogs', icon: Bookmark },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  to="/blogs"
                  className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Browse Blogs</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Explore our content</p>
                  </div>
                </Link>

                {user?.subscription_status !== 'active' && (
                  <Link
                    to="/subscribe"
                    className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Crown className="h-8 w-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Subscribe</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get premium access</p>
                    </div>
                  </Link>
                )}

                <Link
                  to="/dashboard?tab=settings"
                  className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="h-8 w-8 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Account Settings</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              {savedBlogs.length > 0 ? (
                <div className="space-y-4">
                  {savedBlogs.slice(0, 3).map((blog) => (
                    <div key={blog.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                      <div className="flex-1">
                        <Link
                          to={`/blog/${blog.id}`}
                          className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600"
                        >
                          {blog.title}
                        </Link>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Saved on {formatDate(blog.saved_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/dashboard?tab=saved"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    View all saved blogs →
                  </Link>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  No recent activity. Start by <Link to="/blogs" className="text-blue-600 hover:text-blue-500">browsing blogs</Link>!
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Transaction History
              </h3>
              <Link
                to="/subscribe"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                New Subscription
              </Link>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction) => {
                      const statusBadge = getTransactionStatusBadge(transaction.status);
                      return (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.trx_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {transaction.plan_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            ৳{transaction.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {formatDate(transaction.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No transactions yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Subscribe to premium to start your transaction history.
                </p>
                <Link
                  to="/subscribe"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Subscribe Now
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Saved Blogs
            </h3>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : savedBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedBlogs.map((blog) => (
                  <div key={blog.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        to={`/blog/${blog.id}`}
                        className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 line-clamp-2"
                      >
                        {blog.title}
                      </Link>
                      {blog.is_premium && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Saved on {formatDate(blog.saved_at)}</span>
                      <Link
                        to={`/blog/${blog.id}`}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Read →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No saved blogs yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start saving blogs you want to read later.
                </p>
                <Link
                  to="/blogs"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Blogs
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Account Settings
            </h3>
            
            <div className="space-y-6">
              {/* Profile Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Profile Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      readOnly
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Subscription Details
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Current Plan: {subscriptionInfo.status}
                      </p>
                      {subscriptionInfo.expires && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Expires on {formatDate(subscriptionInfo.expires)}
                        </p>
                      )}
                    </div>
                    {user?.subscription_status !== 'active' && (
                      <Link
                        to="/subscribe"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Upgrade
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div>
                <h4 className="text-md font-medium text-red-600 mb-4">
                  Danger Zone
                </h4>
                <div className="border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
