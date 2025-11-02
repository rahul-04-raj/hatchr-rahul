import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import ProjectPage from './pages/Project'
import PostView from './pages/PostView'
import Search from './pages/Search'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { useTheme } from './store/useTheme'
import { useEffect } from 'react'
import { useAuthInit } from './hooks/useAuthInit'

const queryClient = new QueryClient()

function App() {
  const dark = useTheme(state => state.dark)
  const isAuthInitialized = useAuthInit()

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  // Show loading screen while initializing auth
  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <div className="max-w-6xl mx-auto mt-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/post/:postId" element={<ProtectedRoute><PostView /></ProtectedRoute>} />
            <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/project/:projectId" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/feed" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')).render(<App />)
