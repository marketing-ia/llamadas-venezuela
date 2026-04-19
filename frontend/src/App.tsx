import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <header className="bg-slate-950 text-white p-4">
          <h1 className="text-2xl font-bold">Calling Platform</h1>
        </header>
        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl mb-4">Frontend Setup Complete</h2>
            <p className="text-gray-300 mb-4">
              React 18 + TypeScript + Vite + Tailwind CSS initialized successfully.
            </p>
            <p className="text-gray-300">
              Next: Create TypeScript types and API client (Task 11)
            </p>
          </div>
        </main>
      </div>
    </>
  )
}

export default App
