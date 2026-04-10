import { describe, it, expect } from 'vitest'
import authReducer, {
  setCredentials,
  clearAuth,
  setAccessToken,
  setInitializing,
} from '@/store/slices/authSlice'

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
}

describe('authSlice', () => {
  it('returns the initial state', () => {
    expect(authReducer(undefined, { type: '@@INIT' })).toEqual(initialState)
  })

  it('setCredentials sets user, token, and isAuthenticated', () => {
    const user = { id: '1', name: 'Alice', role: 'USER' }
    const state = authReducer(initialState, setCredentials({ user, accessToken: 'abc123' }))
    expect(state.user).toEqual(user)
    expect(state.accessToken).toBe('abc123')
    expect(state.isAuthenticated).toBe(true)
    expect(state.isInitializing).toBe(false)
  })

  it('clearAuth resets state', () => {
    const loggedIn = { user: { id: '1' }, accessToken: 'token', isAuthenticated: true, isInitializing: false }
    const state = authReducer(loggedIn, clearAuth())
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
  })

  it('setAccessToken updates only the token', () => {
    const state = authReducer(
      { ...initialState, accessToken: 'old' },
      setAccessToken('new-token')
    )
    expect(state.accessToken).toBe('new-token')
  })

  it('setInitializing updates isInitializing', () => {
    const state = authReducer(initialState, setInitializing(false))
    expect(state.isInitializing).toBe(false)
  })
})
