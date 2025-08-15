import { apiRequest } from './api';

export const adminService = {
  // Dashboard stats
  getDashboardStats: async () => {
    return await apiRequest('/admin/dashboard/stats');
  },

  // Analytics
  getRevenueAnalytics: async (period = 'monthly') => {
    return await apiRequest(`/admin/analytics/revenue?period=${period}`);
  },

  // Recent activity
  getRecentActivity: async () => {
    return await apiRequest('/admin/activity/recent');
  },

  // User management
  getAllUsers: async (params = {}) => {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key]) {
        searchParams.append(key, params[key]);
      }
    });
    
    const queryString = searchParams.toString();
    return await apiRequest(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },

  updateUserSubscription: async (userId, subscriptionData) => {
    return await apiRequest(`/admin/users/${userId}/subscription`, {
      method: 'PUT',
      body: subscriptionData,
    });
  },

  // Transaction management
  bulkApproveTransactions: async (transactionIds) => {
    return await apiRequest('/admin/transactions/bulk-approve', {
      method: 'POST',
      body: { transactionIds },
    });
  },

  // Data export
  exportData: async (type, format = 'json') => {
    return await apiRequest(`/admin/export?type=${type}&format=${format}`);
  },
};
