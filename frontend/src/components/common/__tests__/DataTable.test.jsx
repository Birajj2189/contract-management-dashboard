import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import DataTable from '../DataTable'
import { renderWithProviders } from '@/test/testUtils'

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
]

const data = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
]

describe('DataTable', () => {
  it('renders column headers', () => {
    renderWithProviders(
      <DataTable columns={columns} data={data} isLoading={false} />
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders data rows', () => {
    renderWithProviders(
      <DataTable columns={columns} data={data} isLoading={false} />
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    renderWithProviders(
      <DataTable columns={columns} data={[]} isLoading={true} />
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    renderWithProviders(
      <DataTable
        columns={columns}
        data={[]}
        isLoading={false}
        emptyTitle="Nothing here"
      />
    )
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('renders pagination when totalPages > 1', () => {
    renderWithProviders(
      <DataTable
        columns={columns}
        data={data}
        isLoading={false}
        pagination={{ page: 1, totalPages: 3, onPageChange: () => {} }}
      />
    )
    const pager = screen.getByLabelText('Table pagination')
    expect(pager).toHaveTextContent(/page\s*1\s*of\s*3/i)
    expect(screen.getByLabelText('Go to page')).toBeInTheDocument()
  })
})
