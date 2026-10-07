import React from 'react'
import { createRoot } from 'react-dom/client'
import AdminApp from './App'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import './app.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AdminApp />
    </ErrorBoundary>
  </React.StrictMode>,
)