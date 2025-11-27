'use client'

import { useState, useEffect } from 'react'
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { AlertTriangle, SkipForward, ChevronDown, ChevronRight, CheckCircle2, ArrowRightToLineIcon, ArrowLeftToLineIcon, Paperclip, Send, Sparkles, FileCheck2, Flag, FlagOffIcon, XIcon, Loader2, BookOpen, HelpCircle, StickyNote  } from "lucide-react"
import Access from "@/components/dashboardItems/access"
import Link from "next/link"
import { useSupportModal, SupportModalProvider } from "@/components/dashboardItems/support-modal"
import { ModalProvider, useModal } from "@/components/dashboardItems/note"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from '@/components/ui/button'
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

// Course data structure
export interface Question {
  question: string;
  options: string[];
  correctOption: string;
  explanation: string;
}

export interface SubChapter {
  name: string;
  questions: Question[];
}

export interface Chapter {
  name: string;
  subChapters: SubChapter[];
}

export interface Course {
  courseName: string;
  chapters: Chapter[];
}

// Topics Component Props Interface
interface TopicsProps {
  course: Course;
  currentChapterIndex: number;
  currentSubChapterIndex: number;
  chapterProgress: number[];
  completedQuestions: boolean[][][];
  expandedChapters: boolean[];
  onToggleChapter: (index: number) => void;
  onNavigateToQuestion: (chapterIdx: number, subChapterIdx: number, questionIdx: number) => void;
  progress: number;
}

// API Interfaces
interface ApiQuestion {
  id: number;
  text: string;
  option0: string;
  option1: string;
  option2: string;
  option3: string;
  correct_option: number;
  explanation: string;
}

interface ApiSubtopic {
  id: number;
  name: string;
  question_count: number;
  questions: ApiQuestion[];
}

interface ApiChapter {
  id: number;
  name: string;
  subtopics: ApiSubtopic[];
}

interface ApiQuestionsResponse {
  id: number;
  name: string;
  total_questions: number;
  chapters: ApiChapter[];
}

interface ApiProgressQuestion {
  id: number;
  question: number;
  selected_option: number | null;
  is_flagged: boolean;
}

interface ApiProgressSubtopic {
  id: number;
  subtopic: number;
  attempted_questions: number;
  questions: ApiProgressQuestion[];
}

interface ApiProgressChapter {
  id: number;
  chapter: number;
  attempted_questions: number;
  subtopics: ApiProgressSubtopic[];
}

interface ApiProgressResponse {
  id: number;
  course: number;
  attempted_questions: number;
  flagged_count: number;
  skipped_count: number;
  correct_count: number;
  last_viewed_question: number | null;
  is_submitted: boolean;
  chapters: ApiProgressChapter[];
}

// Mobile Courses Component
function MobileCoursesView({
  course,
  currentChapterIndex,
  currentSubChapterIndex,
  chapterProgress,
  completedQuestions,
  expandedChapters,
  onToggleChapter,
  onNavigateToQuestion,
  progress,
  apiQuestions,
  apiSubtopicProgress
}: TopicsProps & { apiQuestions: ApiQuestionsResponse | null, apiSubtopicProgress: Record<string, number> }) {
  // Calculate subchapter progress
  const getSubChapterProgress = (chapterIdx: number, subChapterIdx: number) => {
    const subChapter = course.chapters[chapterIdx].subChapters[subChapterIdx]
    
    // Try to get from API progress first using IDs
    if (apiQuestions && apiSubtopicProgress) {
      const questionChapter = apiQuestions.chapters[chapterIdx]
      const questionSubtopic = questionChapter?.subtopics[subChapterIdx]
      
      if (questionChapter && questionSubtopic) {
        const key = `${questionChapter.id}_${questionSubtopic.id}`
        const attemptedQuestions = apiSubtopicProgress[key]
        
        if (typeof attemptedQuestions === 'number') {
          return `${attemptedQuestions}/${subChapter.questions.length}`
        }
      }
    }
    
    // Fallback to local state
    const completed = completedQuestions[chapterIdx]?.[subChapterIdx]?.filter(Boolean).length || 0
    return `${completed}/${subChapter.questions.length}`
  }

  // Check if a subchapter is complete
  const isSubChapterComplete = (chapterIdx: number, subChapterIdx: number) => {
    return completedQuestions[chapterIdx]?.[subChapterIdx]?.every(Boolean) || false
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg mb-2">{course.courseName}</h2>
        <Progress value={progress} className="h-2 bg-gray-200" />
      </div>

      {/* Chapter list - scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {course.chapters.map((chapter, chapterIdx) => (
            <div key={chapterIdx} className="space-y-2">
              {/* Chapter header */}
              <button
                className="flex items-center justify-between w-full py-3 px-3 text-left rounded-lg border transition-colors bg-gray-50 dark:bg-gray-800"
                onClick={() => onToggleChapter(chapterIdx)}
              >
                <div className="flex items-center gap-2 flex-1">
                  {expandedChapters[chapterIdx] ? (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                  <span className="text-sm font-semibold flex-1">{chapter.name}</span>
                </div>
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-2",
                    chapterProgress[chapterIdx] === 100 ? "bg-green-500 text-white" : "border-2 border-gray-300",
                  )}
                >
                  {chapterProgress[chapterIdx] === 100 && <CheckCircle2 className="h-4 w-4" />}
                </div>
              </button>

              {/* Chapter progress bar */}
              <div className="px-3">
                <Progress value={chapterProgress[chapterIdx]} className="h-1.5 bg-gray-200" />
              </div>

              {/* Subchapters */}
              {expandedChapters[chapterIdx] && (
                <div className="ml-4 mt-2 space-y-2">
                  {chapter.subChapters.map((subChapter, subChapterIdx) => (
                    <div
                      key={subChapterIdx}
                      className={cn(
                        "py-2.5 px-3 rounded-lg cursor-pointer border transition-colors",
                        currentChapterIndex === chapterIdx && currentSubChapterIndex === subChapterIdx
                          ? "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700"
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
                      )}
                      onClick={() => onNavigateToQuestion(chapterIdx, subChapterIdx, 0)}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-sm font-medium flex-1",
                          currentChapterIndex === chapterIdx && currentSubChapterIndex === subChapterIdx
                            ? "text-green-700 dark:text-green-300"
                            : "text-gray-700 dark:text-gray-300"
                        )}>
                          {subChapter.name}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-semibold ml-2",
                            isSubChapterComplete(chapterIdx, subChapterIdx)
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-500 dark:text-gray-400",
                          )}
                        >
                          {getSubChapterProgress(chapterIdx, subChapterIdx)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function QuizPage() {
  // Course data
  const router = useRouter()
  const { openSupportModal } = useSupportModal()
  
  // API state
  const [apiQuestions, setApiQuestions] = useState<ApiQuestionsResponse | null>(null)
  const [apiProgress, setApiProgress] = useState<ApiProgressResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Course data - will be populated from API
  const [course, setCourse] = useState<Course>({
    courseName: "Loading...",
    chapters: []
  })

  // State
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [currentSubChapterIndex, setCurrentSubChapterIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [progress, setProgress] = useState(0)
  const [chapterProgress, setChapterProgress] = useState<number[]>([])
  const [expandedChapters, setExpandedChapters] = useState<boolean[]>([])
  const [completedQuestions, setCompletedQuestions] = useState<boolean[][][]>([])
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[][][]>([])
  
  // Additional state for API sync
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<number, number>>({})
  
  // Store API attempted_questions for subtopics to calculate subchapter progress
  const [apiSubtopicProgress, setApiSubtopicProgress] = useState<Record<string, number>>({})
  
  // Track if progress has been initialized from API
  const [progressInitializedFromAPI, setProgressInitializedFromAPI] = useState(false)
  const [shouldUpdateProgress, setShouldUpdateProgress] = useState(false)
  
  // Additional state for right panel
  const { openModal } = useModal()
  // Mobile tab navigation state
  const [activeTab, setActiveTab] = useState<"courses" | "quiz" | "ai" | "note">("quiz")
  
  // Debug: Log state values
 

  // Fetch questions from API
  const fetchQuestions = async (): Promise<ApiQuestionsResponse | null> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/courses/${sessionStorage.getItem('course_id')}/question_page/`, {
        headers: {
          'Authorization': `${sessionStorage.getItem('Authorization')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }
      
      const data: ApiQuestionsResponse = await response.json()
      setApiQuestions(data)
      
      // Transform API data to local format
      const transformedCourse: Course = {
        courseName: data.name,
        chapters: data.chapters.map(chapter => ({
          name: chapter.name,
          subChapters: chapter.subtopics.map(subtopic => ({
            name: subtopic.name,
            questions: subtopic.questions.map(q => ({
              question: q.text,
              options: [q.option0, q.option1, q.option2, q.option3],
              correctOption: [q.option0, q.option1, q.option2, q.option3][q.correct_option],
              explanation: q.explanation
            }))
          }))
        }))
      }
      
      setCourse(transformedCourse)
      
      // Initialize state arrays based on new course structure
      setExpandedChapters(Array(transformedCourse.chapters.length).fill(false))
      setCompletedQuestions(
        transformedCourse.chapters.map((chapter) =>
          chapter.subChapters.map((subChapter) => Array(subChapter.questions.length).fill(false)),
        ),
      )
      setFlaggedQuestions(
        transformedCourse.chapters.map((chapter) =>
          chapter.subChapters.map((subChapter) => Array(subChapter.questions.length).fill(false)),
        ),
      )
      setChapterProgress(transformedCourse.chapters.map(() => 0))
      
      return data
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions')
      setLoading(false)
      return null
    }
  }

  // Fetch progress from API
  const fetchProgress = async (questionsData: ApiQuestionsResponse | null = null) => {
    try {
      console.log('=== FETCHING PROGRESS ===')
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz_progress/${sessionStorage.getItem('course_id')}/progress/`, {
        headers: {
          'Authorization': `${sessionStorage.getItem('Authorization')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress')
      }
      
      const data: ApiProgressResponse = await response.json()
      console.log('Progress API response:', data)
      setApiProgress(data)
      
      // Build a map of question IDs to their progress
      const progressMap: Record<number, { selectedOption: number | null, isFlagged: boolean }> = {}
      
      // Build a map of subtopic attempted_questions for progress display
      const subtopicProgressMap: Record<string, number> = {}
      
      // Use the passed questionsData or fall back to state
      const questionsToUse = questionsData || apiQuestions
      
      // First, find matching chapters in questions API by chapter ID
      console.log('questionsToUse available:', !!questionsToUse)
      if (questionsToUse) {
        console.log('questionsToUse.chapters:', questionsToUse.chapters.length)
        questionsToUse.chapters.forEach(questionChapter => {
          console.log(`Looking for chapter ID ${questionChapter.id} in progress data...`)
          const matchingProgressChapter = data.chapters.find(pc => pc.chapter === questionChapter.id)
          console.log(`Matching chapter found:`, matchingProgressChapter)
          if (matchingProgressChapter) {
            questionChapter.subtopics.forEach(questionSubtopic => {
              console.log(`Looking for subtopic ID ${questionSubtopic.id} in chapter...`)
              const matchingProgressSubtopic = matchingProgressChapter.subtopics.find(ps => ps.subtopic === questionSubtopic.id)
              console.log(`Matching subtopic found:`, matchingProgressSubtopic)
              if (matchingProgressSubtopic) {
                // Store using question API IDs
                const key = `${questionChapter.id}_${questionSubtopic.id}`
                subtopicProgressMap[key] = matchingProgressSubtopic.attempted_questions
                console.log(`Stored subtopic progress: ${key} = ${matchingProgressSubtopic.attempted_questions}`)
              }
            })
          }
        })
      }
      
      data.chapters.forEach(apiChapter => {
        apiChapter.subtopics.forEach(apiSubtopic => {
          
          apiSubtopic.questions.forEach(apiQuestion => {
            progressMap[apiQuestion.question] = {
              selectedOption: apiQuestion.selected_option,
              isFlagged: apiQuestion.is_flagged
            }
          })
        })
      })
      
      console.log('Subtopic progress map:', subtopicProgressMap)
      setApiSubtopicProgress(subtopicProgressMap)
      
      // Update completed and flagged questions based on progress
      if (questionsToUse) {
        setCompletedQuestions(prevCompleted => {
          const newCompleted = questionsToUse.chapters.map((chapter, chapterIdx) =>
            chapter.subtopics.map((subtopic, subtopicIdx) =>
              subtopic.questions.map((question, questionIdx) => {
                const progress = progressMap[question.id]
                return progress?.selectedOption !== null && progress?.selectedOption !== undefined
              })
            )
          )
          return newCompleted
        })
        
        setFlaggedQuestions(prevFlagged => {
          const newFlagged = questionsToUse.chapters.map((chapter) =>
            chapter.subtopics.map((subtopic) =>
              subtopic.questions.map((question) => {
                const progress = progressMap[question.id]
                return progress?.isFlagged || false
              })
            )
          )
          return newFlagged
        })
        
        // Set selected options map
        const optionsMap: Record<number, number> = {}
        Object.entries(progressMap).forEach(([questionId, progress]) => {
          if (progress.selectedOption !== null) {
            optionsMap[parseInt(questionId)] = progress.selectedOption
          }
        })
        setSelectedOptionsMap(optionsMap)
        
        // Set overall progress from API
        if (questionsToUse) {
          const totalQuestions = questionsToUse.total_questions
          const attemptedQuestions = data.attempted_questions
          const progressValue = totalQuestions > 0 ? (attemptedQuestions / totalQuestions) * 100 : 0
          console.log('Setting progress from API:', { attemptedQuestions, totalQuestions, progressValue })
          setProgress(progressValue)
          
          // Set chapter progress from API - match by chapter ID, not index
          const newChapterProgress = questionsToUse.chapters.map((chapter, chapterIdx) => {
            // Find matching chapter in progress API by ID
            const apiChapterData = data.chapters.find(pc => pc.chapter === chapter.id)
            if (!apiChapterData) return 0
            
            const totalChapterQuestions = chapter.subtopics.reduce(
              (sum, subtopic) => sum + subtopic.questions.length,
              0
            )
            const chapterProgressValue = totalChapterQuestions > 0 
              ? (apiChapterData.attempted_questions / totalChapterQuestions) * 100 
              : 0
            console.log(`Chapter ${chapter.name} progress:`, { 
              attempted: apiChapterData.attempted_questions, 
              total: totalChapterQuestions, 
              progress: chapterProgressValue 
            })
            return chapterProgressValue
          })
          console.log('All chapter progress:', newChapterProgress)
          setChapterProgress(newChapterProgress)
          setProgressInitializedFromAPI(true) // Mark as initialized from API
          
          // Allow progress to update from local state after 100ms
          setTimeout(() => {
            setShouldUpdateProgress(true)
          }, 100)
        }
        
        // Determine starting position
        if (data.last_viewed_question !== null && data.last_viewed_question !== undefined && questionsToUse) {
          // Find the question in the structure
          let chapterIdx = 0
          let subtopicIdx = 0
          let questionIdx = 0
          let found = false
          
          for (let c = 0; c < questionsToUse.chapters.length; c++) {
            for (let s = 0; s < questionsToUse.chapters[c].subtopics.length; s++) {
              for (let q = 0; q < questionsToUse.chapters[c].subtopics[s].questions.length; q++) {
                if (questionsToUse.chapters[c].subtopics[s].questions[q].id === data.last_viewed_question) {
                  chapterIdx = c
                  subtopicIdx = s
                  questionIdx = q
                  found = true
                  break
                }
              }
              if (found) break
            }
            if (found) break
          }
          
          if (found) {
            // Find next unanswered question
            let nextChapterIdx = chapterIdx
            let nextSubtopicIdx = subtopicIdx
            let nextQuestionIdx = questionIdx
            
            // Start from next question after last viewed
            nextQuestionIdx++
            
            if (nextQuestionIdx >= questionsToUse.chapters[nextChapterIdx].subtopics[nextSubtopicIdx].questions.length) {
              nextQuestionIdx = 0
              nextSubtopicIdx++
              
              if (nextSubtopicIdx >= questionsToUse.chapters[nextChapterIdx].subtopics.length) {
                nextSubtopicIdx = 0
                nextChapterIdx++
              }
            }
            
            // Find first unanswered question from this point
            let unansweredFound = false
            for (let c = nextChapterIdx; c < questionsToUse.chapters.length && !unansweredFound; c++) {
              for (let s = (c === nextChapterIdx ? nextSubtopicIdx : 0); s < questionsToUse.chapters[c].subtopics.length && !unansweredFound; s++) {
                for (let q = (c === nextChapterIdx && s === nextSubtopicIdx ? nextQuestionIdx : 0); q < questionsToUse.chapters[c].subtopics[s].questions.length; q++) {
                  const questionId = questionsToUse.chapters[c].subtopics[s].questions[q].id
                  const progress = progressMap[questionId]
                  if (!progress || progress.selectedOption === null) {
                    setCurrentChapterIndex(c)
                    setCurrentSubChapterIndex(s)
                    setCurrentQuestionIndex(q)
                    unansweredFound = true
                    break
                  }
                }
              }
            }
            
            // If all questions answered, go to last viewed
            if (!unansweredFound && found) {
              setCurrentChapterIndex(chapterIdx)
              setCurrentSubChapterIndex(subtopicIdx)
              setCurrentQuestionIndex(questionIdx)
            }
          }
        }
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress')
    }
  }

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const questionsData = await fetchQuestions()
      if (questionsData) {
        await fetchProgress(questionsData)
      }
      setLoading(false)
    }
    
    loadData()
  }, [])

  // Update progress locally when completedQuestions changes (only after API and when user answers)
  // DISABLED: We want to keep showing API progress, not recalculate from completedQuestions
  // useEffect(() => {
  //   if (course.chapters.length === 0) return
  //   if (loading) return // Don't recalculate while loading data from API
  //   if (!progressInitializedFromAPI) return // Don't calculate until API has initialized progress
  //   if (!shouldUpdateProgress) return // Don't recalculate until flag is set
  //   
  //   // Recalculate overall progress based on local state
  //   const completedCount = completedQuestions.flat(2).filter(Boolean).length
  //   const total = course.chapters.reduce(
  //     (sum, chapter) => sum + chapter.subChapters.reduce((subSum, subChapter) => subSum + subChapter.questions.length, 0),
  //     0,
  //   )
  //   
  //   // Only update if we have completed more questions than before
  //   if (completedCount > 0) {
  //     setProgress((completedCount / total) * 100)
  //   }

  //   // Recalculate chapter progress based on local state
  //   const newChapterProgress = course.chapters.map((chapter, chapterIdx) => {
  //     const totalChapterQuestions = chapter.subChapters.reduce(
  //       (sum, subChapter) => sum + subChapter.questions.length,
  //       0,
  //     )

  //     const completedChapterQuestions = completedQuestions[chapterIdx]?.flat().filter(Boolean).length || 0
  //     return totalChapterQuestions > 0 ? (completedChapterQuestions / totalChapterQuestions) * 100 : 0
  //   })

  //   setChapterProgress(newChapterProgress)
  // }, [completedQuestions, course, loading, progressInitializedFromAPI, shouldUpdateProgress])

  // Submit handler
  const submitHandler = async (questionId: number, selectedOption: number | null, isFlagged: boolean) => {
    const payload = {
      question_id: questionId,
      selected_option: selectedOption,
      is_flagged: isFlagged
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz_progress/update_question/`, {
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

  // Current question data
  if (course.chapters.length === 0) {
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
    
    if (error) {
      return (
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="text-center">
            <img src="/something-went-wrong.png" alt="Error" width={200} height={200} className="mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
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
    
    return null
  }
  
  const currentChapter = course.chapters[currentChapterIndex]
  const currentSubChapter = currentChapter.subChapters[currentSubChapterIndex]
  const currentQuestion = currentSubChapter.questions[currentQuestionIndex]

  // Calculate total questions
  const totalQuestions = course.chapters.reduce(
    (sum, chapter) => sum + chapter.subChapters.reduce((subSum, subChapter) => subSum + subChapter.questions.length, 0),
    0,
  )

  // Toggle chapter expansion
  const toggleChapter = (index: number) => {
    const newExpandedChapters = [...expandedChapters]
    newExpandedChapters[index] = !newExpandedChapters[index]
    setExpandedChapters(newExpandedChapters)
  }

  // Navigate to specific question
  const navigateToQuestion = (chapterIdx: number, subChapterIdx: number, questionIdx: number) => {
    setCurrentChapterIndex(chapterIdx)
    setCurrentSubChapterIndex(subChapterIdx)
    setCurrentQuestionIndex(questionIdx)
    setSelectedOption(null)
    setIsAnswered(false)
    // Switch to quiz tab when navigating from courses
    setActiveTab("quiz")
  }

  // Get question ID from API structure
  const getCurrentQuestionId = () => {
    if (!apiQuestions) return null
    const apiChapter = apiQuestions.chapters[currentChapterIndex]
    if (!apiChapter) return null
    const apiSubtopic = apiChapter.subtopics[currentSubChapterIndex]
    if (!apiSubtopic) return null
    const apiQuestion = apiSubtopic.questions[currentQuestionIndex]
    if (!apiQuestion) return null
    return apiQuestion.id
  }

  // Safe getter for flagged questions
  const isQuestionFlagged = () => {
    return flaggedQuestions[currentChapterIndex]?.[currentSubChapterIndex]?.[currentQuestionIndex] || false
  }

  // Safe getter for completed questions
  const isQuestionCompleted = () => {
    return completedQuestions[currentChapterIndex]?.[currentSubChapterIndex]?.[currentQuestionIndex] || false
  }

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    if (isAnswered) return

    setSelectedOption(option)
    setIsAnswered(true)

    // Mark question as completed - ensure arrays exist
    const newCompletedQuestions = [...completedQuestions]
    if (!newCompletedQuestions[currentChapterIndex]) {
      newCompletedQuestions[currentChapterIndex] = []
    }
    if (!newCompletedQuestions[currentChapterIndex][currentSubChapterIndex]) {
      newCompletedQuestions[currentChapterIndex][currentSubChapterIndex] = []
    }
    newCompletedQuestions[currentChapterIndex][currentSubChapterIndex][currentQuestionIndex] = true
    setCompletedQuestions(newCompletedQuestions)

    // Update progress manually
    const completedCount = newCompletedQuestions.flat(2).filter(Boolean).length
    const total = course.chapters.reduce(
      (sum, chapter) => sum + chapter.subChapters.reduce((subSum, subChapter) => subSum + subChapter.questions.length, 0),
      0,
    )
    setProgress((completedCount / total) * 100)
    
    // Update chapter progress
    const newChapterProgress = course.chapters.map((chapter, chapterIdx) => {
      const totalChapterQuestions = chapter.subChapters.reduce(
        (sum, subChapter) => sum + subChapter.questions.length,
        0,
      )
      const completedChapterQuestions = newCompletedQuestions[chapterIdx]?.flat().filter(Boolean).length || 0
      return totalChapterQuestions > 0 ? (completedChapterQuestions / totalChapterQuestions) * 100 : 0
    })
    setChapterProgress(newChapterProgress)
  }

  // Handle continue button
  const handleContinue = async () => {
    // Submit to API before moving to next question
    const questionId = getCurrentQuestionId()
    if (questionId) {
      const optionIndex = selectedOption ? currentQuestion.options.indexOf(selectedOption) : null
      await submitHandler(questionId, optionIndex, isQuestionFlagged())
    }
    
    setSelectedOption(null)
    setIsAnswered(false)

    // Move to next question, subchapter, or chapter
    if (currentQuestionIndex < currentSubChapter.questions.length - 1) {
      // Next question in current subchapter
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (currentSubChapterIndex < currentChapter.subChapters.length - 1) {
      // Next subchapter
      setCurrentSubChapterIndex(currentSubChapterIndex + 1)
      setCurrentQuestionIndex(0)
    } else if (currentChapterIndex < course.chapters.length - 1) {
      // Next chapter
      setCurrentChapterIndex(currentChapterIndex + 1)
      setCurrentSubChapterIndex(0)
      setCurrentQuestionIndex(0)
    }
  }

  // Handle skip button
  const handleSkip = async () => {
    setSelectedOption(null)
    setIsAnswered(false)

    // Submit skip to API
    const questionId = getCurrentQuestionId()
    if (questionId) {
      await submitHandler(questionId, null, isQuestionFlagged())
    }

    // Mark question as completed (for progress bar) - ensure arrays exist
    const newCompletedQuestions = [...completedQuestions]
    if (!newCompletedQuestions[currentChapterIndex]) {
      newCompletedQuestions[currentChapterIndex] = []
    }
    if (!newCompletedQuestions[currentChapterIndex][currentSubChapterIndex]) {
      newCompletedQuestions[currentChapterIndex][currentSubChapterIndex] = []
    }
    newCompletedQuestions[currentChapterIndex][currentSubChapterIndex][currentQuestionIndex] = true
    setCompletedQuestions(newCompletedQuestions)
    
    // Update progress manually
    const completedCount = newCompletedQuestions.flat(2).filter(Boolean).length
    const total = course.chapters.reduce(
      (sum, chapter) => sum + chapter.subChapters.reduce((subSum, subChapter) => subSum + subChapter.questions.length, 0),
      0,
    )
    setProgress((completedCount / total) * 100)
    
    // Update chapter progress
    const newChapterProgress = course.chapters.map((chapter, chapterIdx) => {
      const totalChapterQuestions = chapter.subChapters.reduce(
        (sum, subChapter) => sum + subChapter.questions.length,
        0,
      )
      const completedChapterQuestions = newCompletedQuestions[chapterIdx]?.flat().filter(Boolean).length || 0
      return totalChapterQuestions > 0 ? (completedChapterQuestions / totalChapterQuestions) * 100 : 0
    })
    setChapterProgress(newChapterProgress)

    // Move to next question, subchapter, or chapter
    if (currentQuestionIndex < currentSubChapter.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (currentSubChapterIndex < currentChapter.subChapters.length - 1) {
      setCurrentSubChapterIndex(currentSubChapterIndex + 1)
      setCurrentQuestionIndex(0)
    } else if (currentChapterIndex < course.chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1)
      setCurrentSubChapterIndex(0)
      setCurrentQuestionIndex(0)
    }
  }

  // Handle flag button
  const handleFlag = async () => {
    // Ensure arrays exist
    if (!flaggedQuestions[currentChapterIndex]) {
      const newFlaggedQuestions = [...flaggedQuestions]
      newFlaggedQuestions[currentChapterIndex] = []
      setFlaggedQuestions(newFlaggedQuestions)
    }
    if (!flaggedQuestions[currentChapterIndex][currentSubChapterIndex]) {
      const newFlaggedQuestions = [...flaggedQuestions]
      if (!newFlaggedQuestions[currentChapterIndex]) {
        newFlaggedQuestions[currentChapterIndex] = []
      }
      newFlaggedQuestions[currentChapterIndex][currentSubChapterIndex] = []
      setFlaggedQuestions(newFlaggedQuestions)
    }

    const newFlaggedQuestions = flaggedQuestions.map((chapter, cIdx) =>
      cIdx === currentChapterIndex
        ? chapter.map((subChapter, sIdx) =>
            sIdx === currentSubChapterIndex
              ? subChapter.map((_, qIdx) =>
                  qIdx === currentQuestionIndex
                    ? !subChapter[qIdx]
                    : subChapter[qIdx]
                )
              : subChapter
          )
        : chapter
    )
    
    setFlaggedQuestions(newFlaggedQuestions)
    
    // Submit flag to API
    const questionId = getCurrentQuestionId()
    if (questionId) {
      const currentFlagged = newFlaggedQuestions[currentChapterIndex]?.[currentSubChapterIndex]?.[currentQuestionIndex] || false
      const optionIndex = selectedOption ? currentQuestion.options.indexOf(selectedOption) : null
    //   await submitHandler(questionId, optionIndex, currentFlagged)
    }
  }

  // Get question number out of total
  const getQuestionNumber = () => {
    let questionNumber = 1

    for (let i = 0; i < currentChapterIndex; i++) {
      for (let j = 0; j < course.chapters[i].subChapters.length; j++) {
        questionNumber += course.chapters[i].subChapters[j].questions.length
      }
    }

    for (let j = 0; j < currentSubChapterIndex; j++) {
      questionNumber += currentChapter.subChapters[j].questions.length
    }

    questionNumber += currentQuestionIndex
    return questionNumber
  }

  // Calculate subchapter progress - uses API progress when available
  const getSubChapterProgress = (chapterIdx: number, subChapterIdx: number) => {
    const subChapter = course.chapters[chapterIdx].subChapters[subChapterIdx]
    
    // Try to get from API progress first using IDs
    if (apiQuestions && apiProgress && apiSubtopicProgress) {
      const questionChapter = apiQuestions.chapters[chapterIdx]
      const questionSubtopic = questionChapter?.subtopics[subChapterIdx]
      
      if (questionChapter && questionSubtopic) {
        const key = `${questionChapter.id}_${questionSubtopic.id}`
        const attemptedQuestions = apiSubtopicProgress[key]
        
        console.log(`Subtopic ${questionSubtopic.name} key: ${key}, attempted: ${attemptedQuestions}`)
        
        if (typeof attemptedQuestions === 'number') {
          return `${attemptedQuestions}/${subChapter.questions.length}`
        }
      }
    }
    
    // Fallback to local state
    const completed = completedQuestions[chapterIdx]?.[subChapterIdx]?.filter(Boolean).length || 0
    console.log(`Subtopic ${chapterIdx}-${subChapterIdx} using local state: ${completed}/${subChapter.questions.length}`)
    return `${completed}/${subChapter.questions.length}`
  }

  // Check if a subchapter is complete
  const isSubChapterComplete = (chapterIdx: number, subChapterIdx: number) => {
    return completedQuestions[chapterIdx][subChapterIdx].every(Boolean)
  }

  const  handleSubmitQuiz = async () => {
   
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz_progress/${sessionStorage.getItem('course_id')}/submit/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${sessionStorage.getItem('Authorization')}`
      },
    })  
    if (response.ok) {
      toast.success("Quiz submitted.")
      router.push(`/course/quiz-analytics`)
    } else {
      toast.error("Failed to submit quiz")
    }
  } 

  // Handle quit quiz button - show confirmation modal
  const handleQuitQuiz = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz_progress/${sessionStorage.getItem('course_id')}/quit/`, {
      method: "POST",
      headers: {
        "Authorization": `${sessionStorage.getItem('Authorization')}`
      }
    })
    if (response.ok){
    toast.success("Quiz quitted successfully")
    router.push(`/course/${sessionStorage.getItem('course_id')}`)
    } else {
      console.error("Failed to quit quiz")
    } 
  }



  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white dark:bg-gray-900">
      {/* Top tab navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 safe-area-top">
        <div className="flex items-center justify-around h-16">
          <button
            onClick={() => setActiveTab("courses")}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-colors",
              activeTab === "courses" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
            )}
          >
            <BookOpen className={cn("h-5 w-5 mb-1", activeTab === "courses" && "text-green-600 dark:text-green-400")} />
            <span className="text-xs font-semibold">Courses</span>
          </button>
          
          <button
            onClick={() => setActiveTab("quiz")}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-colors",
              activeTab === "quiz" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
            )}
          >
            <HelpCircle className={cn("h-5 w-5 mb-1", activeTab === "quiz" && "text-green-600 dark:text-green-400")} />
            <span className="text-xs font-semibold">Quiz</span>
          </button>
          
          <button
            onClick={() => setActiveTab("ai")}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-colors",
              activeTab === "ai" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
            )}
          >
            <Sparkles className={cn("h-5 w-5 mb-1", activeTab === "ai" && "text-green-600 dark:text-green-400")} />
            <span className="text-xs font-semibold">AI</span>
          </button>
          
          <button
            onClick={() => setActiveTab("note")}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-colors",
              activeTab === "note" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
            )}
          >
            <StickyNote className={cn("h-5 w-5 mb-1", activeTab === "note" && "text-green-600 dark:text-green-400")} />
            <span className="text-xs font-semibold">Note</span>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Tab content */}
        {activeTab === "courses" && (
          <MobileCoursesView
            course={course}
            currentChapterIndex={currentChapterIndex}
            currentSubChapterIndex={currentSubChapterIndex}
            chapterProgress={chapterProgress}
            completedQuestions={completedQuestions}
            expandedChapters={expandedChapters}
            onToggleChapter={toggleChapter}
            onNavigateToQuestion={navigateToQuestion}
            progress={progress}
            apiQuestions={apiQuestions}
            apiSubtopicProgress={apiSubtopicProgress}
          />
        )}

        {activeTab === "quiz" && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Progress bar */}
            <div className="w-full px-4 pt-4 pb-2">
              <Progress value={progress} className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full" />
            </div>

            {/* Question content */}
            <div className="flex-1 p-4 pb-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-black text-gray-600 dark:text-gray-300">
                  Q<span className="text-green-600">{getQuestionNumber()}</span> of <span className="text-green-600">{totalQuestions}</span> 
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-600 dark:text-gray-300 flex items-center cursor-pointer" onClick={handleSkip}>
                    <SkipForward className="h-4 mr-1 w-4" strokeWidth={3} />
                    <span className="text-xs font-bold">Skip</span>
                  </button>
                  <button
                    className={cn(
                      "text-gray-600 dark:text-gray-300 flex items-center cursor-pointer",
                    )}
                    onClick={handleFlag}
                  >
                    {isQuestionFlagged() ? (
                      <div className="flex items-center">
                        <Flag className="h-4 mr-1 w-4 text-xcolor" strokeWidth={3} />
                        <span className="text-xs font-bold text-xcolor">Flagged</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <FlagOffIcon className="h-4 mr-1 w-4" strokeWidth={3} />
                        <span className="text-xs font-bold">Flag</span>
                      </div>
                    )}
                  </button>
                  <button className="text-gray-600 dark:text-gray-300 flex items-center cursor-pointer" onClick={handleSubmitQuiz}> <ArrowRightToLineIcon className="h-4 mr-1 w-4" strokeWidth={3} /> <span className="text-xs font-bold">Submit</span>  </button>
                  <button className="text-gray-600 dark:text-gray-300 flex items-center cursor-pointer" onClick={handleQuitQuiz}> <XIcon className="h-4 mr-1 w-4" strokeWidth={3} /> <span className="text-xs font-bold">Quit</span>  </button>
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
                    <div className=" text-sm font-semibold">{option}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Explanation */}
            {isAnswered && (
              <div className="mt-4 bg-green-50 dark:bg-black border border-green-200 rounded-md p-4">
                <h3 className="font-semibold text-sm mb-2">Explanation:</h3>
                <p className="font-semibold text-sm ">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          {/* Continue button */}
          {isAnswered && (
            <div className="w-32 text-sm text-center p-1 text-slate-800 dark:text-slate-300 border font-black border-gray-300 rounded-mid" onClick={handleContinue}>
              Continue
            </div>
          )}
          


          {/* Report issue */}
          <div className="mt-8 text-sm text-gray-500 flex items-center gap-1">
            <span className="text-xs text-gray-700 dark:text-slate-300 font-bold">have issue in this question?</span>
            <button onClick={openSupportModal}  className="text-black dark:text-white text-xs font-black flex items-center gap-1">
              report an issue
              <AlertTriangle className="h-3 w-3" />
            </button>
          </div>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        )}

        {activeTab === "note" && (
          <div className="flex-1 overflow-y-auto">
            <Notes />
          </div>
        )}
      </div>
    </div>
  )   
}
  

interface Message {
  id: string
  role: "user" | "assistant"
  content: string | React.ReactNode
  isThinking?: boolean
}

function ChatInterface() {
  const initialMessages: Message[] = [
    {
      id: "1",
      role: "user",
      content: "How do I retrieve a push token on a device?",
    },
    {
      id: "2",
      role: "assistant",
      content: (
        <>
          <p className="mb-2">
            To retrieve a push token on a device using React Native, you typically follow these steps:
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              <span className="font-bold">Install Required Packages:</span>{" "}
              {"Ensure you have the Expo SDK or the necessary libraries for push notifications installed, like "}
              <span className="underline">expo-notifications</span>.
            </li>
            <li>
              <span className="font-bold">Request Permissions:</span>{" "}
              {"Before retrieving the push token, request the user's permission"}
            </li>
          </ol>
        </>
      ),
    },
  ]

  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() === "") return

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prevMessages) => [...prevMessages, newUserMessage])
    setInput("")

    // Add thinking message
    const thinkingMessageId = (Date.now() + 1).toString()
    const thinkingMessage: Message = {
      id: thinkingMessageId,
      role: "assistant",
      content: "Thinking...",
      isThinking: true,
    }
    setMessages((prevMessages) => [...prevMessages, thinkingMessage])

    // Simulate AI response after a delay
    await new Promise((resolve) => setTimeout(resolve, 2000)) // 2 second delay

    const aiResponseContent = (
      <>
        <p className="mb-2">
          To retrieve a push token on a device using React Native, you typically follow these steps:
        </p>
        <ol className="list-decimal list-inside space-y-1">
          <li>
            <span className="font-bold">Install Required Packages:</span>{" "}
            {"Ensure you have the Expo SDK or the necessary libraries for push notifications installed, like "}
            <span className="underline">expo-notifications</span>.
          </li>
          <li>
            <span className="font-bold">Request Permissions:</span>{" "}
            {"Before retrieving the push token, request the user's permission"}
          </li>
        </ol>
      </>
    )

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === thinkingMessageId ? { ...msg, content: aiResponseContent, isThinking: false } : msg,
      ),
    )
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto    overflow-hidden">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Date separator */}
        <div className="relative flex items-center justify-center my-4">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-sm text-gray-500">Sunday, Jul 13</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`${
                message.role === "user" ? "bg-[#f0f0ff] dark:bg-xcolor" : "bg-gray-100 text-gray-800 dark:text-white  dark:bg-[#111111]"
              } rounded-lg p-3 ${message.role === "user" ? "max-w-[75%]" : "max-w-[85%]"} ${message.isThinking ? "animate-pulse" : ""}`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {/* <div ref={messagesEndRef} /> Scroll anchor */}
      </div>

      {/* Input area */}
      <div className="p-4 border-t flex items-center gap-2">
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Paperclip className="w-5 h-5" />
        </button>
        <Input
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Ask a question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleSendMessage} className="bg-xcolor text-white px-3 py-2 rounded flex items-center justify-center">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function Notes() {  
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    
    // Validate fields
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill these fields first")
      return
    }
    
    setSubmitLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/notes/`, {
        method: 'POST',
        headers: {
          'Authorization': `${sessionStorage.getItem('Authorization')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
        }),
      })
      if (response.ok) {
        toast.success("Note added.")
        setTitle("")
        setContent("")
      } else {
        console.error("Failed to add note")
      }
    } catch (error) {
      console.error("Error adding note:", error)
      }
    setSubmitLoading(false)
}
return(
  <div className='p-4'>
<form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
<div>
  <label className="block text-sm font-bold mb-1">Title</label>
  <Input className="w-full" placeholder="Enter note title" value={title} onChange={(e) => setTitle(e.target.value)} />
</div>
<div>
  <label className="block text-sm font-bold mb-1">Description</label>
  <Textarea className="w-full min-h-[80px]" placeholder="Enter note description" value={content} onChange={(e) => setContent(e.target.value)} />
</div>
<button type="submit" className=" text-black dark:text-white  border border-black dark:border-white px-3 py-1 font-bold text-sm rounded self-end w-40 h-8 flex items-center justify-center"> {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Note"}</button>
</form>

</div>
)}

const DeskTopQuizView = () => {
  return (
    <SupportModalProvider>
      <ModalProvider>
        <QuizPage/>
      </ModalProvider>
    </SupportModalProvider>
  )
}

export default DeskTopQuizView
