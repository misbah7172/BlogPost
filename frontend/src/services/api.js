const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set token in localStorage
const setToken = (token) => localStorage.setItem('token', token);

// Remove token from localStorage
const removeToken = () => localStorage.removeItem('token');

// Create axios-like fetch wrapper with retry logic
const apiRequest = async (endpoint, options = {}, retryCount = 0) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  const maxRetries = 2;
  
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Handle FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed (attempt ${retryCount + 1}):`, error);
    
    // Retry for network errors but not for auth/validation errors
    if (retryCount < maxRetries && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('TypeError') ||
      error.message.includes('NetworkError')
    )) {
      console.log(`Retrying request to ${endpoint} in ${(retryCount + 1) * 1000}ms...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return apiRequest(endpoint, options, retryCount + 1);
    }
    
    throw error;
  }
};

export { apiRequest, getToken, setToken, removeToken, API_BASE_URL };
