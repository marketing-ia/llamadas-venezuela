import { useState, useEffect } from 'react'
import './App.css'
import { apiClient } from './services/api'
import { useAuth } from './hooks/useAuth'
import { useStore } from './store'
import type { CallRecord, Operator } from './types'

function App() {
  const [count, setCount] = useState(0)
  const { checkAuth } = useAuth()
  const { isAuthenticated } = useStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <header className="bg-slate-950 text-white p-4">
          <h1 className="text-2xl font-bold">Calling Platform</h1>
          {isAuthenticated && <p className="text-sm text-gray-400">API Client Ready</p>}
        </header>
        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl mb-4">Frontend Setup Complete</h2>
            <p className="text-gray-300 mb-4">
              React 18 + TypeScript + Vite + Tailwind CSS initialized successfully.
            </p>
            <p className="text-gray-300 mb-4">
              Task 11: TypeScript types and API client ready
            </p>
            <div className="text-sm text-gray-400">
              <p>Implemented:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Complete TypeScript type definitions</li>
                <li>Axios API client with automatic tenant ID injection</li>
                <li>Zustand store for authentication state</li>
                <li>useAuth hook for login/logout/session management</li>
                <li>Error handling and 401 response handling</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default App
