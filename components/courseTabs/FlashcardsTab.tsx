"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function FlashcardsTab() {
  const sampleFlashcards = [
    { id: 1, question: "What is the CIA triad?", answer: "Confidentiality, Integrity, Availability." },
    { id: 2, question: "What does hashing provide?", answer: "One-way data integrity verification." },
    { id: 3, question: "What is MFA?", answer: "Multi-Factor Authentication for stronger access control." },
    { id: 4, question: "What is least privilege?", answer: "Users get only the minimum access they need." },
    { id: 5, question: "What is phishing?", answer: "A social engineering attack to steal sensitive data." },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const currentCard = sampleFlashcards[currentIndex]

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? sampleFlashcards.length - 1 : prev - 1))
    setIsFlipped(false)
  }

  const goNext = () => {
    setCurrentIndex((prev) => (prev === sampleFlashcards.length - 1 ? 0 : prev + 1))
    setIsFlipped(false)
  }

  return (
    <div className="p-6 border-2 rounded-mid shadow-sm">
      <h2 className="text-md font-bold mb-4">Flashcards</h2>

      <div className="flex justify-center flex-col items-center mb-4">
        <div className="text-sm font-black text-gray-600 dark:text-gray-300">
          {currentIndex + 1} / {sampleFlashcards.length}
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div
          className="w-full max-w-[600px] h-[400px] md:w-[600px] dark:bg-black border border-gray-300 font-semibold text-slate-800 shadow-xl rounded-xl overflow-hidden cursor-pointer"
          onClick={() => setIsFlipped((prev) => !prev)}
          style={{ perspective: "1000px" }}
        >
          <div
            className="relative w-full h-full transition-transform duration-700 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div
              className="absolute inset-0 w-full h-full bg-white dark:bg-slate-900 rounded-xl flex flex-col items-center justify-center p-8 md:p-12"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(0deg)",
              }}
            >
              <div className="relative z-10 w-full max-w-2xl px-4">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white leading-tight mb-6">
                  {currentCard.question}
                </div>
                <div className="text-xs md:text-sm text-center text-gray-500 dark:text-gray-400 font-medium mt-6">
                  Click to flip
                </div>
              </div>
            </div>

            <div
              className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black rounded-xl flex flex-col items-center justify-center p-8 md:p-12"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="relative z-10 w-full max-w-2xl px-4">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-center text-gray-900 dark:text-white leading-relaxed mb-6">
                  {currentCard.answer}
                </div>
                <div className="text-xs md:text-sm text-center text-gray-500 dark:text-gray-400 font-medium mt-6">
                  Click to flip back
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={goPrev}
          className="w-16 h-9 border border-slate-400 rounded-full hover:bg-gray-100 dark:hover:bg-black transition-colors cursor-pointer flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-5 font-bold" />
        </button>

        <button
          onClick={goNext}
          className="w-16 h-9 border border-slate-400 rounded-full hover:bg-gray-100 dark:hover:bg-black transition-colors cursor-pointer flex items-center justify-center"
        >
          <ArrowRight className="w-6 h-5 font-bold" />
        </button>
      </div>
    </div>
  )
}
