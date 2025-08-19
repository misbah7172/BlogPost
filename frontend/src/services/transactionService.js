import { apiRequest } from './api';

export const transactionService = {
  // Get subscription plans and prices
  getPlans: async () => {
    return await apiRequest('/transactions/plans');
  },

  // Get payment information
  getPaymentInfo: async () => {
    return await apiRequest('/transactions/payment-info');
  },

  // Submit transaction
  createTransaction: async (transactionData) => {
    return await apiRequest('/transactions', {
      method: 'POST',
      body: transactionData,
    });
  },

  // Submit new transaction (alias for createTransaction)
  submitTransaction: async (transactionData) => {
    return await apiRequest('/transactions', {
      method: 'POST',
      body: transactionData,
    });
  },

  // Get user's transactions
  getUserTransactions: async (params = {}) => {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key]) {
        searchParams.append(key, params[key]);
      }
    });
    
    const queryString = searchParams.toString();
    return await apiRequest(`/transactions/my-transactions${queryString ? `?${queryString}` : ''}`);
  },

  // Admin functions
  getAllTransactions: async (params = {}) => {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key]) {
        searchParams.append(key, params[key]);
      }
    });
    
    const queryString = searchParams.toString();
    return await apiRequest(`/transactions${queryString ? `?${queryString}` : ''}`);
  },

  approveTransaction: async (trxId) => {
    return await apiRequest(`/transactions/${trxId}/approve`, {
      method: 'POST',
    });
  },

  rejectTransaction: async (trxId) => {
    return await apiRequest(`/transactions/${trxId}/reject`, {
      method: 'POST',
    });
  },

  // Add transaction ID (admin function)
  addTransactionId: async (trxId) => {
    return await apiRequest('/admin/transactions/add-id', {
      method: 'POST',
      body: { trxId },
    });
  },

  // Update transaction status (generic function)
  updateTransactionStatus: async (transactionId, status) => {
    if (status === 'approved') {
      return await apiRequest(`/transactions/${transactionId}/approve`, {
        method: 'POST',
      });
    } else if (status === 'rejected') {
      return await apiRequest(`/transactions/${transactionId}/reject`, {
        method: 'POST',
      });
    } else {
      throw new Error(`Invalid status: ${status}. Use 'approved' or 'rejected'.`);
    }
  },

  // Approve transaction (specific function)
  approveTransaction: async (transactionId) => {
    return await apiRequest(`/transactions/${transactionId}/approve`, {
      method: 'POST',
    });
  },

  // Reject transaction (specific function)  
  rejectTransaction: async (transactionId) => {
    return await apiRequest(`/transactions/${transactionId}/reject`, {
      method: 'POST',
    });
  },

  // Get all users (admin)
  getAllUsers: async () => {
    return await apiRequest('/admin/users');
  },

  // Get admin statistics
  getAdminStats: async () => {
    return await apiRequest('/admin/dashboard/stats');
  },

  // Get stats (alias for getAdminStats)
  getStats: async () => {
    return await apiRequest('/admin/dashboard/stats');
  },
};
