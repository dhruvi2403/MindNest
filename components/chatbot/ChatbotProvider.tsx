"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface ChatbotContextType {
  isEnabled: boolean
  setIsEnabled: (enabled: boolean) => void
  unreadCount: number
  setUnreadCount: (count: number) => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  return (
    <ChatbotContext.Provider
      value={{
        isEnabled,
        setIsEnabled,
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  )
}

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error("useChatbot must be used within a ChatbotProvider")
  }
  return context
}
