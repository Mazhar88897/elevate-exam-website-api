'use client'

import { useState, useEffect, useRef } from 'react'
import { Flag, AlertTriangle, SkipForward, ChevronRight, CheckCircle2, FlagOffIcon, XIcon, Loader2 } from "lucide-react"
import Access from "@/components/dashboardItems/access"
import Link from "next/link"
import { useSupportModal } from "@/components/dashboardItems/support-modal"
import { ModalProvider, useModal } from "@/components/dashboardItems/note"
import { SupportModalProvider } from "@/components/dashboardItems/support-modal"
import * as React from "react"
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import * as ProgressPrimitive from "@radix-ui/react-progress"

// Utility function for class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

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

function QuizPage() {
  const { openSupportModal } = useSupportModal()
  const { openModal } = useModal()
  const router = useRouter()
  
  // State for API data
  const [questions, setQuestions] = useState<Question[]>([])
  const [progressData, setProgressData] = useState<ProgressApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasShownMessage = useRef(false)
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [completedQuestions, setCompletedQuestions] = useState<boolean[]>([])
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([])
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false)
  const [showQuitModal, setShowQuitModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showStartModal, setShowStartModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  
  // Fetch questions from API 1
  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/courses/${sessionStorage.getItem('course_id')}/full_test_page/`, {
        headers: {
          'Authorization': `${sessionStorage.getItem('Authorization')}`
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
          "Authorization": `${sessionStorage.getItem('Authorization')}`
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
          'Authorization': `${sessionStorage.getItem('Authorization')}`
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
          // Mark as completed if it has any option selected (attempted, including skipped)
          return progressQ?.selected_option !== null && progressQ?.selected_option !== undefined
        })
        setCompletedQuestions(newCompletedQuestions)
        
        // Update flagged questions
        const newFlaggedQuestions = prevQuestions.map(q => {
          const progressQ = data.questions.find(pq => pq.question === q.id)
          return progressQ?.is_flagged || false
        })
        setFlaggedQuestions(newFlaggedQuestions)
        
        // Determine starting question based on last_viewed_question ID
        let startingIndex = 0
        
        if (data.last_viewed_question !== null && data.last_viewed_question !== undefined) {
          // Find the index of the question with ID matching last_viewed_question
          const lastViewedIndex = prevQuestions.findIndex(q => q.id === data.last_viewed_question)
          if (lastViewedIndex !== -1) {
            // Start from the question after the last viewed question
            const nextIndex = lastViewedIndex + 1
            if (nextIndex < prevQuestions.length) {
              startingIndex = nextIndex
            } else {
              // If last viewed was the last question, stay on it
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
        
        // Set current question index and restore its state
        setCurrentQuestionIndex(startingIndex)
        const startingQuestion = prevQuestions[startingIndex]
        if (startingQuestion) {
          const progressQ = data.questions.find(pq => pq.question === startingQuestion.id)
          // Check if it has a valid answer (0-3), not skipped
          if (progressQ?.selected_option !== null && progressQ?.selected_option !== undefined && 
              progressQ.selected_option >= 0 && progressQ.selected_option <= 3) {
            setSelectedOption(progressQ.selected_option)
            setIsAnswered(true)
          } else {
            setSelectedOption(null)
            setIsAnswered(false)
          }
        }
        
        return prevQuestions
      })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress')
    }
  }

  // Load data on component mount
  const hasFetchedDataRef = useRef(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchQuestions()
      await fetchProgress()
      setLoading(false)
    }

    if (!hasFetchedDataRef.current) {
      hasFetchedDataRef.current = true
      loadData()
    }
  }, [])

  // Show start/continue modal when data is loaded
  useEffect(() => {
    if (!loading && questions.length > 0 && !hasShownMessage.current) {
      // Wait a bit for progressData to be set (it might be null for new tests)
      const timer = setTimeout(() => {
        setShowStartModal(true)
        hasShownMessage.current = true
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [loading, questions.length])

  // Close start modal handler
  const closeStartModal = () => {
    setShowStartModal(false)
  }

  // Handle cancel - redirect to course page
  const handleCancel = () => {
    const course_id = sessionStorage.getItem('course_id')
    if (course_id) {
      router.push(`/course/${course_id}`)
    }
  }

  // Current question data
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const [hundredPercentProgress, setHundredPercentProgress] = useState(false)
  // Navigate to specific question
  const navigateToQuestion = (questionIdx: number) => {
    setCurrentQuestionIndex(questionIdx)
    setSelectedOption(questions[questionIdx]?.selectedOption || null)
    setIsAnswered(questions[questionIdx]?.selectedOption !== null)
  }

  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    // Allow changing selection - if clicking the same option, deselect it
    if (selectedOption === optionIndex) {
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      setSelectedOption(optionIndex)
      setIsAnswered(true)
    }

    // Update questions state
    setQuestions(prevQuestions => 
      prevQuestions.map((q, idx) => 
        idx === currentQuestionIndex 
          ? { ...q, selectedOption: optionIndex === selectedOption ? null : optionIndex }
          : q
      )
    )

    // Mark question as completed if an option is selected
    const newCompletedQuestions = [...completedQuestions]
    newCompletedQuestions[currentQuestionIndex] = optionIndex !== selectedOption && optionIndex !== null
    setCompletedQuestions(newCompletedQuestions)
  }

  // Handle continue button
  const handleContinue = async () => {
    setIsSubmitting(true)
    try {
      await submitHandler(questions[currentQuestionIndex].id, selectedOption, flaggedQuestions[currentQuestionIndex])
      setSelectedOption(null)
      setIsAnswered(false)

      // Move to next question  
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        setHundredPercentProgress(true)
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/test_progress/${sessionStorage.getItem('course_id')}/submit/`,
            {
              method: "POST",
              headers: {
                "Authorization": `${sessionStorage.getItem('Authorization')}`,
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
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle skip button
  const handleSkip = async () => {
    await submitHandler(questions[currentQuestionIndex].id, null as any, flaggedQuestions[currentQuestionIndex]) 
    setSelectedOption(null)
    setIsAnswered(false)

    // Mark question as completed
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

    // Move to next question or submit if it's the last question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // If it's the last question, show submit confirmation modal
      handleSubmitQuiz()
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

  // Handle quit quiz button - show confirmation modal
  const handleQuitQuiz = () => {
    setShowQuitModal(true)
  }

  // Confirm quit quiz
  const confirmQuitQuiz = async () => {
    setShowQuitModal(false)
    const course_id = sessionStorage.getItem('course_id')
   
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/test_progress/${course_id}/quit/`, {
      method: "POST",
      headers: {
        "Authorization": `${sessionStorage.getItem('Authorization')}`
      }
    })
    if (response.ok){
      toast.success("Quiz Quitted.")
      router.push(`/course/${course_id}`)
    } else {
      toast.error("Failed to quit quiz")
    }
  }

  // Cancel quit quiz
  const cancelQuitQuiz = () => {
    setShowQuitModal(false)
  }

  // Handle submit quiz button - show confirmation modal
  const handleSubmitQuiz = () => {
    setShowSubmitModal(true)
  }

  // Confirm submit quiz
  const confirmSubmitQuiz = async () => {
    setShowSubmitModal(false)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/test_progress/${sessionStorage.getItem('course_id')}/submit/`, {
        method: "POST",
        headers: {
          "Authorization": `${sessionStorage.getItem('Authorization')}`
        }
      })
      if (response.ok){
        toast.success("Quiz submitted.")
        router.push(`/course/test-analytics`)
      } else {
        console.error("Failed to submit quiz")
        toast.error("Failed to submit quiz")
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast.error("Failed to submit quiz")
    }
  }

  // Cancel submit quiz
  const cancelSubmitQuiz = () => {
    setShowSubmitModal(false)
  }

  // Handle browser navigation/refresh


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
    <>
      {/* Quit Confirmation Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quit Quiz?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to quit? All your progress will be lost and you won&apos;t be able to recover it.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelQuitQuiz}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmQuitQuiz}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold"
              >
                Quit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Submit Quiz?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to submit your quiz? Once submitted, you won&apos;t be able to make any changes to your answers.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelSubmitQuiz}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmitQuiz}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start/Continue Test Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {progressData && progressData.attempted_questions > 0 ? 'Continue Test' : 'Start Test'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You are now going to {progressData && progressData.attempted_questions > 0 ? 'continue' : 'start'} the full test of all the topics and subtopics of the course: <span className="font-semibold text-gray-900 dark:text-white">{sessionStorage.getItem('course_name') || 'the course'}</span>
            </p>
            <div className="flex gap-3 justify-between items-center">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={closeStartModal}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Main content */}        
        <div className="flex-1 mx-4 flex flex-col">

           
        {/* Premium banner */}
        <div className="max-w-5xl mx-auto w-full text-center">
          {/* <Progress value={getQuestionNumber()} className="h-1.5 bg-gray-200 rounded-mid" /> */}
       
          <p className="sm:text-2xl text-xl font-bold pb-4"> {sessionStorage.getItem('course_name')}</p>
        </div>

        {/* Question content */}
        <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
          <div className="mb-4">
            <Progress value={(getQuestionNumber()-1)/totalQuestions*100} className="h-1.5 bg-gray-200 rounded-mid" />
          </div>
          <div className="flex justify-between flex-wrap items-center mb-4">
            <div className="hidden sm:block text-sm font-black text-gray-600 dark:text-gray-300">
              Question <span className="text-green-600">{getQuestionNumber()}</span> of <span className="text-green-600">{totalQuestions}</span> 
            </div>
            <div className="block sm:hidden text-sm font-black text-gray-600 dark:text-gray-300">
            Q <span className="text-green-600">{getQuestionNumber()}</span> of <span className="text-green-600">{totalQuestions}</span> 
            </div>
            <div className="flex space-x-2">
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
                <Flag className="h-3 mr-1 w-3 text-xcolor" strokeWidth={3} />
                <span className="text-sm font-bold text-xcolor">Flagged</span>
               </>
               :
               <>
                <FlagOffIcon className="h-3 mr-1 w-3" strokeWidth={3} />
                <span className="text-sm font-bold">Flag</span>
               </>
               }
              </div>
              <div className="text-gray-600 dark:text-gray-300 flex items-center cursor-pointer" onClick={handleQuitQuiz}>
                <span className="text-sm font-bold">Quit</span>
                <XIcon className="h-3 w-3" strokeWidth={3} />
              </div>
              <div className="text-gray-600 dark:text-gray-300 flex items-center cursor-pointer" onClick={handleSubmitQuiz}>
                <span className="text-sm font-bold">  Submit </span>
                <ChevronRight className="h-3 w-3" strokeWidth={3} />
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
                    "border rounded-md p-3 cursor-pointer transition-colors",
                    selectedOption === idx 
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500" 
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
                  )}
                  onClick={() => handleOptionSelect(idx)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-mid text-sm font-semibold border mt-0.5 flex-shrink-0 transition-colors",
                        selectedOption === idx 
                          ? "border-blue-500 " 
                          : "border-gray-400 dark:border-gray-500",
                      )}
                    />
                    <div className={cn(
                      "text-sm font-semibold",
                      selectedOption === idx 
                        ? "text-blue-700 dark:text-blue-300" 
                        : "text-gray-800 dark:text-gray-200"
                    )}>{option}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Explanation */}
           
          </div>

          {/* Continue button */}
          {isAnswered && (
            <div 
              className={`w-44 text-sm text-center p-1 text-slate-800 dark:text-slate-300 border font-black border-gray-300 rounded-mid flex items-center justify-center gap-2 ${
                isSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              }`}
              onClick={!isSubmitting ? handleContinue : undefined}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {/* <span>Loading...</span> */}
                </>
              ) : (
                currentQuestionIndex === questions.length - 1 ? "Continue and Submit" : "Continue"
              )}
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
    </>
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

