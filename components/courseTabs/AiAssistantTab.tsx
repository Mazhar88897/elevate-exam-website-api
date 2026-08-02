"use client"

import { useState } from "react"

export default function AiAssistantTab() {
  const quickAnswers: Record<string, string> = {
    encryption:
      "Symmetric encryption uses one key for both encrypt/decrypt, while asymmetric uses a public/private key pair.",
    network:
      "Focus on CIA triad, firewalls, IDS/IPS, VPN basics, and common attack vectors like phishing/DDoS.",
    study:
      "Try 20 mins: 10 mins concept review, 7 mins MCQs, 3 mins recap of mistakes.",
    default:
      "Great question. Based on this course, start with core concepts, practice 10-15 MCQs, then review explanations.",
  }

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "Hi! Ask me anything about this course." },
  ])
  const [isSending, setIsSending] = useState(false)

  const getAnswer = (text: string) => {
    const normalized = text.toLowerCase()
    if (normalized.includes("encrypt")) return quickAnswers.encryption
    if (normalized.includes("network")) return quickAnswers.network
    if (normalized.includes("study")) return quickAnswers.study
    return quickAnswers.default
  }

  const handleSend = () => {
    if (!input.trim() || isSending) return

    const userMessage = input.trim()
    setMessages((prev) => [...prev, { role: "user", text: userMessage }])
    setInput("")
    setIsSending(true)

    setTimeout(() => {
      const reply = getAnswer(userMessage)
      setMessages((prev) => [...prev, { role: "assistant", text: reply }])
      setIsSending(false)
    }, 500)
  }

  return (
    <div className="p-6 border-2 rounded-mid shadow-sm">
      <h2 className="text-md font-bold mb-4">AI Assistant</h2>

      <div className="h-[420px] border rounded-mid overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`border rounded-mid p-3 text-sm ${
                message.role === "assistant"
                  ? "bg-[#f8f8ff] dark:bg-black/30"
                  : "bg-xcolor text-white border-xcolor"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="border-t p-3 bg-white dark:bg-black">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend()
                }
              }}
              placeholder="Ask something..."
              className="flex-1 border rounded-md px-3 py-2 text-sm bg-white dark:bg-black"
            />
            <button
              onClick={handleSend}
              disabled={isSending}
              className="px-4 py-2 text-xs rounded-md bg-xcolor text-white font-bold disabled:opacity-60"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
