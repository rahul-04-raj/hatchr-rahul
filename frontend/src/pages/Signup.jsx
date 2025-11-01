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
  const [showOTP, setShowOTP] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
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
        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">Sign up</button>
      </form>
      <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Have an account? <a className="text-blue-600 dark:text-blue-400 hover:underline" href="/login">Log in</a>
      </div>
    </div>
  )
}
