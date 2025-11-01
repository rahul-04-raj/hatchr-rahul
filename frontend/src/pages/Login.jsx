import React, { useState } from 'react'
import API from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import OTPVerification from '../components/OTPVerification'

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showOTP, setShowOTP] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
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
        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Email or username" value={emailOrUsername} onChange={e => setEmailOrUsername(e.target.value)} required />
        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />

        <div className="text-right mb-3">
          <a className="text-sm text-blue-600 dark:text-blue-400 hover:underline" href="/forgot-password">
            Forgot password?
          </a>
        </div>

        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">Log in</button>
      </form>
      <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Don't have an account? <a className="text-blue-600 dark:text-blue-400 hover:underline" href="/signup">Sign up</a>
      </div>
    </div>
  )
}
