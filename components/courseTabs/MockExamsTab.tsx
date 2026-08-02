"use client"

import { useMemo, useState } from "react"

export default function MockExamsTab() {
  const mockQuestions = [
    {
      id: 1,
      question: "Which protocol is commonly used for secure web browsing?",
      options: ["HTTP", "FTP", "HTTPS", "SMTP"],
      correctOption: 2,
      explanation: "HTTPS encrypts browser-server communication using TLS, making web browsing secure.",
    },
    {
      id: 2,
      question: "What is the main purpose of a firewall?",
      options: ["Store passwords", "Filter network traffic", "Compress files", "Speed up CPU"],
      correctOption: 1,
      explanation: "Firewalls monitor and filter inbound and outbound traffic based on security rules.",
    },
    {
      id: 3,
      question: "Which attack attempts to overload a server with traffic?",
      options: ["Phishing", "DDoS", "Spoofing", "Sniffing"],
      correctOption: 1,
      explanation: "A DDoS attack floods resources with traffic to disrupt service availability.",
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  const currentQuestion = mockQuestions[currentIndex]
  const isCorrect = useMemo(
    () => selectedOption !== null && selectedOption === currentQuestion.correctOption,
    [selectedOption, currentQuestion.correctOption]
  )

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? mockQuestions.length - 1 : prev - 1))
    setSelectedOption(null)
  }

  const goNext = () => {
    setCurrentIndex((prev) => (prev === mockQuestions.length - 1 ? 0 : prev + 1))
    setSelectedOption(null)
  }

  return (
    <div className="p-6 border-2 rounded-mid shadow-sm">
      <h2 className="text-md font-bold mb-4">Mock Exams</h2>
      <div className="border rounded-mid p-4">
        <p className="text-xs font-bold text-xcolor mb-2">
          Question {currentIndex + 1} of {mockQuestions.length}
        </p>
        <p className="text-sm font-semibold mb-4">{currentQuestion.question}</p>

        <div className="space-y-2">
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = selectedOption === optionIndex
            return (
              <button
                key={optionIndex}
                onClick={() => setSelectedOption(optionIndex)}
                className={`w-full text-left border rounded-md p-3 text-sm ${
                  isSelected ? "border-xcolor bg-[#f0f0ff]" : "border-gray-200 dark:border-gray-700"
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>

        {selectedOption !== null && (
          <div className="mt-4 p-3 rounded-md bg-[#f8f8ff] dark:bg-black/30">
            <p className={`text-xs font-bold mb-1 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
              {isCorrect ? "Correct" : "Incorrect"}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button onClick={goPrev} className="px-4 py-2 text-xs rounded-md bg-[#f0f0ff] text-xcolor font-bold">
          Left
        </button>
        <button onClick={goNext} className="px-4 py-2 text-xs rounded-md bg-[#f0f0ff] text-xcolor font-bold">
          Right
        </button>
      </div>
    </div>
  )
}
