import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  isOnboarded: false,
  setOnboarded: (val) => set({ isOnboarded: val }),
}))
