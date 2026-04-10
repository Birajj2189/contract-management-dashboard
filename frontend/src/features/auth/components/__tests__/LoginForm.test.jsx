import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import LoginForm from '../LoginForm'
import { renderWithProviders } from '@/test/testUtils'

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    renderWithProviders(<LoginForm onSubmit={vi.fn()} isLoading={false} />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    renderWithProviders(<LoginForm onSubmit={vi.fn()} isLoading={false} />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
  })

  it('calls onSubmit with valid credentials', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(<LoginForm onSubmit={onSubmit} isLoading={false} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password123' },
        expect.anything()
      )
    })
  })

  it('disables submit button when loading', () => {
    renderWithProviders(<LoginForm onSubmit={vi.fn()} isLoading={true} />)
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })
})
