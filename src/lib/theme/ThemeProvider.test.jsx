import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from './ThemeProvider.jsx'
import { useTheme } from './useTheme.js'
import { setupUser } from '@/test/setupUser.js'

function Controls() {
  const { preference, resolvedTheme, setTheme } = useTheme()
  return <><output>{preference}:{resolvedTheme}</output>{['light', 'dark'].map(mode => <button key={mode} onClick={() => setTheme(mode)}>{mode}</button>)}</>
}
const mount = () => render(<ThemeProvider><Controls /></ThemeProvider>)
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); delete document.documentElement.dataset.theme })

describe('explicit theme preferences', () => {
  it.each([null, 'broken'])('defaults %s to Light regardless of OS', saved => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    if (saved) localStorage.setItem('nextu.theme', saved)
    mount()
    expect(screen.getByText('light:light')).toBeInTheDocument()
    expect(localStorage.getItem('nextu.theme')).toBe('light')
  })
  it.each([[true, 'dark'], [false, 'light']])('migrates legacy System once with OS dark=%s', (matches, expected) => {
    let listener
    vi.stubGlobal('matchMedia', () => ({ matches, addEventListener: (_type, fn) => { listener = fn }, removeEventListener: () => {} }))
    localStorage.setItem('nextu.theme', 'system')
    mount()
    expect(screen.getByText(`${expected}:${expected}`)).toBeInTheDocument()
    expect(localStorage.getItem('nextu.theme')).toBe(expected)
    expect(listener).toBeUndefined()
  })
  it('restores saved Dark and persists the next explicit choice', async () => {
    localStorage.setItem('nextu.theme', 'dark')
    const user = setupUser()
    mount()
    expect(screen.getByText('dark:dark')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'light' }))
    expect(localStorage.getItem('nextu.theme')).toBe('light')
  })
  it('syncs explicit choices and cleared storage from another tab', () => {
    mount()
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'nextu.theme', newValue: 'dark' })))
    expect(screen.getByText('dark:dark')).toBeInTheDocument()
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: null, newValue: null })))
    expect(screen.getByText('light:light')).toBeInTheDocument()
  })
  it('supports visit-only toggling when storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('blocked') })
    const user = setupUser()
    mount()
    await user.click(screen.getByRole('button', { name: 'dark' }))
    expect(screen.getByText('dark:dark')).toBeInTheDocument()
  })
})
