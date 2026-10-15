import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.jsx'

function openApp(path) {
  localStorage.setItem('mind.lang', 'en')
  window.history.pushState({}, '', path)
  render(<App />)
}

// IT-05, routing part (FR-41). Protected-route checks are added in Phase 5.
describe('routing', () => {
  it('redirects / to /dashboard', async () => {
    openApp('/')
    expect(await screen.findByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/dashboard')
  })

  it('shows Not Found for an unknown route', async () => {
    openApp('/no-such-page')
    expect(await screen.findByRole('heading', { level: 1, name: 'This page doesn’t exist' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Today' })).toHaveAttribute('href', '/dashboard')
  })

  it('opens the Tasks page from the navigation', async () => {
    openApp('/tasks')
    expect(await screen.findByRole('heading', { level: 1, name: 'Tasks' })).toBeInTheDocument()
    for (const nav of screen.getAllByRole('navigation', { name: 'Main' })) {
      expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent('Tasks')
    }
  })
})
