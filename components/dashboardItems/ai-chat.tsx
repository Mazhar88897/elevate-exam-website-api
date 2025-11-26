'use client'

import { useState, useEffect, useRef } from 'react'
import * as React from "react"
import { Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from 'react-hot-toast'

interface Message {
  id: string
  role: "user" | "assistant"
  content: string | React.ReactNode
  isThinking?: boolean
  rawText?: string // Store raw text for history purposes
}

export function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    if (input.trim() === "") return

    const query = input.trim()
    
    // Get history BEFORE adding new messages (from previous conversation)
    const getHistory = () => {
      // Filter out thinking messages and get actual messages
      const actualMessages = messages.filter(msg => !msg.isThinking)
      
      if (actualMessages.length >= 2) {
        // Get the last 2 messages (should be user and assistant pair)
        const lastTwo = actualMessages.slice(-2)
        const lastUserMessage = lastTwo.find(msg => msg.role === 'user')
        const lastAssistantMessage = lastTwo.find(msg => msg.role === 'assistant')
        
        return {
          query: lastUserMessage?.rawText || (typeof lastUserMessage?.content === 'string' ? lastUserMessage.content : '') || '',
          response: lastAssistantMessage?.rawText || (typeof lastAssistantMessage?.content === 'string' ? lastAssistantMessage.content : '') || ''
        }
      }
      
      // If no history yet, return empty
      return { 'query': '', 'response': '' }
    }

    const history = getHistory()

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      rawText: query, // Store raw text for history
    }

    setMessages((prevMessages) => [...prevMessages, newUserMessage])
    setInput("")
    setIsLoading(true)

    // Add thinking message
    const thinkingMessageId = (Date.now() + 1).toString()
    const thinkingMessage: Message = {
      id: thinkingMessageId,
      role: "assistant",
      content: "Thinking...",
      isThinking: true,
    }
    setMessages((prevMessages) => [...prevMessages, thinkingMessage])

    try {
      const courseId = sessionStorage.getItem('course_id')
      const authToken = sessionStorage.getItem('Authorization')

      if (!courseId) {
        throw new Error('Course ID not found')
      }

      if (!authToken) {
        throw new Error('Authorization token not found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/query/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({
          course_id: "cism",
          query: query,
          history: history,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.detail || `HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      
      // Format the AI response
      const aiResponse = data.response || data.answer || 'No response received'
      
      // Convert markdown-style formatting to JSX if needed
      const formatResponse = (text: string) => {
        // Split by double newlines for paragraphs
        const paragraphs = text.split('\n\n').filter(p => p.trim())
        
        return (
          <div className="space-y-2">
            {paragraphs.map((para, idx) => {
              // Check for bold text (**text**)
              const parts = para.split(/(\*\*.*?\*\*)/g)
              return (
                <p key={idx} className="mb-2">
                  {parts.map((part, partIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={partIdx}>{part.slice(2, -2)}</strong>
                    }
                    return <span key={partIdx}>{part}</span>
                  })}
                </p>
              )
            })}
          </div>
        )
      }

      const aiResponseContent = formatResponse(aiResponse)

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === thinkingMessageId 
            ? { ...msg, content: aiResponseContent, rawText: aiResponse, isThinking: false } 
            : msg,
        ),
      )
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send message')
      
      // Update thinking message to show error
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === thinkingMessageId 
            ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isThinking: false } 
            : msg,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto overflow-hidden">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 overscroll-contain" style={{ overflowAnchor: 'none' }}>
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p className="text-sm">Start a conversation by asking a question</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`${
                message.role === "user" 
                  ? "bg-[#f0f0ff] dark:bg-xcolor text-gray-800 dark:text-white" 
                  : "bg-gray-100 text-gray-800 dark:text-white dark:bg-[#111111]"
              } rounded-lg p-3 ${message.role === "user" ? "max-w-[75%]" : "max-w-[85%]"} ${
                message.isThinking ? "animate-pulse" : ""
              }`}
            >
              {typeof message.content === 'string' ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t flex items-center gap-2 flex-shrink-0">
        <Input
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Ask a question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage} 
          disabled={isLoading || input.trim() === ""}
          className="bg-xcolor text-white px-3 py-2 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

