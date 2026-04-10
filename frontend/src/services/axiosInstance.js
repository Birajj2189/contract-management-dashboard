import axios from 'axios'
import env from '@/config/env'

// We import the store lazily to avoid circular dependency issues
// (store imports authSlice, axiosInstance is used in services imported by slices)
let store

export const injectStore = (_store) => {
  store = _store
}

const axiosInstance = axios.create({
  baseURL: `${env.apiUrl}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request interceptor ────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store?.getState()?.auth?.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Silent refresh state ───────────────────────────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// ─── Response interceptor ───────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const is401 = error.response?.status === 401
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh')
    const alreadyRetried = originalRequest._retry

    if (is401 && !isRefreshEndpoint && !alreadyRetried) {
      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axiosInstance.post('/auth/refresh')
        const { accessToken } = response.data.data

        // Update Redux store with new token
        const { setAccessToken } = await import('@/store/slices/authSlice')
        store.dispatch(setAccessToken(accessToken))

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        processQueue(null, accessToken)
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)

        // Refresh failed — clear auth state and redirect to login
        const { clearAuth } = await import('@/store/slices/authSlice')
        store.dispatch(clearAuth())
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
