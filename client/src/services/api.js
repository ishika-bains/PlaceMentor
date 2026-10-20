const API_BASE = '/api';

// Helper for making authenticated requests
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('placementor_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong with the request');
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
};

/* ================= AUTH API ================= */
export const authApi = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request('/auth/me'),

  updateProfile: (profileData) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};

/* ================= TESTS & PRACTICE API ================= */
export const testApi = {
  getCategories: () => request('/tests/categories'),

  getQuestions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/tests/questions?${query}`);
  },

  submitTest: (submissionData) =>
    request('/tests/submit', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    }),

  getAttemptById: (id) => request(`/tests/attempt/${id}`),

  getHistory: () => request('/tests/history'),
};

/* ================= AI MOCK INTERVIEW API ================= */
export const interviewApi = {
  getRoles: () => request('/interview/roles'),

  startSession: (data) =>
    request('/interview/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitAnswer: (data) =>
    request('/interview/answer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  finalizeSession: (data) =>
    request('/interview/finalize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getHistory: () => request('/interview/history'),

  getSessionById: (id) => request(`/interview/session/${id}`),
};

/* ================= GROUP DISCUSSION API ================= */
export const gdApi = {
  getTopics: () => request('/gd/topics'),

  startSession: (data) =>
    request('/gd/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  sendMessage: (data) =>
    request('/gd/message', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  completeSession: (data) =>
    request('/gd/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getHistory: () => request('/gd/history'),

  getSessionById: (id) => request(`/gd/session/${id}`),
};

/* ================= USER & DASHBOARD API ================= */
export const userApi = {
  getDashboardStats: () => request('/user/dashboard'),
};
