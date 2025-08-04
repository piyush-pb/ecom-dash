import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import posthog from 'posthog-js'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import Inventory from './pages/Inventory'
import Settings from './pages/Settings'
import './App.css'

function App() {
  useEffect(() => {
    // Track page views with PostHog
    const handleRouteChange = () => {
      posthog.capture('page_view', {
        page: window.location.pathname,
        title: document.title,
      })
    }

    // Track initial page view
    handleRouteChange()

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App 