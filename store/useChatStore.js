import { create } from 'zustand'

export const useChatStore = create((set) => ({
  activeConversationId: null,
  typingUsers: {},

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setTyping: (conversationId, userId, isTyping) => set((state) => ({
    typingUsers: {
      ...state.typingUsers,
      [conversationId]: {
        ...(state.typingUsers[conversationId] || {}),
        [userId]: isTyping,
      }
    }
  })),
}))
