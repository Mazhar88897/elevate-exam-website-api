'use client'

import { useState, useEffect } from 'react'
import { Flag, AlertTriangle, SkipForward, ChevronRight, CheckCircle2, FlagOffIcon } from "lucide-react"
import Access from "@/components/dashboardItems/access"
import Link from "next/link"
import { useSupportModal } from "@/components/dashboardItems/support-modal"
import { ModalProvider, useModal } from "@/components/dashboardItems/note"
import { SupportModalProvider } from "@/components/dashboardItems/support-modal"
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

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

// API Response interfaces
export interface ApiQuestion {
  id: number;
  text: string;
  option0: string;
  option1: string;
  option2: string;
  option3: string;
  correct_option: number;
  explanation: string;
}

export interface QuestionsApiResponse {
  total_questions: number;
  questions: ApiQuestion[];
}

export interface ProgressQuestion {
  id: number;
  question: number;
  selected_option: number | null;
  is_flagged: boolean;
}

export interface ProgressApiResponse {
  id: number;
  course: number;
  attempted_questions: number;
  last_viewed_question: number | null;
  is_submitted: boolean;
  questions: ProgressQuestion[];
}

// Local question structure
export interface Question {
  id: number;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  selectedOption: number | null;
  isFlagged: boolean;
}

export interface Course {
  courseName: string;
  questions: Question[];
}

function QuizPage() {
  const { openSupportModal } = useSupportModal()
  const { openModal } = useModal()
  const router = useRouter()
  
  // State for API data
  const [questions, setQuestions] = useState<Question[]>([])
  const [progressData, setProgressData] = useState<ProgressApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completedQuestions, setCompletedQuestions] = useState<boolean[]>([])
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([])
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false)

  
  // Fetch questions from API 1
  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/courses/${sessionStorage.getItem('course_id')}/full_test_page/`, {
        headers: {
          'Authorization': `Token ${sessionStorage.getItem('Authorization')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }
      
      const data: QuestionsApiResponse = await response.json()
      
      // Transform API data to local format
      const transformedQuestions: Question[] = data.questions.map((apiQ: ApiQuestion) => ({
        id: apiQ.id,
        question: apiQ.text,
        options: [apiQ.option0, apiQ.option1, apiQ.option2, apiQ.option3],
        correctOption: apiQ.correct_option,
        explanation: apiQ.explanation,
        selectedOption: null,
        isFlagged: false
      }))
      
      setQuestions(transformedQuestions)
      setCompletedQuestions(Array(transformedQuestions.length).fill(false))
      setFlaggedQuestions(Array(transformedQuestions.length).fill(false))
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions')
    }
  }

  // Submit handler function
  const submitHandler = async (question_id: number, selected_option: number | null, is_flagged: boolean) => {
    const payload = {
      question_id: question_id,
      selected_option: selected_option,
      is_flagged: is_flagged
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/test_progress/update_question/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${sessionStorage.getItem('Authorization')}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Success:", data);
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  // Fetch progress from API 2
  const fetchProgress = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/test_progress/${sessionStorage.getItem('course_id')}/progress/?source=content`, {
        headers: {
          'Authorization': `Token ${sessionStorage.getItem('Authorization')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress')
      }
      
      const data: ProgressApiResponse = await response.json()
      setProgressData(data)
      
      // Update questions with progress data
      setQuestions(prevQuestions => 
        prevQuestions.map(q => {
          const progressQ = data.questions.find(pq => pq.question === q.id)
          return {
            ...q,
            selectedOption: progressQ?.selected_option || null,
            isFlagged: progressQ?.is_flagged || false
          }
        })
      )
      



      
      // Update completed questions based on progress
      setQuestions(prevQuestions => {
        const newCompletedQuestions = prevQuestions.map(q => {
          const progressQ = data.questions.find(pq => pq.question === q.id)
          return progressQ?.selected_option !== null && progressQ?.selected_option !== undefined
        })
        setCompletedQuestions(newCompletedQuestions)
        
        // Update flagged questions
        const newFlaggedQuestions = prevQuestions.map(q => {
          const progressQ = data.questions.find(pq => pq.question === q.id)
          return progressQ?.is_flagged || false
        })
        setFlaggedQuestions(newFlaggedQuestions)
        
        // Determine starting question based on last_viewed_question
        let startingIndex = 0
        
        if (data.last_viewed_question !== null && data.last_viewed_question !== undefined) {
          // Find the index of the last viewed question in the questions array
          const lastViewedIndex = prevQuestions.findIndex(q => q.id === data.last_viewed_question)
          if (lastViewedIndex !== -1) {
            // Start from the next question after the last viewed question
            startingIndex = lastViewedIndex + 1
            // If we're at the end, start from the last viewed question
            if (startingIndex >= prevQuestions.length) {
              startingIndex = lastViewedIndex
            }
          }
        } else {
          // If no last_viewed_question, find first unanswered question
          const lastAttemptedIndex = newCompletedQuestions.findIndex(completed => !completed)
          if (lastAttemptedIndex !== -1) {
            startingIndex = lastAttemptedIndex
          }
        }
        
        setCurrentQuestionIndex(startingIndex)
        
        return prevQuestions
      })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress')
    }
  }

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchQuestions()
      await fetchProgress()
      setLoading(false)
    }
    
    loadData()
  }, [])

  // Current question data
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length

  // Calculate total progress
  useEffect(() => {
    if (questions.length > 0 && completedQuestions.length > 0) {
      const completedCount = completedQuestions.filter(Boolean).length
      setProgress((completedCount / totalQuestions) * 100)
    }
  }, [completedQuestions, totalQuestions, questions.length])

  // Navigate to specific question
  const navigateToQuestion = (questionIdx: number) => {
    setCurrentQuestionIndex(questionIdx)
    setSelectedOption(questions[questionIdx]?.selectedOption || null)
    setIsAnswered(questions[questionIdx]?.selectedOption !== null)
  }

  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return

    setSelectedOption(optionIndex)
    setIsAnswered(true)

    // Update questions state
    setQuestions(prevQuestions => 
      prevQuestions.map((q, idx) => 
        idx === currentQuestionIndex 
          ? { ...q, selectedOption: optionIndex }
          : q
      )
    )

    // Mark question as completed
    const newCompletedQuestions = [...completedQuestions]
    newCompletedQuestions[currentQuestionIndex] = true
    setCompletedQuestions(newCompletedQuestions)
  }

  // Handle continue button
  const handleContinue = async () => {
    await submitHandler(questions[currentQuestionIndex].id, selectedOption, flaggedQuestions[currentQuestionIndex])
    setSelectedOption(null)
    setIsAnswered(false)

    // Move to next question  
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/test_progress/${sessionStorage.getItem('course_id')}/submit/`,
          {
            method: "POST",
            headers: {
              "Authorization": `Token ${sessionStorage.getItem('Authorization')}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        if (res.ok){
          toast.success("Quiz submitted successfully")
          router.push(`/course/test-analytics`)
        }
      } catch (error) {
        console.error("Error submitting quiz:", error)
        toast.error("Failed to submit quiz")
      }
    }
  }

  // Handle skip button
  const handleSkip = () => {
    submitHandler(questions[currentQuestionIndex].id, null as any, flaggedQuestions[currentQuestionIndex]) 
    setSelectedOption(null)
    setIsAnswered(false)

    // Mark question as completed (for progress bar)
    const newCompletedQuestions = [...completedQuestions]
    newCompletedQuestions[currentQuestionIndex] = true
    setCompletedQuestions(newCompletedQuestions)

    // Update questions state to reflect skipped status
    setQuestions(prevQuestions => 
      prevQuestions.map((q, idx) => 
        idx === currentQuestionIndex 
          ? { ...q, selectedOption: 10 } // 10 represents skipped
          : q
      )
    )

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // Handle flag button
  const handleFlag = () => {
    const newFlaggedQuestions = [...flaggedQuestions]
    newFlaggedQuestions[currentQuestionIndex] = !newFlaggedQuestions[currentQuestionIndex]
    setFlaggedQuestions(newFlaggedQuestions)

    // Update questions state
    setQuestions(prevQuestions => 
      prevQuestions.map((q, idx) => 
        idx === currentQuestionIndex 
          ? { ...q, isFlagged: !q.isFlagged }
          : q
      )
    )
  }

  // Get question number out of total
  const getQuestionNumber = () => {
    return currentQuestionIndex + 1
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading questions...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <img src="/nothing.png" alt="Error" width={200} height={200} className="mx-auto mb-4" />
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show completion screen
  if (allQuestionsCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            All Questions Completed!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You have successfully answered all {totalQuestions} questions. You can now submit your quiz.
          </p>
          <Link href="/course/result/stats">
            <button className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold">
              Submit Quiz
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Main content */}        
      <div className="flex-1 mx-4 flex flex-col">
        {/* Premium banner */}
        <div className="max-w-5xl mx-auto w-full text-center">
          {/* <p className="text-sm font-bold">Full Test</p> */}
            <p className="sm:text-2xl text-xl font-bold pb-4"> {sessionStorage.getItem('course_name')}</p>

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
               {flaggedQuestions[currentQuestionIndex] ? 
               <>
                <Flag className="h-3 mr-1 w-3 text-yellow-500" strokeWidth={3} />
                <span className="text-sm font-bold text-yellow-500">Flagged</span>
               </>
               :
               <>
                <FlagOffIcon className="h-3 mr-1 w-3" strokeWidth={3} />
                <span className="text-sm font-bold">Flag</span>
               </>
               }
              </div>
              
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
                    selectedOption === idx &&
                      idx === currentQuestion.correctOption &&
                      "bg-green-50 dark:bg-black border-green-200",
                    selectedOption === idx && idx !== currentQuestion.correctOption && "bg-red-50 dark:bg-black border-red-200",
                    !isAnswered && "hover:border-gray-400",
                  )}
                  onClick={() => handleOptionSelect(idx)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-mid text-sm font-semibold border mt-0.5 flex-shrink-0",
                        selectedOption === idx && "",
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
            <div className="w-44 text-sm text-center p-1 text-slate-800 dark:text-slate-300 border font-black border-gray-300 rounded-mid cursor-pointer" 
            onClick={handleContinue}>
              {currentQuestionIndex === questions.length - 1 ? "Continue and Submit" : "Continue"}
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

// Main Component
export default function ResponsiveView() {
  return (
    <SupportModalProvider>
      <ModalProvider>
        <QuizPage />
      </ModalProvider>
    </SupportModalProvider>
  )
}

