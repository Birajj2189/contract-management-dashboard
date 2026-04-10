import axiosInstance from './axiosInstance'

const authService = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),

  register: (data) => axiosInstance.post('/auth/register', data),

  /** Always 200 — use for bootstrap; guests get { authenticated: false }. */
  getSession: () => axiosInstance.get('/auth/session'),

  refresh: () =>
    axiosInstance.post('/auth/refresh', {}, { _isRefreshCall: true }),

  logout: () => axiosInstance.post('/auth/logout'),

  getMe: () => axiosInstance.get('/auth/me'),
}

export default authService
