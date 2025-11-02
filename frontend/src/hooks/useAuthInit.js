import { useEffect } from 'react'
import { useAuth } from '../store/useAuth'
import API from '../lib/api'
import Cookies from 'js-cookie'

export function useAuthInit() {
    const { setUser, isInitialized, setInitialized } = useAuth()

    useEffect(() => {
        async function initAuth() {
            const token = Cookies.get('token')

            if (!token) {
                setInitialized(true)
                return
            }

            try {
                // Verify token and get current user
                const res = await API.get('/auth/me')
                if (res.data.success && res.data.user) {
                    setUser(res.data.user)
                } else {
                    // Token is invalid, clear it
                    Cookies.remove('token')
                    setUser(null)
                }
            } catch (err) {
                console.error('Auth initialization failed:', err)
                // Token is invalid or expired, clear it
                Cookies.remove('token')
                setUser(null)
            } finally {
                setInitialized(true)
            }
        }

        if (!isInitialized) {
            initAuth()
        }
    }, [isInitialized, setUser, setInitialized])

    return isInitialized
}
