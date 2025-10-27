"use client"

import { useState, useEffect } from "react"
import { CheckIcon, XIcon, ChevronDownIcon, ChevronUpIcon, Flag, Check, X, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import Image from "next/image"

// Semicircular Progress Bar Component
interface SemicircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showPercentage?: boolean
  className?: string
}

function SemicircularProgress({
  percentage,
  size = 100,
  strokeWidth = 10,
  color = "#4CAF50",
  backgroundColor = "#E6E6E6",
  showPercentage = true,
  className = ""
}: SemicircularProgressProps) {
  // Calculate the circumference of the semicircle
  const radius = (size - strokeWidth) / 2
  const circumference = Math.PI * radius
  
  // Calculate the stroke dash array based on percentage
  const strokeDasharray = `${(percentage / 100) * circumference}, ${circumference}`
  
  return (
    <div className={`relative ${className}`}>
      <svg 
        viewBox={`0 0 ${size} ${size / 2}`} 
        className="w-full h-full"
        style={{ width: size, height: size / 2 }}
      >
        {/* Background semicircle */}
        <path
          d={`M ${strokeWidth / 2},${size / 2} a ${radius},${radius} 0 1,1 ${size - strokeWidth},0`}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Foreground semicircle */}
        <path
          d={`M ${strokeWidth / 2},${size / 2} a ${radius},${radius} 0 1,1 ${size - strokeWidth},0`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset="0"
          strokeLinecap="round"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
            {percentage}%
          </span>
        </div>
      )}
    </div>
  )
}

// Define question type
type QuestionStatus = "correct" | "incorrect" | "flagged" | "skipped"

interface Question {
  id: number
  text: string
  status: QuestionStatus
  category: string
  explanation: string
}

// API Response Interfaces
interface APIQuestion {
  id: number
  text: string
  option0: string
  option1: string
  option2: string
  option3: string
  correct_option: number
  explanation: string
}

interface APIQuestionsResponse {
  total_questions: number
  questions: APIQuestion[]
}

interface APIProgressQuestion {
  id: number
  question: number
  selected_option: number | null
  is_flagged: boolean
}

interface APIProgressResponse {
  id: number
  course: number
  attempted_questions: number
  flagged_count: number
  skipped_count: number
  correct_count: number
  last_viewed_question: number
  is_submitted: boolean
  questions: APIProgressQuestion[]
}

export default function QuizResultsPage() {
  // State to track which explanations are open
  const [openExplanations, setOpenExplanations] = useState<Record<number, boolean>>({})
  
  // API data states
  const [questionsData, setQuestionsData] = useState<APIQuestionsResponse | null>(null)
  const [progressData, setProgressData] = useState<APIProgressResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  // Toggle explanation visibility
  const toggleExplanation = (questionId: number) => {
    setOpenExplanations((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))
  }

  // Fetch API data
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const courseId = sessionStorage.getItem('course_id')
        const token = sessionStorage.getItem('Authorization')
        
        if (!courseId) {
          throw new Error('No course ID found in session')
        }
        
        if (!token) {
          throw new Error('No authentication token found')
        }

        // Try direct API calls first, fallback to proxy if CORS fails
        let questionsData: APIQuestionsResponse
        let progressData: APIProgressResponse

        try {
          // Try direct API calls first
          const [questionsResponse, progressResponse] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}/full_test_page/`, {
              method: 'GET',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
            }),
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/test_progress/${courseId}/progress?source=analytics`, {
              method: 'GET',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
            })
          ])

          if (!questionsResponse.ok) {
            throw new Error(`Questions API failed: ${questionsResponse.status} ${questionsResponse.statusText}`)
          }

          if (!progressResponse.ok) {
            throw new Error(`Progress API failed: ${progressResponse.status} ${progressResponse.statusText}`)
          }

          questionsData = await questionsResponse.json()
          progressData = await progressResponse.json()

        } catch (corsError) {
          console.log('Direct API call failed, trying proxy:', corsError)
          
          // Fallback to API proxy
          const response = await fetch(`/api/full-test?courseId=${courseId}&source=analytics`, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            throw new Error(`API proxy failed: ${response.status} ${response.statusText}`)
          }

          const proxyData = await response.json()
          questionsData = proxyData.questions
          progressData = proxyData.progress
        }

        console.log('Questions API Response:', questionsData)
        console.log('Progress API Response:', progressData)

        setQuestionsData(questionsData)
        setProgressData(progressData)

        // Transform API data to component format
        const transformedQuestions = questionsData.questions.map((apiQuestion, index) => {
          const progressQuestion = progressData.questions.find(pq => pq.question === apiQuestion.id)
          
          let status: QuestionStatus = "skipped"
          if (progressQuestion && progressQuestion.selected_option !== null) {
            status = progressQuestion.selected_option === apiQuestion.correct_option ? "correct" : "incorrect"
          } else if (progressQuestion?.is_flagged) {
            status = "flagged"
          }

          return {
            id: index + 1, // Serial number instead of question ID
            text: apiQuestion.text,
            status,
            category: sessionStorage.getItem('course_name') || "", // You can modify this based on your needs
            explanation: apiQuestion.explanation
          }
        })

        setQuestions(transformedQuestions)

      } catch (err) {
        console.error('Error fetching quiz data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load quiz data')
      } finally {
        setLoading(false)
      }
    }

    fetchQuizData()
  }, [])

  // Calculate statistics from API data
  const totalQuestions = questionsData?.total_questions || 0
  const correctCount = progressData?.correct_count || 0
  const attemptedQuestions = progressData?.attempted_questions || 0
  const incorrectCount = attemptedQuestions - correctCount
  const flaggedCount = progressData?.flagged_count || 0
  const skippedCount = totalQuestions - attemptedQuestions // skipped = total - attempted
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const answeredCount = attemptedQuestions

  // Generate grid questions for visualization
  const gridQuestions = questions.map((question) => ({
    id: question.id,
    status: question.status
  }))

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="text-lg text-gray-600">Loading quiz results...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <img src="/something-went-wrong.png" alt="Error" width={200} height={200} className="mx-auto mb-4" />
          </div>
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen  p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-base font-bold text-gray-900 mb-6 ml-10 md:ml-0"></h1>

        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8">
          {/* Left side - Title and Status */}
          <div className="mb-6 md:mb-0 md:max-w-[60%]">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
             {sessionStorage.getItem('course_name')}
            </h2>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex font-bold items-center gap-2">
                <span>Total Questions:</span>
                <span className="text-blue-700">{totalQuestions}</span>
              </div>
            </div>
          </div>

          {/* Right side - Accuracy and Answered */}
          <div className="flex gap-10">
            <div>
              <div className="text-sm text-gray-600 dark:text-slate-300 mb-1 font-semibold">Accuracy</div>
              <div className="flex items-center gap-2">
                <SemicircularProgress 
                  percentage={accuracy} 
                  size={40} 
                  strokeWidth={5}
                  color="#4CAF50"
                  backgroundColor="#E6E6E6"
                  showPercentage={false}
                />
                <span className="font-bold text-slate-500 dark:text-slate-300 text-sm">{accuracy}%</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-slate-300 font-semibold mb-1">Answered</div>
              <div className="font-bold text-sm text-slate-600 dark:text-slate-300"><span className="text-slate-800 dark:text-slate-300 font-black">{answeredCount}</span>/{totalQuestions}</div>
            </div>
          </div>
        </div>

        {/* Example usage of different percentages */}
     
        </div>

        <Component 
          correctCount={correctCount}
          incorrectCount={incorrectCount}
          flaggedCount={flaggedCount}
          skippedCount={skippedCount}
        />

        {/* Question Grid */}
        {/* <div className="flex flex-wrap gap-x-4 gap-y-6 mb-12">
          {gridQuestions.map((question) => (
            <div
              key={question.id}
              className="relative w-16 h-16 bg-gray-200 dark:bg-slate-900 rounded-lg flex items-center justify-center"
            >
    
              <div className="absolute top-1 right-1">
                {question.status === "correct" && (
                  <div className="w-5 h-5 bg-green-700 rounded-sm flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3.5}/>
                  </div>
                )}
                {question.status === "incorrect" && (
                  <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center">
                    <X className="w-4 h-4 text-white" strokeWidth={2.5}/>
                  </div>
                )}
                {question.status === "flagged" && <div className="w-5 h-5 bg-gray-500 rounded-sm flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>}
              </div>

         
              <span className="text-xl font-black text-black dark:text-white">{question.id}</span>
            </div>
          ))}
        </div> */}

        {/* Legend */}
                 {/* <div className="flex w-full text-center  flex-wrap gap-8 mb-12">
           <div className="flex items-center gap-2">
             <div className="flex items-center justify-center">
             <div className="w-5 h-5 bg-green-200 rounded-sm flex items-center justify-center">
                     <Check className="w-3 h-3 text-green-700" strokeWidth={3.5}/>
                   </div>
             </div>
             <span className="text-sm">correct 30%</span>
           </div>

           <div className="flex items-center gap-2">
             <div className="flex items-center justify-center">
             <div className="w-5 h-5 bg-red-200 rounded-sm flex items-center justify-center">
                     <X className="w-4 h-4 text-red-700" strokeWidth={2.5}/>
                   </div>
             </div>
             <span className="text-sm">incorrect 50%</span>
           </div>

           <div className="flex items-center gap-2">
           <div className="w-5 h-5 bg-gray-300 rounded-sm flex items-center justify-center">
                     <ChevronRight className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
                     </div>
             <span className="text-sm">flagged 11%</span>
           </div>

           <div className="flex items-center gap-2">
           <div className="w-5 h-5 bg-gray-200 rounded-sm flex items-center justify-center">
                     <ChevronRight className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
                     </div>
             <span className="text-sm">skipped 9%</span>
           </div>
         </div> */}

        {/* Question Details */}
        <div className="space-y-4">
      {questions.map((question: any) => (
        <div
          key={question.id}
          className="border border-gray-200 rounded-mid overflow-hidden"
        >
          <div className="p-4">
            {/* Top section */}
            <div className="flex items-center justify-between mb-2">
              {/* Left side: Question info */}
              <div className="flex items-center gap-3">
                <Image src="/FAQ.svg" alt="FAQ" width="75" height="75" className="ml-[-30px]" />
                <span className="text-sm flex font-semibold ml-[-30px]"><p className="hidden sm:block">Question No. </p>{question.id}</span>

                {question.status === "correct" && (
                  <div className="flex items-center gap-1 ml-3">
                    <div className="w-5 h-5 bg-green-600 rounded-sm flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm hidden sm:block font-semibold text-green-700">Correct</span>
                  </div>
                )}

                {question.status === "incorrect" && (
                  <div className="flex items-center gap-1 ml-3">
                    <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center">
                      <X className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm hidden sm:block font-semibold text-red-600">Incorrect</span>
                  </div>
                )}

                {question.status === "skipped" && (
                  <div className="flex items-center gap-1 ml-3">
                    <div className="w-5 h-5 bg-gray-400 rounded-sm flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-600">Skipped</span>
                  </div>
                )}
              </div>

              {/* Right side: Category */}
              <div className="flex gap-2">
              <div className="px-4 py-1 bg-gray-200 text-black rounded-full flex items-center">
                <span className="text-xs font-medium">{question.category}</span>
              </div>
              <button
              className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-slate-300"
              onClick={() => toggleExplanation(question.id)}
            >
              <span className="text-sm font-bold hidden sm:block">Explanation</span>
              {openExplanations[question.id] ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            </div>
            </div>

            {/* Question Text */}
            <p className="text-base text-gray-800 dark:text-slate-100 font-semibold">{question.text}</p>
          </div>

          {/* Bottom: Explanation toggle */}
         
          {/* Explanation Content */}
          {openExplanations[question.id] && (
            <div className="px-4 pb-4  border-gray-200 dark:bg-background">
              
              <p className="text-slate-800 dark:text-slate-100 text-sm font-bold">Explaination:</p>
              <p className="text-xs text-slate-800 dark:text-slate-100 font-semibold">{question.explanation}</p>
            </div>
          )}
        </div>
      ))}
    </div>
    </div>
  )
}



import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
// This will be updated dynamically based on API data





const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

function Component({ 
  correctCount, 
  incorrectCount, 
  flaggedCount, 
  skippedCount 
}: { 
  correctCount: number
  incorrectCount: number
  flaggedCount: number
  skippedCount: number
}) {
  const chartData = [
    { browser: "Correct", visitors: correctCount, fill: "#86efac" },   // bg-green-300
    { browser: "Wrong", visitors: incorrectCount, fill: "#fecaca" },     // bg-gray-300
    { browser: "Skipped", visitors: skippedCount, fill: "#d1d5db" },   // bg-red-200
    { browser: "Flagged", visitors: flaggedCount, fill: "#f3f4f6" },   // bg-gray-100
  ];

  return (
    <Card className="flex flex-col border-0 shadow-none">
      <CardHeader className="items-center pb-0">
        <CardTitle>Overall Progress</CardTitle>
        {/* <CardDescription>January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
             <CardFooter className="flex flex-col items-center justify-center text-center gap-2 text-sm">
       <div className="flex w-full text-center justify-center flex-wrap gap-8 mb-12">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
            <div className="w-5 h-5 bg-green-700 rounded-sm flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3.5}/>
                  </div>
            </div>
            <span className="text-sm flex">correct {correctCount} <span className="hidden sm:block ml-1">Questions</span>    </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
            <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center">
                    <X className="w-4 h-4 text-white" strokeWidth={2.5}/>
                  </div>
            </div>
            <span className="text-sm flex">incorrect {incorrectCount} <span className="hidden sm:block ml-1">Questions</span>    </span>
          </div>

          <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-700 rounded-sm flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
            <span className="text-sm flex">flagged {flaggedCount} <span className="hidden sm:block ml-1">Questions</span>     </span>
          </div>

          <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-500 rounded-sm flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
              <span className="text-sm flex">skipped {skippedCount} <span className="hidden sm:block ml-1">Questions</span>    </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
