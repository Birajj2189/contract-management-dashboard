import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload
      state.user = user
      state.accessToken = accessToken
      state.isAuthenticated = true
      state.isInitializing = false
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload
    },
    clearAuth: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.isInitializing = false
    },
    setInitializing: (state, action) => {
      state.isInitializing = action.payload
    },
  },
})

export const { setCredentials, setAccessToken, clearAuth, setInitializing } = authSlice.actions

// Selectors
export const selectCurrentUser = (state) => state.auth.user
export const selectAccessToken = (state) => state.auth.accessToken
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsInitializing = (state) => state.auth.isInitializing
export const selectUserRole = (state) => state.auth.user?.role

export default authSlice.reducer
