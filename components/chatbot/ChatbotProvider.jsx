"use client"

import React, { createContext, useContext, useState } from "react"

const ChatbotContext = createContext(undefined)

export function ChatbotProvider({ children }) {
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
