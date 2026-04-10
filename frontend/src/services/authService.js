import axiosInstance from './axiosInstance'

const authService = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),

  register: (data) => axiosInstance.post('/auth/register', data),

  refresh: () => axiosInstance.post('/auth/refresh'),

  logout: () => axiosInstance.post('/auth/logout'),

  getMe: () => axiosInstance.get('/auth/me'),
}

export default authService
