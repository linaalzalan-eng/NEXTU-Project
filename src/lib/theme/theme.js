export const THEME_STORAGE_KEY = 'nextu.theme'
export const THEME_CHOICES = ['light', 'dark']

export function normalizeTheme(value) {
  // Migrate legacy System once, then persist an explicit choice in the provider.
  if (value === 'system') return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  return THEME_CHOICES.includes(value) ? value : 'light'
}
export function readTheme() {
  try { return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY)) } catch { return 'light' }
}
export function applyTheme(theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
  root.style.backgroundColor = theme === 'dark' ? '#171c1a' : '#f8f7f3'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#171c1a' : '#f8f7f3')
  document.querySelector('link[rel="icon"]')?.setAttribute('href', `/brand/icon-${theme}.svg`)
}
