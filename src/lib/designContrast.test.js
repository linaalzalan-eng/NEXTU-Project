import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'
import { COLORS } from '@/features/analytics/components/chartTheme.js'

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')
const tokens = (source) => Object.fromEntries([...source.matchAll(/--color-([a-z0-9-]+):\s*(#[a-f0-9]{6});/gi)].map(([, name, value]) => [name, value]))
const light = tokens(css.split(':root[data-theme="dark"]')[0])
const dark = { ...light, ...tokens(css.split(':root[data-theme="dark"]')[1]) }
function luminance(hex) {
  const [r, g, b] = hex.slice(1).match(/../g).map((pair) => Number.parseInt(pair, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  return r * 0.2126 + g * 0.7152 + b * 0.0722
}
function contrast(a, b) {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y)
  return (high + 0.05) / (low + 0.05)
}

describe.each([['Light', light], ['Dark', dark]])('%s application contrast', (_name, palette) => {
  it('keeps normal text readable on every neutral content surface', () => {
    for (const foreground of ['ink', 'ink-2', 'ink-3']) {
      for (const background of ['paper', 'surface', 'sunken', 'field']) {
        expect(contrast(palette[foreground], palette[background]), `${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5)
      }
    }
  })
  it('keeps planned chart segments distinguishable from their surface', () => {
    const token = COLORS.planned.match(/^var\(--color-(.+)\)$/)[1]
    expect(contrast(palette[token], palette.surface)).toBeGreaterThanOrEqual(3)
  })
})
