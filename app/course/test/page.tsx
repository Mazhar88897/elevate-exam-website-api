'use client'

import { useState, useEffect } from 'react'
import { Flag, AlertTriangle, SkipForward, ChevronRight, CheckCircle2 } from "lucide-react"
import Access from "@/components/dashboardItems/access"
import Link from "next/link"
import { useSupportModal } from "@/components/dashboardItems/support-modal"
import { ModalProvider, useModal } from "@/components/dashboardItems/note"
import { SupportModalProvider } from "@/components/dashboardItems/support-modal"
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

// Utility function for class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// Progress component
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-200", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-green-500 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

// Course data structure - simplified for plain questions
export interface Question {
  question: string;
  options: string[];
  correctOption: string;
  explanation: string;
}

export interface Course {
  courseName: string;
  questions: Question[];
}

function QuizPage() {
  const { openSupportModal } = useSupportModal()
  const { openModal } = useModal()
  
  // Course data - simplified to plain questions
  const course: Course = {
    courseName: "Introduction to TypeScript",
    questions: [
      {
        question: "What is TypeScript?",
        options: ["A programming language", "A database", "A CSS framework", "A text editor"],
        correctOption: "A programming language",
        explanation: "TypeScript is a strongly typed superset of JavaScript that compiles to plain JavaScript.",
      },
      {
        question: "Which extension is used for TypeScript files?",
        options: [".js", ".ts", ".tsx", ".json"],
        correctOption: ".ts",
        explanation: ".ts is the standard file extension for TypeScript files.",
      },
      {
        question: "What does TypeScript improve over JavaScript?",
        options: ["Speed", "Type safety", "File size", "Performance"],
        correctOption: "Type safety",
        explanation: "TypeScript adds static type checking to JavaScript, improving developer experience and reducing bugs.",
      },
      {
        question: "Which tool compiles TypeScript to JavaScript?",
        options: ["Webpack", "Node", "tsc", "npm"],
        correctOption: "tsc",
        explanation: "The TypeScript compiler (tsc) compiles .ts files into JavaScript.",
      },
      {
        question: "Which of the following is a TypeScript feature?",
        options: ["Dynamic typing", "Loose syntax", "Static typing", "None"],
        correctOption: "Static typing",
        explanation: "Static typing is a key feature of TypeScript.",
      },
    ],
  }

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completedQuestions, setCompletedQuestions] = useState<boolean[]>(Array(course.questions.length).fill(false))
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>(Array(course.questions.length).fill(false))

  // Current question data
  const currentQuestion = course.questions[currentQuestionIndex]
  const totalQuestions = course.questions.length

  // Calculate total progress
  useEffect(() => {
    const completedCount = completedQuestions.filter(Boolean).length
    setProgress((completedCount / totalQuestions) * 100)
  }, [completedQuestions, totalQuestions])

  // Navigate to specific question
  const navigateToQuestion = (questionIdx: number) => {
    setCurrentQuestionIndex(questionIdx)
    setSelectedOption(null)
    setIsAnswered(false)
  }

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    if (isAnswered) return

    setSelectedOption(option)
    setIsAnswered(true)

    // Mark question as completed
    const newCompletedQuestions = [...completedQuestions]
    newCompletedQuestions[currentQuestionIndex] = true
    setCompletedQuestions(newCompletedQuestions)
  }

  // Handle continue button
  const handleContinue = () => {
    setSelectedOption(null)
    setIsAnswered(false)

    // Move to next question
    if (currentQuestionIndex < course.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // Handle skip button
  const handleSkip = () => {
    setSelectedOption(null)
    setIsAnswered(false)

    // Move to next question
    if (currentQuestionIndex < course.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // Handle flag button
  const handleFlag = () => {
    const newFlaggedQuestions = [...flaggedQuestions]
    newFlaggedQuestions[currentQuestionIndex] = !newFlaggedQuestions[currentQuestionIndex]
    setFlaggedQuestions(newFlaggedQuestions)
  }

  // Get question number out of total
  const getQuestionNumber = () => {
    return currentQuestionIndex + 1
  }

  return (
    <div className="flex min-h-screen">

      

      {/* Main content */}        
      <div className="flex-1 mx-4 flex flex-col">
        {/* Premium banner */}
        <div className="max-w-5xl mx-auto w-full text-center">
            <p className="sm:text-2xl text-xl font-bold pb-4"> {sessionStorage.getItem('course_name')} Exam</p>
        </div>
     
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto w-full px-4 rounded-mid">
          <Progress value={progress} className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-mid" />
        </div>

        {/* Question content */}
        <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="hidden sm:block text-sm font-black text-gray-600 dark:text-gray-300">
              Question <span className="text-green-600">{getQuestionNumber()}</span> of <span className="text-green-600">{totalQuestions}</span> 
            </div>
            <div className="block sm:hidden text-sm font-black text-gray-600 dark:text-gray-300">
            Q <span className="text-green-600">{getQuestionNumber()}</span> of <span className="text-green-600">{totalQuestions}</span> 
            </div>
            <div className="flex">
              <div className="text-gray-600 dark:text-gray-300 flex items-center cursor-pointer" onClick={handleSkip}>
                <SkipForward className="h-3 mr-1 w-3" strokeWidth={3} />
                <span className="text-sm font-bold">Skip</span>
              </div>
              <div
                className={cn(
                  "text-gray-600 dark:text-gray-300 mx-3 flex items-center cursor-pointer",
                  flaggedQuestions[currentQuestionIndex] && "",
                )}
                onClick={handleFlag}
              >
                <Flag className="h-3 mr-1 w-3" strokeWidth={3} />
                <span className="text-sm font-bold">Flag</span>
              </div>
              
              <Link href="/course/result/stats">
                <div className="flex items-center gap-1 hover:text-green-800 cursor-pointer">
                  <span className="text-sm flex items-center justify-center rounded-mid font-black">
                    Submit Quiz
                    <ChevronRight className="h-4 w-4 mr-1" strokeWidth={3} />
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">{currentQuestion.question}</h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "border rounded-md p-3 cursor-pointer",
                    selectedOption === option &&
                      option === currentQuestion.correctOption &&
                      "bg-green-50 dark:bg-black border-green-200",
                    selectedOption === option && option !== currentQuestion.correctOption && "bg-red-50 dark:bg-black border-red-200",
                    !isAnswered && "hover:border-gray-400",
                  )}
                  onClick={() => handleOptionSelect(option)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-mid text-sm font-semibold border mt-0.5 flex-shrink-0",
                        selectedOption === option && "",
                      )}
                    />
                    <div className="text-sm font-semibold">{option}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Explanation */}
            {isAnswered && (
              <div className="mt-4 bg-green-50 dark:bg-black border border-green-200 rounded-md p-4">
                <h3 className="font-semibold text-sm mb-2">Explanation:</h3>
                <p className="font-semibold text-sm">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          {/* Continue button */}
          {isAnswered && (
            <div className="w-32 text-sm text-center p-1 text-slate-800 dark:text-slate-300 border font-black border-gray-300 rounded-mid cursor-pointer" onClick={handleContinue}>
              Continue
            </div>
          )}

          {/* Report issue */}
          <div className="mt-8 text-sm text-gray-500 flex items-center gap-1">
            <span className="text-xs text-gray-700 dark:text-slate-300 font-bold">have issue in this question?</span>
            <button onClick={openSupportModal} className="text-black dark:text-white text-xs font-black flex items-center gap-1">
              report an issue
              <AlertTriangle className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mobile Tabs Component
function MobileTabs() {
  const [activeTab, setActiveTab] = useState<'Quiz' | 'AI Assistant' | 'Notes'>('Quiz')

  return (
    <div className="w-full max-w-xl mx-auto">
    
    <QuizPage />
    </div>
  )
}

// Desktop Component
function DesktopView() {
  return <QuizPage />
}

// Main Component
export default function ResponsiveView() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <SupportModalProvider>
      <ModalProvider>
        {isMobile ? <MobileTabs /> : <DesktopView />}
      </ModalProvider>
    </SupportModalProvider>
  )
}