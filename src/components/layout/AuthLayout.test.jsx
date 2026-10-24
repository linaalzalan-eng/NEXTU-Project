import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/renderApp.jsx'

describe('shared redesigned authentication shell', () => {
  it.each(['/login', '/register', '/forgot-password', '/reset-password'])('shows a clearly labelled static product preview on %s', async path => {
    renderApp(path, { signedIn: false })
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    const preview = screen.getByRole('region', { name: 'Product preview — demo data' })
    expect(preview).toHaveTextContent('80%')
    expect(within(preview).getByText('Demo data')).toBeInTheDocument()
    expect(within(preview).getByText('Sample data only. This is not your account activity.')).toBeInTheDocument()
    expect(within(preview).getByText('21')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Appearance/ })).toBeInTheDocument()
  })
  it('preserves Arabic direction and translated preview text', async () => {
    renderApp('/login', { signedIn: false, lang: 'ar' })
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    expect(screen.getByRole('region', { name: 'معاينة المنتج — بيانات تجريبية' })).toBeInTheDocument()
    expect(screen.getByText('بيانات تجريبية فقط، لا تمثل نشاط حسابك.')).toBeInTheDocument()
  })
})
