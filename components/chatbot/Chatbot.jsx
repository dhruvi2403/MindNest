import React, { useState, useEffect, useRef } from "react"
import { X, MessageCircle, Send, Bot, User, ExternalLink, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

// const CHATBOT_API_BASE = "/api/chatbot"
const CHATBOT_API_BASE = "http://127.0.0.1:5001"


export default function Chatbot({ className = "" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  // Check chatbot service connection
  useEffect(() => {
    checkConnection()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize with welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(
        "Hello! I'm your MindNest companion. I'm here to help you navigate the platform, provide support, and offer motivation. How can I assist you today?",
        ["Take Assessment", "Find Therapist", "Get Motivation", "Help Me Navigate"],
      )
    }
  }, [isOpen])

  const checkConnection = async () => {
    try {
      // const response = await fetch(`${CHATBOT_API_BASE}/navigation`)
      const response = await fetch(`${CHATBOT_API_BASE}/navigation-help`);

      setIsConnected(response.ok)
    } catch (error) {
      setIsConnected(false)
      console.error("Chatbot service connection failed:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const addBotMessage = (message, suggestions, actions) => {
    const botMessage = {
      id: Date.now().toString(),
      message,
      sender: "bot",
      timestamp: new Date().toISOString(),
      suggestions,
      actions,
    }
    setMessages((prev) => [...prev, botMessage])
  }

  const addUserMessage = (message) => {
    const userMessage = {
      id: Date.now().toString(),
      message,
      sender: "user",
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
  }

  const sendMessage = async (message) => {
    if (!message.trim()) return

    // Add user message
    addUserMessage(message)
    setInputMessage("")
    setIsTyping(true)

    try {
      const response = await fetch(`${CHATBOT_API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTimeout(() => {
          addBotMessage(data.message, data.suggestions, data.actions)
          setIsTyping(false)
        }, 1000) // Simulate typing delay
      } else {
        throw new Error("Failed to get response")
      }
    } catch (error) {
      console.error("Chat error:", error)
      setTimeout(() => {
        addBotMessage("I'm sorry, I'm having trouble connecting right now. Please try again in a moment.", [
          "Try Again",
          "Get Help",
        ])
        setIsTyping(false)
      }, 1000)
    }
  }

  const getMotivation = async () => {
    setIsTyping(true)
    try {
      const response = await fetch(`${CHATBOT_API_BASE}/motivation`)
      if (response.ok) {
        const data = await response.json()
        setTimeout(() => {
          addBotMessage(data.message, ["Another Quote", "Take Assessment", "Find Support"])
          setIsTyping(false)
        }, 800)
      }
    } catch (error) {
      console.error("Motivation error:", error)
      setTimeout(() => {
        addBotMessage("Remember, every small step forward is progress. You're doing great!", ["Try Again"])
        setIsTyping(false)
      }, 800)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    if (suggestion === "Get Motivation" || suggestion === "Motivate me") {
      getMotivation()
    } else {
      sendMessage(suggestion)
    }
  }

  const handleActionClick = (action) => {
    if (action.type === "navigate" && action.url) {
      navigate(action.url)
      setIsOpen(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  const formatMessage = (message) => {
    // Convert markdown-like formatting to JSX
    const parts = message.split(/(\*\*.*?\*\*|\*.*?\*|🏠|📊|📝|👩‍⚕️|👤|🔍|👩‍⚕️|🤖|💪)/g)

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-blue-700">
            {part.slice(2, -2)}
          </strong>
        )
      } else if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={index} className="italic">
            {part.slice(1, -1)}
          </em>
        )
      } else if (/^[🏠📊📝👩‍⚕️👤🔍🤖💪]/u.test(part)) {
        return (
          <span key={index} className="text-lg">
            {part}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          {!isConnected && <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />}
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card className="w-96 h-[600px] shadow-2xl border-0 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">MindNest Assistant</h3>
              <p className="text-xs text-blue-100">{isConnected ? "Online" : "Connecting..."}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={getMotivation}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
              title="Get motivation"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[440px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "bot" && (
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
              )}

              <div className={`max-w-[280px] ${message.sender === "user" ? "order-first" : ""}`}>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === "user" ? "bg-blue-600 text-white ml-auto" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-line">{formatMessage(message.message)}</div>
                </div>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs h-7 px-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.actions.map((action, index) => (
                      <Button
                        key={index}
                        size="sm"
                        onClick={() => handleActionClick(action)}
                        className="text-xs h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {action.label}
                        {action.type === "navigate" && <ExternalLink className="h-3 w-3 ml-1" />}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {message.sender === "user" && (
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isConnected ? "Type your message..." : "Connecting..."}
              disabled={isTyping}
              className="flex-1 border-gray-200 focus:border-blue-500"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700 px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {!isConnected && (
            <p className="text-xs text-amber-600 mt-2 text-center">Using offline mode. Some features may be limited.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
