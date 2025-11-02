import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

export const useAuth = create(
  persist(
    (set) => ({
      user: null,
      isInitialized: false,
      setUser: (user) => set({ user, isInitialized: true }),
      logout: () => {
        Cookies.remove('token')
        set({ user: null, isInitialized: true })
      },
      setToken: (token) => {
        if (token) Cookies.set('token', token, { expires: 7 })
        else Cookies.remove('token')
      },
      setInitialized: (value) => set({ isInitialized: value })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
)
