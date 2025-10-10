import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

async function enableMocking() {
  if (!import.meta.env.DEV) return
  // Opt-out by setting VITE_USE_MSW=false
  if (import.meta.env.VITE_USE_MSW === 'false') return
  try {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
    // eslint-disable-next-line no-console
    console.info('[MSW] Mocking enabled for development')
  } catch (e) {
    console.warn('[MSW] Failed to start mocking', e)
  }
}

enableMocking().finally(() => {
  createRoot(document.getElementById('root')!).render(<App />)
})
