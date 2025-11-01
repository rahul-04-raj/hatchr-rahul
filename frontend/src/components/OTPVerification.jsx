import React, { useState, useEffect } from 'react';
import API from '../lib/api';

export default function OTPVerification({ email, onVerified, onResend }) {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    useEffect(() => {
        console.log('OTPVerification mounted with email:', email);
    }, [email]);

    const handleVerify = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        console.log('Verifying OTP:', { email, otp });

        try {
            const response = await API.post('/auth/verify-email', { email, otp });
            console.log('Verification response:', response.data);

            if (response.data.success) {
                // Store token and user
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                console.log('Calling onVerified callback');
                // Call onVerified callback
                if (onVerified) {
                    onVerified(response.data.user, response.data.token);
                }
            } else {
                setError(response.data.message || 'Verification failed');
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setResendMessage('');
        setError('');

        try {
            const response = await API.post('/auth/resend-otp', { email });

            if (response.data.success) {
                setResendMessage('New OTP sent to your email!');
                setOtp(''); // Clear the OTP input

                // Clear resend message after 3 seconds
                setTimeout(() => setResendMessage(''), 3000);

                if (onResend) {
                    onResend();
                }
            } else {
                setError(response.data.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 6) {
            setOtp(value);
            setError('');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow mt-6">
            <div className="space-y-6">
                <div>
                    <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
                        Verify Your Email
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        We've sent a 6-digit verification code to
                    </p>
                    <p className="text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-4">
                        {email}
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleVerify}>
                    <div>
                        <label htmlFor="otp" className="sr-only">
                            OTP Code
                        </label>
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                            value={otp}
                            onChange={handleOtpChange}
                            placeholder="Enter 6-digit code"
                            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700 text-center text-2xl tracking-widest font-mono"
                            maxLength="6"
                            autoComplete="off"
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {resendMessage && (
                        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                            <p className="text-sm text-green-800 dark:text-green-400">{resendMessage}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendLoading ? 'Sending...' : "Didn't receive the code? Resend"}
                        </button>
                    </div>
                </form>

                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    <p>The code will expire in 10 minutes</p>
                </div>
            </div>
        </div>
    );
}
