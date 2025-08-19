"use client"

import { useLocation } from "react-router-dom"
import Chatbot from "./Chatbot"

export default function ChatbotWrapper() {
  const location = useLocation()
  const pathname = location.pathname

  const isLandingPage = pathname === "/"

  // Only render chatbot if not on landing page
  if (isLandingPage) {
    return null
  }

  return <Chatbot />
}
