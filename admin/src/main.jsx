import React from 'react'
import { createRoot } from 'react-dom/client'
import AdminApp from './App'
import './app.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>,
)