import React, { useState } from 'react'
import API from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import OTPVerification from '../components/OTPVerification'

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await API.post('/auth/login', { emailOrUsername, password })
      if (res.data && res.data.token) {
        useAuth.getState().setToken(res.data.token)
        useAuth.getState().setUser(res.data.user)
        nav('/feed')
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed'

      // Check if the error is about unverified email
      if (errMsg.includes('verify your email') || errMsg.includes('not verified')) {
        // Extract email from error or use the input if it looks like an email
        const email = emailOrUsername.includes('@') ? emailOrUsername : err.response?.data?.email || ''
        if (email) {
          setUnverifiedEmail(email)
          setShowOTP(true)
          return
        }
      }

      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerified = (user, token) => {
    // Set auth state and navigate to feed
    useAuth.getState().setToken(token)
    useAuth.getState().setUser(user)
    nav('/feed')
  }

  // If OTP verification is needed, show that screen
  if (showOTP) {
    return <OTPVerification email={unverifiedEmail} onVerified={handleVerified} />
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Log in</h2>
      {error && <div className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</div>}
      <form onSubmit={submit}>
        <input
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Email or username"
          value={emailOrUsername}
          onChange={e => setEmailOrUsername(e.target.value)}
          disabled={loading}
          required
        />
        <input
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        <div className="text-right mb-3">
          <a className="text-sm text-blue-600 dark:text-blue-400 hover:underline" href="/forgot-password">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Logging in...</span>
            </>
          ) : (
            'Log in'
          )}
        </button>
      </form>
      <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Don't have an account? <a className="text-blue-600 dark:text-blue-400 hover:underline" href="/signup">Sign up</a>
      </div>
    </div>
  )
}
