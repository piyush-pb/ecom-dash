import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import posthog from 'posthog-js'
import App from './App.tsx'
import './index.css'

// Initialize PostHog with proper configuration
const posthogApiKey = import.meta.env.VITE_POSTHOG_API_KEY || 'phc_placeholder_key'
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'

// Only initialize PostHog if we have a valid API key
if (posthogApiKey && posthogApiKey !== 'phc_placeholder_key') {
  posthog.init(posthogApiKey, {
    api_host: posthogHost,
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        console.log('PostHog initialized in development mode')
        posthog.debug()
      }
    },
    capture_pageview: false, // Disable automatic pageview capture, we'll handle this manually
    autocapture: true,
    disable_session_recording: false,
    enable_recording_console_log: false,
  })
} else {
  console.log('PostHog not initialized - using placeholder key')
}

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
) 