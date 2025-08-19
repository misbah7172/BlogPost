import React, { useState, useEffect } from 'react';
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
  
  const [loading, setLoading] = useState(true);
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
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTransactionId, setNewTransactionId] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, usersRes, blogsRes, statsRes] = await Promise.all([
        transactionService.getAllTransactions(),
        transactionService.getAllUsers(),
        blogService.getAllBlogs(),
        transactionService.getStats()
      ]);
      
      setTransactions(transactionsRes.transactions || []);
      setUsers(usersRes.users || []);
      setBlogs(blogsRes.blogs || []);
      
      const calculatedStats = {
        totalUsers: usersRes.users?.length || 0,
        activeSubscriptions: usersRes.users?.filter(u => u.subscription_status === 'active').length || 0,
        totalRevenue: transactionsRes.transactions?.filter(t => t.status === 'approved').reduce((sum, t) => sum + t.amount, 0) || 0,
        pendingTransactions: transactionsRes.transactions?.filter(t => t.status === 'pending').length || 0,
        totalBlogs: blogsRes.blogs?.length || 0,
        premiumBlogs: blogsRes.blogs?.filter(b => b.is_premium).length || 0
      };
      
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransaction = async (transactionId) => {
    try {
      await transactionService.updateTransactionStatus(transactionId, 'approved');
      toast.success('Transaction approved successfully');
      fetchData();
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast.error('Failed to approve transaction');
    }
  };

  const handleRejectTransaction = async (transactionId) => {
    try {
      await transactionService.updateTransactionStatus(transactionId, 'rejected');
      toast.success('Transaction rejected');
      fetchData();
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      toast.error('Failed to reject transaction');
    }
  };

  const handleAddTransactionId = async (e) => {
    e.preventDefault();
    if (!newTransactionId.trim()) {
      toast.error('Please enter a transaction ID');
      return;
    }

    try {
      await transactionService.addTransactionId(newTransactionId.trim());
      toast.success('Transaction ID added successfully');
      setNewTransactionId('');
      fetchData();
    } catch (error) {
      console.error('Error adding transaction ID:', error);
      toast.error('Failed to add transaction ID');
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      await blogService.deleteBlog(blogId);
      toast.success('Blog deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  const formatCurrency = (amount) => {
    return `৳${amount.toLocaleString()}`;
  };

  const getTransactionStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.trx_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
              <div className="p-2 sm:p-3 border-2 border-black dark:border-dark-border bg-blue-500 stat-icon">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Revenue
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
              <div className="p-2 sm:p-3 border-2 border-black dark:border-dark-border bg-yellow-500 stat-icon">
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
              <div className="p-2 sm:p-3 border-2 border-black dark:border-dark-border bg-orange-500 stat-icon">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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

        {/* Navigation Tabs */}
        <div className="mb-6">
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
                      {statusBadge}
                      <button
                        onClick={() => setActiveTab('transactions')}
                        className="brutal-button bg-primary-500 hover:bg-primary-600 text-white text-sm px-3 py-2"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Users */}
            <div className="brutal-card p-6">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4 border-b-2 border-black dark:border-dark-border pb-2">
                Recent Users
              </h3>
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.name || user.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email} • {user.subscription_status || 'free'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.subscription_status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.subscription_status || 'free'}
                    </span>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="brutal-button bg-primary-500 hover:bg-primary-600 text-white text-sm px-3 py-2"
                    >
                      View All
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Blogs */}
            <div className="brutal-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black dark:text-white border-b-2 border-black dark:border-dark-border pb-2">
                  Recent Blogs
                </h3>
                <button
                  onClick={() => navigate('/create-blog')}
                  className="brutal-button bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-2 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Blog
                </button>
              </div>
              {blogs.slice(0, 5).map((blog) => (
                <div key={blog.id} className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {blog.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      By {blog.author_name} • {new Date(blog.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {blog.is_premium && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Premium
                      </span>
                    )}
                    <button
                      onClick={() => setActiveTab('blogs')}
                      className="brutal-button bg-primary-500 hover:bg-primary-600 text-white text-sm px-3 py-2"
                    >
                      View All
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="brutal-card p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-lg font-semibold text-black dark:text-white border-b-2 border-black dark:border-dark-border pb-2">
                Transaction Management
              </h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="brutal-input pl-10 w-64"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border-2 border-black dark:border-dark-border">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-black dark:border-dark-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-black dark:border-dark-border">Transaction ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-black dark:border-dark-border">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-black dark:border-dark-border">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-black dark:border-dark-border">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-black dark:border-dark-border">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        {transaction.trx_id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        {transaction.user_email}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-700">
                        {getTransactionStatusBadge(transaction.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {transaction.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveTransaction(transaction.trx_id)}
                              className="brutal-button bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectTransaction(transaction.trx_id)}
                              className="brutal-button bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'add-transaction' && (
          <div className="brutal-card p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-6 border-b-2 border-black dark:border-dark-border pb-2">
              Add Transaction ID
            </h3>
            <form onSubmit={handleAddTransactionId} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={newTransactionId}
                  onChange={(e) => setNewTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="brutal-input w-full"
                  required
                />
              </div>
              <button
                type="submit"
                className="brutal-button-primary"
              >
                Add Transaction ID
              </button>
            </form>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="brutal-card p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-lg font-semibold text-black dark:text-white border-b-2 border-black dark:border-dark-border pb-2">
                User Management
              </h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="brutal-input pl-10 w-64"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border-2 border-black dark:border-dark-border">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-black dark:border-dark-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-black dark:border-dark-border">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-black dark:border-dark-border">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-black dark:border-dark-border">Subscription</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-black dark:border-dark-border">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        {user.name || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        {user.email}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-700">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.subscription_status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.subscription_status || 'free'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/user/${user.id}`)}
                          className="brutal-button bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="brutal-card p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-lg font-semibold text-black dark:text-white border-b-2 border-black dark:border-dark-border pb-2">
                Blog Management
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/create-blog')}
                  className="brutal-button-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Blog
                </button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="brutal-input pl-10 w-64"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border-2 border-black dark:border-dark-border">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-black dark:border-dark-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-black dark:border-dark-border">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-black dark:border-dark-border">Author</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-black dark:border-dark-border">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-black dark:border-dark-border">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBlogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        {blog.title}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        {blog.author_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-700">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          blog.is_premium 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {blog.is_premium ? 'Premium' : 'Free'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/blog/${blog.id}`)}
                            className="brutal-button bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1"
                            title="View Blog"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => navigate(`/edit-blog/${blog.id}`)}
                            className="brutal-button bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1"
                            title="Edit Blog"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id)}
                            className="brutal-button bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1"
                            title="Delete Blog"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
