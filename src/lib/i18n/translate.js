import ar from './ar.js'
import en from './en.js'

const dictionaries = { ar, en }

function lookup(dictionary, key) {
  return key.split('.').reduce((node, part) => node?.[part], dictionary)
}

/**
 * Returns the text for `key` in `lang`, with {name} placeholders filled from `params`.
 * A missing key falls back to English and warns in development (ARCHITECTURE §6).
 */
export function translate(lang, key, params) {
  let text = lookup(dictionaries[lang], key)
  if (typeof text !== 'string') {
    if (import.meta.env.DEV) console.warn(`[i18n] Missing "${key}" for "${lang}"`)
    text = lookup(dictionaries.en, key)
  }
  if (typeof text !== 'string') return key
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
}
