'use client'

import { useState, useEffect, useRef } from 'react'
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { AlertTriangle, SkipForward, ChevronDown, ChevronRight, CheckCircle2, ArrowRightToLineIcon, ArrowLeftToLineIcon, Paperclip, Sparkles, FileCheck2, Flag, FlagOffIcon, XIcon, Loader2  } from "lucide-react"
import Access from "@/components/dashboardItems/access"
import Link from "next/link"
import { useSupportModal, SupportModalProvider } from "@/components/dashboardItems/support-modal"
import { ModalProvider, useModal } from "@/components/dashboardItems/note"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { AIChatInterface } from "@/components/dashboardItems/ai-chat"


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

// Topics Component
function Topics({
  course,
  currentChapterIndex,
  currentSubChapterIndex,
  chapterProgress,
  completedQuestions,
  expandedChapters,
  onToggleChapter,
  onNavigateToQuestion,
  progress
}: TopicsProps) {
  // Calculate subchapter progress
  const getSubChapterProgress = (chapterIdx: number, subChapterIdx: number) => {
    const subChapter = course.chapters[chapterIdx].subChapters[subChapterIdx]
    const completed = completedQuestions[chapterIdx]?.[subChapterIdx]?.filter(Boolean).length || 0
    return `${completed}/${subChapter.questions.length}`
  }

  // Check if a subchapter is complete
  const isSubChapterComplete = (chapterIdx: number, subChapterIdx: number) => {
    return completedQuestions[chapterIdx][subChapterIdx].every(Boolean)
  }

  return (
    <div className="w-64 h-full border-r p-4 hidden md:block overflow-hidden flex flex-col">
      <div className="mb-6 flex-shrink-0">       
        <h2 className="font-bold mt-5 text-md mb-2">{course.courseName}</h2>
        <Progress value={progress} className="h-1.5 bg-gray-200" />
      </div>

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="space-y-2">
          {course.chapters.map((chapter, chapterIdx) => (
            <div key={chapterIdx} className="space-y-1">
              {/* Chapter header */}
              <button
                className="flex items-center justify-between w-full py-2 text-left rounded-md transition-colors"
                onClick={() => onToggleChapter(chapterIdx)}
              >
                <div className="flex items-center gap-2">
                  {expandedChapters[chapterIdx] ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-500" />
                  )}
                  <span className="text-sm font-semibold">{chapter.name}</span>
                </div>
               
              </button>

              {/* Chapter progress bar */}
              <div className="mx-2">
                <Progress value={chapterProgress[chapterIdx]} className="h-1 bg-gray-200" />
              </div>

              {/* Subchapters */}
              {expandedChapters[chapterIdx] && (
                <div className="ml-4 mt-1 space-y-1">
                  {chapter.subChapters.map((subChapter, subChapterIdx) => (
                    <div
                      key={subChapterIdx}
                      className={cn(
                        "pl-2 border-gray-200 py-1.5 rounded-md px-2 cursor-pointer",
                        currentChapterIndex === chapterIdx && currentSubChapterIndex === subChapterIdx
                          ? "font-black text-white text-sm"
                          : "",
                      )}
                      onClick={() => onNavigateToQuestion(chapterIdx, subChapterIdx, 0)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{subChapter.name}</span>
                        <span
                          className={cn(
                            "text-xs",
                            isSubChapterComplete(chapterIdx, subChapterIdx)
                              ? "text-green-500 font-semibold"
                              : "text-gray-500",
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

  // State for question submission
  const [isQuestionSubmitting, setIsQuestionSubmitting] = useState(false);
  
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
  const [progressDataReady, setProgressDataReady] = useState(false)
  
  // Additional state for right panel
  const { openModal } = useModal()
  const [tab, setTab] = useState("ai")
  const [isOpen, setIsOpen] = useState(true)
  
  // Ref to track if fetch has been initiated (prevents duplicate fetches in Strict Mode)
  const hasFetchedRef = useRef(false)
  
  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])
  


  // Fetch questions from API
  const fetchQuestions = async (): Promise<ApiQuestionsResponse | null> => {
    try {
      const courseId = typeof window !== 'undefined' ? sessionStorage.getItem('course_id') : null
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('Authorization') : null

      if (!courseId || !token) {
        throw new Error('Missing course ID or authorization token')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}/question_page/`, {
        headers: {
          'Authorization': `${token}`
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

  // Process progress data (can be called with pre-fetched data or fetch it)
  const processProgress = async (questionsData: ApiQuestionsResponse | null = null, progressData: ApiProgressResponse | null = null) => {
    try {
      let data: ApiProgressResponse
      
      if (progressData) {
        // Use provided progress data
        data = progressData
        setApiProgress(data)
      } else {
        // Fetch progress from API if not provided
        if (typeof window === 'undefined') {
          throw new Error('Window is not available')
        }

        const courseId = sessionStorage.getItem('course_id')
        const token = sessionStorage.getItem('Authorization')

        if (!courseId || !token) {
          throw new Error('Missing course ID or authorization token')
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz_progress/${courseId}/progress/`, {
          headers: {
            'Authorization': `${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch progress')
        }
        
        data = await response.json()
        // console.log('Progress API response:', data)
        setApiProgress(data)
      }
      
      // Build a map of question IDs to their progress
      const progressMap: Record<number, { selectedOption: number | null, isFlagged: boolean }> = {}
      
      // Build a map of subtopic attempted_questions for progress display
      const subtopicProgressMap: Record<string, number> = {}
      
      // Use the passed questionsData or fall back to state
      const questionsToUse = questionsData || apiQuestions
      
      // First, find matching chapters in questions API by chapter ID
      // console.log('questionsToUse available:', !!questionsToUse)
      if (questionsToUse) {
        // console.log('questionsToUse.chapters:', questionsToUse.chapters.length)
        questionsToUse.chapters.forEach(questionChapter => {
          // console.log(`Looking for chapter ID ${questionChapter.id} in progress data...`)
          const matchingProgressChapter = data.chapters.find(pc => pc.chapter === questionChapter.id)
          // console.log(`Matching chapter found:`, matchingProgressChapter)
          if (matchingProgressChapter) {
            questionChapter.subtopics.forEach(questionSubtopic => {
              // console.log(`Looking for subtopic ID ${questionSubtopic.id} in chapter...`)
              const matchingProgressSubtopic = matchingProgressChapter.subtopics.find(ps => ps.subtopic === questionSubtopic.id)
              // console.log(`Matching subtopic found:`, matchingProgressSubtopic)
              if (matchingProgressSubtopic) {
                // Store using question API IDs
                const key = `${questionChapter.id}_${questionSubtopic.id}`
                subtopicProgressMap[key] = matchingProgressSubtopic.attempted_questions
                // console.log(`Stored subtopic progress: ${key} = ${matchingProgressSubtopic.attempted_questions}`)
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
      
      // console.log('Subtopic progress map:', subtopicProgressMap)
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
          // console.log('Setting progress from API:', { attemptedQuestions, totalQuestions, progressValue })
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
          // console.log('All chapter progress:', newChapterProgress)
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
      
      // Fallback: ensure progressInitializedFromAPI is set even if questionsToUse was null
      // This handles edge cases where progress data exists but questions weren't loaded yet
      if (!progressInitializedFromAPI && questionsToUse) {
        setProgressInitializedFromAPI(true)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress')
      // Even on error, mark as initialized to prevent infinite loading
      // The UI will show with default/empty progress
      setProgressInitializedFromAPI(true)
    }
  }

  // Fetch progress from API (wrapper for backward compatibility)
  const fetchProgress = async (questionsData: ApiQuestionsResponse | null = null) => {
    return processProgress(questionsData, null)
  }

  // Load data on mount
  useEffect(() => {
    // Prevent duplicate fetches (especially in React Strict Mode)
    if (hasFetchedRef.current) {
      return
    }
    
    hasFetchedRef.current = true
    
    const loadData = async () => {
      if (typeof window === 'undefined') {
        return
      }

      setLoading(true)
      setProgressDataReady(false)
      
      const courseId = sessionStorage.getItem('course_id')
      const token = sessionStorage.getItem('Authorization')
      
      if (!courseId || !token) {
        setError('Missing course ID or authorization token')
        setLoading(false)
        // Reset ref on error so it can retry if needed
        hasFetchedRef.current = false
        return
      }
      
      // Fetch both questions and progress in parallel
      try {
        const [questionsResponse, progressResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}/question_page/`, {
            headers: {
              'Authorization': token
            }
          }),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz_progress/${courseId}/progress/`, {
            headers: {
              'Authorization': token
            }
          })
        ])
        
        if (!questionsResponse.ok) {
          throw new Error('Failed to fetch questions')
        }
        
        if (!progressResponse.ok) {
          throw new Error('Failed to fetch progress')
        }
        
        // Parse both responses
        const questionsData: ApiQuestionsResponse = await questionsResponse.json()
        const progressData: ApiProgressResponse = await progressResponse.json()
        
        // Set questions data (this also transforms and initializes state)
        setApiQuestions(questionsData)
        
        // Transform API data to local format
        const transformedCourse: Course = {
          courseName: questionsData.name,
          chapters: questionsData.chapters.map(chapter => ({
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
        
        // Now process progress with questions data (using already fetched progressData)
        await processProgress(questionsData, progressData)
        
      } catch (err) {
        console.error('Error loading data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
        setProgressInitializedFromAPI(true)
        // Reset ref on error so it can retry if needed
        hasFetchedRef.current = false
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Check if all progress data is ready before showing the quiz
  useEffect(() => {
    if (!loading && course.chapters.length > 0 && progressInitializedFromAPI) {
      // Verify that all state arrays are properly initialized
      const hasValidState = 
        completedQuestions.length === course.chapters.length &&
        flaggedQuestions.length === course.chapters.length &&
        chapterProgress.length === course.chapters.length &&
        expandedChapters.length === course.chapters.length
      
      if (hasValidState) {
        // Small delay to ensure all state updates are applied
        const timer = setTimeout(() => {
          setProgressDataReady(true)
        }, 50)
        return () => clearTimeout(timer)
      }
    }
  }, [loading, course.chapters.length, progressInitializedFromAPI, completedQuestions.length, flaggedQuestions.length, chapterProgress.length, expandedChapters.length])

  // Restore selected option when current question changes (after progress is loaded)
  useEffect(() => {
    if (!progressDataReady || !apiQuestions || course.chapters.length === 0) return
    
    const questionId = getCurrentQuestionId()
    if (questionId && selectedOptionsMap[questionId] !== undefined) {
      const optionIndex = selectedOptionsMap[questionId]
      const currentQuestion = course.chapters[currentChapterIndex]?.subChapters[currentSubChapterIndex]?.questions[currentQuestionIndex]
      if (currentQuestion && optionIndex !== null && optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
        setSelectedOption(currentQuestion.options[optionIndex])
        setIsAnswered(true)
      }
    }
  }, [currentChapterIndex, currentSubChapterIndex, currentQuestionIndex, progressDataReady, selectedOptionsMap, apiQuestions, course])

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
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('Authorization') : null

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz_progress/update_question/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // const data = await response.json();
    
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  // Current question data - show loading until both questions and progress are ready
  if (course.chapters.length === 0 || !progressDataReady || loading) {
    if (loading || !progressDataReady) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              {course.chapters.length === 0 ? 'Loading questions...' : 'Loading progress...'}
            </p>
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

  // Helper function to find next valid question position (skips empty subchapters)
  const findNextValidQuestion = (startChapterIdx: number, startSubChapterIdx: number, startQuestionIdx: number) => {
    for (let c = startChapterIdx; c < course.chapters.length; c++) {
      const chapter = course.chapters[c]
      const startSub = (c === startChapterIdx) ? startSubChapterIdx : 0
      
      for (let s = startSub; s < chapter.subChapters.length; s++) {
        const subChapter = chapter.subChapters[s]
        if (subChapter.questions.length === 0) continue // Skip empty subchapters
        
        const startQ = (c === startChapterIdx && s === startSubChapterIdx) ? startQuestionIdx : 0
        for (let q = startQ; q < subChapter.questions.length; q++) {
          return { chapterIdx: c, subChapterIdx: s, questionIdx: q }
        }
      }
    }
    return null
  }

  // Navigate to specific question (with validation)
  const navigateToQuestion = (chapterIdx: number, subChapterIdx: number, questionIdx: number) => {
    const chapter = course.chapters[chapterIdx]
    if (!chapter) return
    
    const subChapter = chapter.subChapters[subChapterIdx]
    if (!subChapter || subChapter.questions.length === 0) {
      // If subchapter is empty, find next valid question
      const nextValid = findNextValidQuestion(chapterIdx, subChapterIdx + 1, 0)
      if (nextValid) {
        setCurrentChapterIndex(nextValid.chapterIdx)
        setCurrentSubChapterIndex(nextValid.subChapterIdx)
        setCurrentQuestionIndex(nextValid.questionIdx)
      }
      return
    }
    
    if (questionIdx >= subChapter.questions.length) {
      questionIdx = 0
    }
    
    setCurrentChapterIndex(chapterIdx)
    setCurrentSubChapterIndex(subChapterIdx)
    setCurrentQuestionIndex(questionIdx)
    
    // Restore selected option from API if question was already answered
    const questionId = apiQuestions?.chapters[chapterIdx]?.subtopics[subChapterIdx]?.questions[questionIdx]?.id
    if (questionId && selectedOptionsMap[questionId] !== undefined) {
      const optionIndex = selectedOptionsMap[questionId]
      const question = subChapter.questions[questionIdx]
      if (optionIndex !== null && optionIndex >= 0 && optionIndex < question.options.length) {
        setSelectedOption(question.options[optionIndex])
        setIsAnswered(true)
      } else {
        setSelectedOption(null)
        setIsAnswered(false)
      }
    } else {
      setSelectedOption(null)
      setIsAnswered(false)
    }
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
  // const [isQuestionSubmitting, setIsQuestionSubmitting] = useState(false);
  const handleContinue = async () => {
    // Submit to API before moving to next question
    setIsQuestionSubmitting(true)   
    const questionId = getCurrentQuestionId()
    if (questionId) {
      const optionIndex = selectedOption ? currentQuestion.options.indexOf(selectedOption) : null
      await submitHandler(questionId, optionIndex, isQuestionFlagged())
    }
    setIsQuestionSubmitting(false)
    
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
    const courseId = typeof window !== 'undefined' ? sessionStorage.getItem('course_id') : null
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('Authorization') : null

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz_progress/${courseId}/submit/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${token}`
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
    const courseId = typeof window !== 'undefined' ? sessionStorage.getItem('course_id') : null
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('Authorization') : null

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz_progress/${courseId}/quit/`, {
      method: "POST",
      headers: {
        "Authorization": `${token}`
      }
    })
    if (response.ok){
    toast.success("Quiz quitted successfully")
    router.push(`/course/${courseId}`)
    } else {
      console.error("Failed to quit quiz")
    } 
  }



  return (
    <div className="flex h-screen pt-3 overflow-hidden">
      {/* Sidebar */}
      <Topics
        course={course}
        currentChapterIndex={currentChapterIndex}
        currentSubChapterIndex={currentSubChapterIndex}
        chapterProgress={chapterProgress}
        completedQuestions={completedQuestions}
        expandedChapters={expandedChapters}
        onToggleChapter={toggleChapter}
        onNavigateToQuestion={navigateToQuestion}
        progress={progress}
      />

      {/* Main content */}        
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Premium banner */}
        <div className="max-w-5xl mx-auto w-full mt-6 flex-shrink-0">
       {/* <Access /> */}
       </div>
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto w-full px-4 mt-4 rounded-mid flex-shrink-0">
          <Progress value={progress} className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-mid" />
        </div>

        {/* Question content */}
        <div className="flex-1 p-6 max-w-3xl mx-auto w-full overflow-y-auto min-h-0">
          <div className="flex   justify-between items-center mb-4">
            <div className="text-sm font-black text-gray-600 dark:text-gray-300">
              Question <span className="text-green-600">{getQuestionNumber()}</span> of <span className="text-green-600">{totalQuestions}</span> 
            </div>
            <div className="flex space-x-3">
              <div className="text-gray-600 dark:text-gray-300 flex items-center cursor-pointer" onClick={handleSkip}>
              <SkipForward className="h-3 mr-1 w-3 " strokeWidth={3} />
                <span className="text-sm font-bold">Skip</span>
              </div>
              <div
                
                className={cn(
                  "text-gray-600 dark:text-gray-300 mx-3 flex items-center cursor-pointer",
                  isQuestionFlagged() && "",
                )}
                onClick={handleFlag}
              >
               {isQuestionFlagged() ? (
                  <div className="flex items-center">
                    <Flag className="h-3 mr-1 w-3 text-xcolor" strokeWidth={3} />
                    <span className="text-sm font-bold text-xcolor">Flagged</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FlagOffIcon className="h-3 mr-1 w-3" strokeWidth={3} />
                        <span className="text-sm font-bold">Flag  </span>
                  </div>
                )}
               </div>
           
               <div className="text-gray-600 dark:text-gray-300 flex items-center cursor-pointer" onClick={handleQuitQuiz}>
               <XIcon className="h-3 w-3" strokeWidth={3} />
                <span className="text-sm font-bold">Quit</span>
               
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
            <>
              {isQuestionSubmitting ?
            <div className="w-32 text-sm flex items-center justify-center text-center p-1 text-slate-800 dark:text-slate-300 border font-black border-gray-300 rounded-mid" >
              <Loader2 className="w-4 h-4 animate-spin" />
            </div> :
            <>
            <div className="w-32 text-sm flex items-center justify-center text-center p-1 text-slate-800 dark:text-slate-300 border font-black border-gray-300 rounded-mid" onClick={handleContinue}>
              <span>Continue</span>
            </div>
            </>
            }
            </>
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

      <div className="overflow-hidden flex-shrink-0">
        {/* Chapter list */}
        <div className="flex h-full flex-col mt-6">
        {isOpen ? (
  <div className="w-[350px] border-l max-w-full flex flex-col h-full ml-auto overflow-hidden">
    {/* Header with custom div tabs */}
    <div className="flex flex-row items-center justify-between pt-6 p-4 pb-2 flex-shrink-0">
      <div className="flex items-center gap-2 w-full">
        <div className="flex gap-3">
          <div
            onClick={() => setTab("ai")}
            className={`flex items-center cursor-pointer px-0 font-bold text-sm mr-2 transition-colors ${tab === "ai" ? "text-xcolor" : "text-gray-700"}`}
            style={{ userSelect: 'none' }}
          >
            <Sparkles className={`mr-1 w-4 h-4 ${tab === "ai" ? "text-xcolor" : "text-gray-400"}`} strokeWidth={3} />
            AI Assistant
          </div>
          <div
            onClick={() => setTab("notes")}
            className={`flex items-center cursor-pointer px-0 font-bold text-sm transition-colors ${tab === "notes" ? "text-xcolor" : "text-gray-700"}`}
            style={{ userSelect: 'none' }}
          >
            <FileCheck2 className={`mr-1 w-4 h-4 ${tab === "notes" ? "text-xcolor" : "text-gray-400"}`} strokeWidth={3} />
            Add Notes
          </div>
        </div>
      </div>
      <ArrowRightToLineIcon onClick={() => setIsOpen(false)} className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
    </div>
    <div className="flex-1  flex flex-col overflow-y-auto min-h-0">
      {tab === "ai" && (
       <AIChatInterface />
      )}
      {tab === "notes" && (
        <Notes />
      )}
    </div>
   
  </div>
) : (
  <div className="w-5 p-4 pr-10 border-white flex flex-col h-full ml-auto">
   <ArrowLeftToLineIcon onClick={() => setIsOpen(true)} className="w-5 h-5 text-gray-800  cursor-pointer hover:text-black" />

      </div>
)}
       
        </div>
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
          'Authorization': `${typeof window !== 'undefined' ? sessionStorage.getItem('Authorization') : ''}`,
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
