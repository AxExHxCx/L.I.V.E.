import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { createClient } from '@base44/sdk'

const base44 = createClient({
  appId: '69e4274134a0810ed78c9ad6',
})

globalThis.__B44_DB__ = base44

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
