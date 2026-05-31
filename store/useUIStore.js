import { create } from 'zustand'

export const useUIStore = create((set) => ({
  isProfileModalOpen: false,
  selectedCompanionId: null,
  isBookingSheetOpen: false,
  toasts: [],

  openProfileModal: (companionId) => set({ isProfileModalOpen: true, selectedCompanionId: companionId }),
  closeProfileModal: () => set({ isProfileModalOpen: false, selectedCompanionId: null }),

  openBookingSheet: () => set({ isBookingSheetOpen: true }),
  closeBookingSheet: () => set({ isBookingSheetOpen: false }),

  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { id: Date.now(), ...toast }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
}))
