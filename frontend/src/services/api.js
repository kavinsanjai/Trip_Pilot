import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password) => api.post('/auth/register', { email, password }),
}

// User APIs
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  getPreferences: () => api.get('/user/preferences'),
  updatePreferences: (preferences) => api.post('/user/preferences', preferences),
}

// Trip APIs
export const tripAPI = {
  createTrip: (tripData) => api.post('/trip/create', tripData),
  getHistory: () => api.get('/trip/history'),
}

// Set auth token for requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export default api
