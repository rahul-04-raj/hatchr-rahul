import React, { useState } from 'react'
import API from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
    const [step, setStep] = useState(1) // 1: email, 2: OTP + password
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const nav = useNavigate()

    const handleRequestOTP = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const res = await API.post('/auth/forgot-password', { email })
            if (res.data.success) {
                setSuccess('Password reset code sent to your email!')
                setStep(2)
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset code')
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        // Validation
        if (otp.length !== 6) {
            setError('Please enter the 6-digit code')
            return
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            // First verify OTP
            const verifyRes = await API.post('/auth/verify-reset-otp', { email, otp })
            if (!verifyRes.data.success) {
                setError('Invalid or expired code')
                setLoading(false)
                return
            }

            // Then reset password
            const resetRes = await API.post('/auth/reset-password', {
                email,
                otp,
                newPassword
            })

            if (resetRes.data.success) {
                setSuccess('Password reset successfully! Redirecting to login...')
                setTimeout(() => nav('/login'), 2000)
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, '')
        if (value.length <= 6) {
            setOtp(value)
        }
    }

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow mt-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h2>

            {error && (
                <div className="text-sm text-red-600 dark:text-red-400 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="text-sm text-green-600 dark:text-green-400 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    {success}
                </div>
            )}

            {step === 1 ? (
                <form onSubmit={handleRequestOTP}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Enter your email address and we'll send you a code to reset your password.
                    </p>
                    <input
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Sending...</span>
                            </>
                        ) : (
                            'Send Reset Code'
                        )}
                    </button>
                    <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                        Remember your password?{' '}
                        <a className="text-blue-600 dark:text-blue-400 hover:underline" href="/login">
                            Log in
                        </a>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleResetPassword}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Enter the 6-digit code sent to <strong>{email}</strong> and your new password.
                    </p>

                    <input
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest font-mono"
                        placeholder="6-digit code"
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={handleOtpChange}
                        maxLength="6"
                        required
                        disabled={loading}
                    />

                    <input
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="New password (min 6 characters)"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                    />

                    <input
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Confirm new password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed mb-2 flex items-center justify-center gap-2 transition-opacity"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Resetting...</span>
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>

                    <button
                        type="button"
                        className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        onClick={() => setStep(1)}
                        disabled={loading}
                    >
                        ← Back to email entry
                    </button>
                </form>
            )}
        </div>
    )
}
