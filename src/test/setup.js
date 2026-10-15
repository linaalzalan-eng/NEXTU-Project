import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// findBy… and waitFor wait up to 3 s (default 1 s), for the same reason as
// testTimeout in vite.config.js: a busy machine must not fail a correct test.
configure({ asyncUtilTimeout: 3000 })

// We import test functions explicitly (no Vitest globals), so React Testing
// Library cannot register its automatic cleanup. Do it here.
afterEach(() => {
  cleanup()
  localStorage.clear()
})

// jsdom has no layout, so window.scrollTo (used by ScrollToTop) does nothing useful.
window.scrollTo = () => {}

// jsdom does not implement <dialog>.showModal() and close(). This shim follows
// what browsers do: open, Escape closes (cancel + close events), and focus
// returns to the element that was focused before opening. Real browser behavior
// is still checked by hand (TESTING_PLAN §6).
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  const opener = new WeakMap()

  function onKeyDown(event) {
    if (event.key !== 'Escape') return
    const dialog = event.currentTarget
    const cancel = new Event('cancel', { cancelable: true })
    if (dialog.dispatchEvent(cancel)) dialog.close()
  }

  HTMLDialogElement.prototype.showModal = function showModal() {
    opener.set(this, document.activeElement)
    this.setAttribute('open', '')
    this.addEventListener('keydown', onKeyDown)
    const focusable = this.querySelector('[autofocus], input, button, select, textarea, [href]')
    focusable?.focus()
  }

  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    this.removeEventListener('keydown', onKeyDown)
    this.dispatchEvent(new Event('close'))
    opener.get(this)?.focus()
  }

  Object.defineProperty(HTMLDialogElement.prototype, 'open', {
    configurable: true,
    get() {
      return this.hasAttribute('open')
    },
  })
}
