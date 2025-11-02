import React, { useState } from 'react'
import API from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import OTPVerification from '../components/OTPVerification'

export default function Signup() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    console.log('Form submitted with:', { name, username, email });
    try {
      const res = await API.post('/auth/signup', { name, username, email, password })
      console.log('Signup response:', res.data)
      if (res.data && res.data.success) {
        // Show OTP verification screen
        console.log('Setting showOTP to true, email:', email)
        setRegisteredEmail(email)
        setShowOTP(true)
      } else {
        setError('Signup failed: ' + (res.data?.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.response?.data?.message || 'Signup failed')
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
    console.log('Rendering OTP screen with email:', registeredEmail)
    return (
      <div>
        <OTPVerification email={registeredEmail} onVerified={handleVerified} />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Sign up</h2>
      {error && <div className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</div>}
      <form onSubmit={submit}>
        <input
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
          required
        />
        <input
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={loading}
          required
        />
        <input
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
              <span>Signing up...</span>
            </>
          ) : (
            'Sign up'
          )}
        </button>
      </form>
      <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Have an account? <a className="text-blue-600 dark:text-blue-400 hover:underline" href="/login">Log in</a>
      </div>
    </div>
  )
}
