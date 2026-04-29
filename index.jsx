import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { createClient } from '@base44/sdk'

// 1. Initialize the Base44 client with "Guest/Public" settings
const base44 = createClient({
  appId: '69e4274134a0810ed78c9ad6',
  auth: {
    persistSession: false, 
    autoRefreshToken: false,
  }
})

// 2. Attach it to the global window
globalThis.__B44_DB__ = base44

// 3. Render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
