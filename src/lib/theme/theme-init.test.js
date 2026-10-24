import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

const html = readFileSync(resolve('index.html'), 'utf8')
const script = html.match(/<script id="theme-init">([\s\S]*?)<\/script>/)[1]
function initialTheme(stored, systemDark, blocked = false) {
  const root = { dataset: {}, style: {} }
  const attributes = {}
  const document = { documentElement: root, querySelector: selector => ({ setAttribute: (name, value) => { attributes[selector + name] = value } }) }
  runInNewContext(script, { document, window: { matchMedia: () => ({ matches: systemDark }) }, localStorage: { getItem: () => { if (blocked) throw new Error('blocked'); return stored } } })
  return { root, attributes }
}

describe('theme before React loads', () => {
  it('runs before external styles and the application module', () => {
    expect(html.indexOf('id="theme-init"')).toBeLessThan(html.indexOf('rel="stylesheet"'))
    expect(html.indexOf('id="theme-init"')).toBeLessThan(html.indexOf('type="module"'))
  })
  it.each([['dark', false, 'dark'], ['light', true, 'light'], ['system', true, 'dark'], [null, false, 'light'], ['invalid', true, 'light']])('resolves %s before first paint', (saved, system, expected) => {
    const { root, attributes } = initialTheme(saved, system)
    expect(root.dataset.theme).toBe(expected)
    expect(root.style.colorScheme).toBe(expected)
    expect(root.style.backgroundColor).toBe(expected === 'dark' ? '#171c1a' : '#f8f7f3')
    expect(attributes['link[rel="icon"]href']).toBe(`/brand/icon-${expected}.svg`)
  })
  it('uses Light when storage access throws', () => {
    expect(initialTheme(null, true, true).root.dataset.theme).toBe('light')
  })
})
