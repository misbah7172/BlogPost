import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../services/transactionService';
import { blogService } from '../services/blogService';
import { 
  Users, 
  CreditCard, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Settings,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    pendingTransactions: 0,
    totalBlogs: 0,
    premiumBlogs: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Transaction ID form state
  const [newTransactionId, setNewTransactionId] = useState('');
  const [addingTransaction, setAddingTransaction] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [transactionsRes, usersRes, blogsRes, statsRes] = await Promise.all([
        transactionService.getAllTransactions(),
        transactionService.getAllUsers(),
        blogService.getAllBlogs(),
        transactionService.getAdminStats()
      ]);

      setTransactions(transactionsRes.transactions || []);
      setUsers(usersRes.users || []);
      setBlogs(blogsRes.blogs || []);
      
      // Map backend response to frontend stats structure
      if (statsRes) {
        const mappedStats = {
          totalUsers: statsRes.users?.total_users || 0,
          activeSubscriptions: statsRes.users?.active_subscribers || 0,
          totalRevenue: statsRes.transactions?.total_revenue || 0,
          pendingTransactions: statsRes.transactions?.pending_transactions || 0,
          totalBlogs: statsRes.blogs?.total_blogs || 0,
          premiumBlogs: statsRes.blogs?.premium_blogs || 0
        };
        setStats(mappedStats);
      }
    } catch (error) {
      toast.error('Failed to load admin data');
      console.error('Admin dashboard error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchAdminData();
    }
  }, [isAuthenticated, user, fetchAdminData]);

  const handleTransactionAction = async (transactionId, action) => {
    try {
      await transactionService.updateTransactionStatus(transactionId, action);
      toast.success(`Transaction ${action} successfully`);
      fetchAdminData(); // Refresh data
    } catch (error) {
      toast.error(`Failed to ${action} transaction`);
      console.error('Transaction action error:', error);
    }
  };

  const handleAddTransactionId = async (e) => {
    e.preventDefault();
    if (!newTransactionId.trim()) {
      toast.error('Please enter a transaction ID');
      return;
    }

    setAddingTransaction(true);
    try {
      // Approve the transaction directly using the existing approve endpoint
      await transactionService.approveTransaction(newTransactionId.trim());
      toast.success('Transaction ID approved and user subscription activated');
      setNewTransactionId('');
      fetchAdminData(); // Refresh data
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Transaction ID not found in pending transactions');
      } else {
        toast.error('Failed to approve transaction ID');
      }
      console.error('Add transaction ID error:', error);
    } finally {
      setAddingTransaction(false);
    }
  };

  const handleCreateBlog = () => {
    // Navigate to blog creation page
    navigate('/create-blog');
  };

  const handleViewBlog = (blogId) => {
    // Navigate to view blog page
    navigate(`/blog/${blogId}`);
  };

  const handleEditBlog = (blogId) => {
    // Navigate to edit blog page
    navigate(`/edit-blog/${blogId}`);
  };

  const handleDeleteBlog = async (blogId, blogTitle) => {
    if (window.confirm(`Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`)) {
      try {
        await blogService.deleteBlog(blogId);
        toast.success('Blog deleted successfully');
        fetchAdminData(); // Refresh data
      } catch (error) {
        toast.error('Failed to delete blog');
        console.error('Delete blog error:', error);
      }
    }
  };

  const getTransactionStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-accent-500 text-white border-2 border-black dark:border-dark-border', label: 'Pending' },
      approved: { color: 'bg-green-500 text-white border-2 border-black dark:border-dark-border', label: 'Approved' },
      rejected: { color: 'bg-red-500 text-white border-2 border-black dark:border-dark-border', label: 'Rejected' }
    };
    
    return statusConfig[status] || statusConfig.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `৳${Number(amount).toLocaleString()}`;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.trx_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Check if user is admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cream dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center brutal-card p-8">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            You need admin privileges to access this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2 border-b-4 border-black dark:border-dark-border pb-2">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            Manage users, transactions, and content across the platform.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
          {/* Total Users */}
          <div className="brutal-card admin-stat-card p-4 sm:p-6">
            <div className="flex items-center stat-content">
              <div className="p-2 sm:p-3 border-2 border-black dark:border-dark-border bg-primary-500 stat-icon">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Users
                </p>
                <p className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="brutal-card admin-stat-card p-4 sm:p-6">
            <div className="flex items-center stat-content">
              <div className="p-2 sm:p-3 border-2 border-black dark:border-dark-border bg-green-500 stat-icon">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Subs
                </p>
                <p className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                  {stats.activeSubscriptions}
                </p>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="brutal-card admin-stat-card p-4 sm:p-6">
            <div className="flex items-center stat-content">
              <div className="p-2 sm:p-3 border-2 border-black dark:border-dark-border bg-accent-500 stat-icon">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Revenue
                </p>
                <p className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Transactions */}
          <div className="brutal-card admin-stat-card p-4 sm:p-6">
            <div className="flex items-center stat-content">
              <div className="p-2 sm:p-3 border-2 border-black dark:border-dark-border bg-orange-500 stat-icon">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pending
                </p>
                <p className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                  {stats.pendingTransactions}
                </p>
              </div>
            </div>
          </div>

          {/* Total Blogs */}
          <div className="brutal-card admin-stat-card p-4 sm:p-6">
            <div className="flex items-center stat-content">
              <div className="p-2 sm:p-3 border-2 border-black dark:border-dark-border bg-purple-500 stat-icon">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Blogs
                </p>
                <p className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                  {stats.totalBlogs}
                </p>
              </div>
            </div>
          </div>

          {/* Premium Blogs */}
          <div className="brutal-card admin-stat-card p-4 sm:p-6">
            <div className="flex items-center stat-content">
              <div className="p-2 sm:p-3 border-2 border-black dark:border-dark-border bg-indigo-500 stat-icon">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Premium
                </p>
                <p className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                  {stats.premiumBlogs}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex overflow-x-auto scrollbar-hide space-x-2 pb-2 admin-tabs">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'transactions', label: 'Transactions', icon: CreditCard },
              { id: 'add-transaction', label: 'Add Transaction ID', icon: Plus },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'blogs', label: 'Blogs', icon: BookOpen },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 sm:px-4 py-2 sm:py-3 font-medium border-2 border-black dark:border-dark-border transition-colors whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.label === 'Add Transaction ID' ? 'Add ID' : 
                   tab.label === 'Transactions' ? 'Trans' : 
                   tab.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Transactions */}
            <div className="brutal-card p-6">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4 border-b-2 border-black dark:border-dark-border pb-2">
                Recent Transactions
              </h3>
              {transactions.slice(0, 5).map((transaction) => {
                const statusBadge = getTransactionStatusBadge(transaction.status);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.trx_id}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.user_email} • {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                      {transaction.status === 'pending' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleTransactionAction(transaction.id, 'approved')}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleTransactionAction(transaction.id, 'rejected')}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="brutal-card p-6">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4 border-b-2 border-black dark:border-dark-border pb-2">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="flex items-center p-4 border-2 border-black dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <CreditCard className="h-8 w-8 text-primary-500 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-black dark:text-white">Review Transactions</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{stats.pendingTransactions} pending</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Users className="h-8 w-8 text-green-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Manage Users</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stats.totalUsers} total users</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('blogs')}
                  className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <BookOpen className="h-8 w-8 text-purple-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Content Management</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stats.totalBlogs} total blogs</p>
                  </div>
                </button>

                <button className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Download className="h-8 w-8 text-gray-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Download reports</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="brutal-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-black dark:text-white border-b-2 border-black dark:border-dark-border pb-2">
                Transaction Management
              </h3>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 brutal-input"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="brutal-select"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-hide">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTransactions.map((transaction) => {
                      const statusBadge = getTransactionStatusBadge(transaction.status);
                      return (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.trx_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {transaction.user_email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {transaction.plan_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {formatDate(transaction.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {transaction.status === 'pending' ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleTransactionAction(transaction.id, 'approved')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleTransactionAction(transaction.id, 'rejected')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <XCircle className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-transaction' && (
          <div className="brutal-card p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black dark:text-white border-b-2 border-black dark:border-dark-border pb-2 mb-4">
                Approve Transaction ID
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Enter the transaction ID you received from bKash to approve and activate a user's lifetime subscription.
              </p>
            </div>

            <form onSubmit={handleAddTransactionId} className="max-w-md">
              <div className="mb-4">
                <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction ID *
                </label>
                <input
                  type="text"
                  id="transactionId"
                  value={newTransactionId}
                  onChange={(e) => setNewTransactionId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black dark:border-dark-border bg-white dark:bg-gray-800 text-black dark:text-white rounded-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter bKash transaction ID"
                  required
                  disabled={addingTransaction}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Example: 8A5B9C2D3E (10 character alphanumeric code)
                </p>
              </div>

              <button
                type="submit"
                disabled={addingTransaction || !newTransactionId.trim()}
                className="brutal-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingTransaction ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Approving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Transaction
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Important Notes:
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 list-disc list-inside">
                    <li>Only approve transaction IDs that you have verified in your bKash merchant account</li>
                    <li>Each transaction ID can only be used once</li>
                    <li>This will immediately activate the user's lifetime subscription</li>
                    <li>Make sure the payment amount matches ৳30 for lifetime subscription</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="brutal-card p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-6 border-b-2 border-black dark:border-dark-border pb-2">
              User Management
            </h3>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-hide">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Subscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((userData) => (
                      <tr key={userData.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {userData.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {userData.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {userData.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userData.subscription_status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {userData.subscription_status || 'Free'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {formatDate(userData.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-5 w-5" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="brutal-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-black dark:text-white border-b-2 border-black dark:border-dark-border pb-2">
                Content Management
              </h3>
              <button 
                onClick={handleCreateBlog}
                className="brutal-button-primary"
              >
                Create New Blog
              </button>
            </div>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 border-2 border-black dark:border-dark-border"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <div key={blog.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {blog.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-xs text-gray-500">
                          {formatDate(blog.created_at)}
                        </span>
                        {blog.is_premium && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Premium
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          Category: {blog.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewBlog(blog.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Blog"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleEditBlog(blog.id)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit Blog"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBlog(blog.id, blog.title)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Blog"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="brutal-card p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-6 border-b-2 border-black dark:border-dark-border pb-2">
              System Settings
            </h3>
            
            <div className="space-y-6">
              {/* Payment Settings */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Payment Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      bKash Number
                    </label>
                    <input
                      type="text"
                      value="+8801824032222"
                      readOnly
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Monthly Subscription Price
                    </label>
                    <input
                      type="text"
                      value="৳30"
                      readOnly
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Auto Approval Settings */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Transaction Settings
                </h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoApproval"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoApproval" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Enable automatic transaction approval
                  </label>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Automatically approve transactions after verification
                </p>
              </div>

              {/* System Stats */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  System Information
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Platform Version:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">1.0.0</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Last Backup:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">Today</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Active Sessions:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{stats.totalUsers}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Storage Used:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">2.4 GB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
