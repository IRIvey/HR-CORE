const API_BASE_URL = 'http://localhost:5000';

// Generic API call function that includes credentials for sessions
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include', // CRITICAL: This sends session cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  console.log('🌐 Making API call to:', url);
  console.log('📋 Options:', defaultOptions);

  try {
    const response = await fetch(url, defaultOptions);
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.log('❌ 401 Unauthorized - redirecting to login');
        // Clear any stored auth state and redirect
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/login';
        return null;
      }
      
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('🚨 API call failed:', error);
    throw error;
  }
};

// Auth specific functions
export const authAPI = {
  login: async (credentials) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response) {
      const data = await response.json();
      localStorage.setItem('isLoggedIn', 'true'); // Simple flag
      return data;
    }
    return null;
  },

  logout: async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
  },

  checkStatus: async () => {
    const response = await apiCall('/auth/status');
    return response ? await response.json() : null;
  }
};

// Notification specific functions  
export const notificationAPI = {
  getAll: async () => {
    const response = await apiCall('/api/notifications');
    return response ? await response.json() : [];
  },

  getUnreadCount: async () => {
    const response = await apiCall('/api/notifications/unread-count');
    return response ? await response.json() : { unreadCount: 0 };
  },

  markAsRead: async (id) => {
    const response = await apiCall(`/api/notifications/${id}/read`, {
      method: 'PUT'
    });
    return response ? await response.json() : null;
  },

  markAllAsRead: async () => {
    const response = await apiCall('/api/notifications/mark-all-read', {
      method: 'PUT'
    });
    return response ? await response.json() : null;
  },

  delete: async (id) => {
    const response = await apiCall(`/api/notifications/${id}`, {
      method: 'DELETE'
    });
    return response ? await response.json() : null;
  }
};