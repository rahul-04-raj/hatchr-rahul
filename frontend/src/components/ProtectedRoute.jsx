import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import Cookies from 'js-cookie'

export default function ProtectedRoute({ children }) {
  const user = useAuth(state => state.user)
  const token = Cookies.get('token')

  // If no token and no user, redirect to login
  if (!token && !user) {
    return <Navigate to="/login" replace />
  }

  return children
}
