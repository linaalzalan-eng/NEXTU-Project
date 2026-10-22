import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/app/App.jsx'

// Development data helpers (P4-T01), for the mock only: they write to localStorage,
// which the Supabase service never reads. The DEV check is replaced with `false` in a
// production build, so this import and the whole file are left out of it.
if (import.meta.env.DEV && (import.meta.env.VITE_DATA_SOURCE || 'mock') === 'mock') {
  import('@/services/mock/devSeed.js').then(({ installDevSeed }) => installDevSeed())
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
