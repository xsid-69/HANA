import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  // True once the first /api/auth/me check has completed (success or definitive).
  initialized: false,

  setUser: (user) => set({ user, loading: false, initialized: true }),
  clearUser: () => set({ user: null, loading: false, initialized: true }),

  fetchMe: async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        // Transient server error — do NOT wipe an existing session.
        set({ loading: false, initialized: true })
        return
      }
      const data = await res.json()
      // Definitive answer from the server (user object or explicit null).
      set({ user: data.user ?? null, loading: false, initialized: true })
    } catch {
      // Network blip — keep whatever user we already had, just stop loading.
      set({ loading: false, initialized: true })
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    set({ user: null, loading: false, initialized: true })
  },
}))
