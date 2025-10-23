"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Star, X, ArrowLeft, ArrowRight, Shuffle, ChevronRight, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ModalProvider, useModal } from "@/components/dashboardItems/note"
import Image from "next/image"

// API data interfaces
interface FlashcardAPI {
  id: number;
  primary_text: string;
  secondary_text: string;
}

interface SubTopicAPI {
  id: number;
  name: string;
  flashcard_count: number;
  flashcards: FlashcardAPI[];
}

interface ChapterAPI {
  id: number;
  name: string;
  subtopics: SubTopicAPI[];
}

interface CourseAPI {
  id: number;
  name: string;
  total_flashcards: number;
  chapters: ChapterAPI[];
}
// Utility function for class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// CSS styles for 3D flip effect
const styles = {
  perspective: {
    perspective: "1000px",
  },
  cardContainer: {
    transformStyle: "preserve-3d" as const,
    transition: "transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
  cardFace: {
    backfaceVisibility: "hidden" as const,
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  cardBack: {
    transform: "rotateY(180deg)",
  },
  flipped: {
    transform: "rotateY(180deg)",
  },
}

// Progress component
const Progress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: number }>(
  ({ className, value, ...props }, ref) => (
    <div ref={ref} className={cn("relative h-1 w-full overflow-hidden bg-gray-200", className)} {...props}>
      <div className="h-full bg-green-500 transition-all" style={{ width: `${value}%` }} />
    </div>
  ),
)
Progress.displayName = "Progress"

// Button component
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "ghost" | "outline"
    size?: "default" | "sm"
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50",
        variant === "default" && "bg-gray-900 text-white hover:bg-gray-800",
        variant === "ghost" && "bg-transparent hover:bg-gray-100",
        variant === "outline" && "border border-gray-300 bg-transparent hover:bg-gray-100",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-8 px-3 text-sm",
        className,
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"

// Flashcard data structure
type Flashcard = {
  question: string
  answer: string
}

type Subchapter = {
  subchapterName: string
  flashcards: Flashcard[]
}

type Chapter = {
  chapterName: string
  subchapters: Subchapter[]
}

type Course = {
  courseName: string
  chapters: Chapter[]
}

// Flashcard component with 3D flip effect
const FlashcardWithFlip = ({
  front,
  back,
  flipped,
  onFlip,
  onFavorite,
  favorited,
}: {
  front: string
  back: string
  flipped: boolean
  onFlip: () => void
  onFavorite: () => void
  favorited: boolean
}) => {
  return (
    <div className="w-full h-full cursor-pointer" onClick={onFlip} style={styles.perspective}>
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          ...styles.cardContainer,
          ...(flipped ? styles.flipped : {}),
        }}
      >
        {/* Front of card */}
        <div
          className="absolute w-full h-full bg-white dark:bg-slate-900 rounded-lg flex flex-col items-center justify-center p-8 shadow-lg"
          style={styles.cardFace}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFavorite()
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10 transition-colors"
          >
            <Star className={cn("h-6 w-6", favorited && "fill-gray-600 text-gray-600 dark:fill-gray-200 dark:text-gray-200")} />
          </button>
          <div className="relative z-10">
            <div className="text-3xl font-bold text-center text-gray-900 dark:text-white">{front}</div>
            <div className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400 font-medium">Click to flip</div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute w-full h-full bg-gray-50 dark:bg-black rounded-lg flex flex-col items-center justify-center p-8 shadow-lg"
          style={{ ...styles.cardFace, ...styles.cardBack }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFavorite()
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10 transition-colors"
          >
            <Star className={cn("h-6 w-6", favorited && "fill-gray-600 text-gray-600 dark:fill-gray-200 dark:text-gray-200")} />
          </button>
          <div className="relative z-10">
            <div className="text-2xl font-bold text-center text-gray-900 dark:text-white">{back}</div>
            <div className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400 font-medium">Click to flip back</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FlashcardContent() {
  const { openModal } = useModal()
  
  // API data states
  const [courseData, setCourseData] = useState<CourseAPI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch API data
  useEffect(() => {
    const fetchFlashcardsData = async () => {
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}/flashcard_page/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }

        const data: CourseAPI = await response.json()
        setCourseData(data)
      } catch (err) {
        console.error('Error fetching flashcards data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load flashcards')
      } finally {
        setLoading(false)
      }
    }

    fetchFlashcardsData()
  }, [])

  // Convert API data to component format
  const myCourse: Course = courseData ? {
    courseName: courseData.name,
    chapters: courseData.chapters.map(chapter => ({
      chapterName: chapter.name,
      subchapters: chapter.subtopics.map(subtopic => ({
        subchapterName: subtopic.name,
        flashcards: subtopic.flashcards.map(flashcard => ({
          question: flashcard.primary_text,
          answer: flashcard.secondary_text
        }))
      }))
    }))
  } : {
    courseName: "Loading...",
    chapters: []
  }

  // Fallback course data for when API is not available
  const fallbackCourse: Course = {
    courseName: "Introduction to TypeScript",
    chapters: [
      {
        chapterName: "Getting Started",
        subchapters: [
          {
            subchapterName: "Introduction",
            flashcards: [
              { question: "What is TypeScript?", answer: "A typed superset of JavaScript." },
              { question: "Who developed TypeScript?", answer: "Microsoft." },
            ],
          },
          {
            subchapterName: "Setup",
            flashcards: [
              { question: "What is the file extension for TypeScript files?", answer: ".ts" },
              { question: "How do you install TypeScript?", answer: "Using npm: npm install -g typescript" },
              { question: "How to compile a TypeScript file?", answer: "tsc filename.ts" },
            ],
          },
        ],
      },
      {
        chapterName: "Basic Types",
        subchapters: [
          {
            subchapterName: "Primitive Types",
            flashcards: [
              { question: "Name some basic types in TypeScript.", answer: "string, number, boolean, null, undefined." },
              { question: "What type is used for dynamic content?", answer: "any type." },
            ],
          },
          {
            subchapterName: "Complex Types",
            flashcards: [
              { question: "What does unknown type represent?", answer: "A type-safe counterpart of any." },
              { question: "How to define an array of numbers?", answer: "number[] or Array<number>" },
              {
                question: "Can you assign undefined to a number type?",
                answer: "Not unless using | undefined union type.",
              },
            ],
          },
        ],
      },
      {
        chapterName: "Functions",
        subchapters: [
          {
            subchapterName: "Function Basics",
            flashcards: [
              { question: "How do you specify a return type?", answer: "After the parameter list, like (): string." },
              { question: "What is a default parameter?", answer: "A parameter with a default value." },
            ],
          },
          {
            subchapterName: "Advanced Functions",
            flashcards: [
              {
                question: "What is the syntax for a function with optional parameters?",
                answer: "Use ?, like name?: string.",
              },
              { question: "Can functions be typed separately?", answer: "Yes, using function types." },
              { question: "What does void mean as a return type?", answer: "The function doesn't return anything." },
            ],
          },
        ],
      },
      {
        chapterName: "Interfaces and Types",
        subchapters: [
          {
            subchapterName: "Interface Basics",
            flashcards: [
              { question: "What is an interface used for?", answer: "To define object shapes/contracts." },
              { question: "How do you extend an interface?", answer: "Using extends keyword." },
            ],
          },
          {
            subchapterName: "Advanced Interfaces",
            flashcards: [
              { question: "Can interfaces have optional properties?", answer: "Yes, with ? syntax." },
              {
                question: "What's the difference between type and interface?",
                answer: "Types can use unions, interfaces can't.",
              },
              { question: "Can types be extended?", answer: "Yes, with intersections like &." },
            ],
          },
        ],
      },
      {
        chapterName: "Advanced Features",
        subchapters: [
          {
            subchapterName: "Generics",
            flashcards: [
              { question: "What are generics?", answer: "Tools for writing reusable code with types." },
              { question: "What does readonly do?", answer: "Prevents modification of a property." },
            ],
          },
          {
            subchapterName: "Special Types",
            flashcards: [
              { question: "What is type assertion?", answer: "Forcibly treating a value as a specific type." },
              { question: "What is a tuple?", answer: "An array with fixed number of elements and types." },
              { question: "What is the never type?", answer: "Represents values that never occur." },
            ],
          },
        ],
      },
    ],
  }

  // State
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [currentSubchapterIndex, setCurrentSubchapterIndex] = useState(0)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({})

  // Initialize completedCards with the new structure
  const [completedCards, setCompletedCards] = useState<boolean[][][]>([])

  // Update completedCards when courseData changes
  useEffect(() => {
    if (courseData) {
      const newCompletedCards = courseData.chapters.map((chapter) =>
        chapter.subtopics.map((subtopic) => Array(subtopic.flashcards.length).fill(false)),
      )
      setCompletedCards(newCompletedCards)
    }
  }, [courseData])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center space-x-1 mb-4">
            <div className="w-2 h-2 bg-[#ffd404] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#ffd404] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-[#ffd404] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <div className="text-lg">Loading flashcards...</div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Image src="/nothing.png" alt="Error" width={200} height={200} className="mx-auto mb-4" />
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  // No data state
  if (!courseData || courseData.chapters.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Image src="/nothing.png" alt="No Flashcards" width={200} height={200} className="mx-auto mb-4" />
          <div className="text-lg">No flashcards available</div>
        </div>
      </div>
    )
  }

  // Current flashcard
  const currentChapter = myCourse.chapters[currentChapterIndex]
  const currentSubchapter = currentChapter.subchapters[currentSubchapterIndex]
  const currentFlashcard = currentSubchapter.flashcards[currentCardIndex]

  // Calculate total flashcards
  const totalFlashcards = myCourse.chapters.reduce(
    (sum, chapter) =>
      sum + chapter.subchapters.reduce((subSum, subchapter) => subSum + subchapter.flashcards.length, 0),
    0,
  )

  // Calculate current flashcard number (across all chapters and subchapters)
  const getCurrentCardNumber = () => {
    let cardNumber = 1

    // Count cards in previous chapters
    for (let i = 0; i < currentChapterIndex; i++) {
      for (let j = 0; j < myCourse.chapters[i].subchapters.length; j++) {
        cardNumber += myCourse.chapters[i].subchapters[j].flashcards.length
      }
    }

    // Count cards in previous subchapters of current chapter
    for (let j = 0; j < currentSubchapterIndex; j++) {
      cardNumber += currentChapter.subchapters[j].flashcards.length
    }

    // Add current card index
    cardNumber += currentCardIndex

    return cardNumber
  }

  // Calculate progress
  const calculateProgress = () => {
    // Safety check for completedCards
    if (!completedCards || completedCards.length === 0) {
      return { 
        overall: 0, 
        chapters: myCourse.chapters.map(() => 0),
        subchapters: myCourse.chapters.map(() => [])
      }
    }

    // Overall progress
    const totalCompleted = completedCards.flat(2).filter(Boolean).length
    const overallProgress = (totalCompleted / totalFlashcards) * 100

    // Chapter progress
    const chapterProgress = myCourse.chapters.map((chapter, chIdx) => {
      const totalChapterCards = chapter.subchapters.reduce((sum, subchapter) => sum + subchapter.flashcards.length, 0)

      let completedChapterCards = 0
      for (let i = 0; i < chapter.subchapters.length; i++) {
        if (completedCards[chIdx] && completedCards[chIdx][i]) {
          completedChapterCards += completedCards[chIdx][i].filter(Boolean).length
        }
      }

      return totalChapterCards > 0 ? (completedChapterCards / totalChapterCards) * 100 : 0
    })

    // Subchapter progress
    const subchapterProgress = myCourse.chapters.map((chapter, chIdx) =>
      chapter.subchapters.map((subchapter, subIdx) => {
        if (completedCards[chIdx] && completedCards[chIdx][subIdx]) {
          const completed = completedCards[chIdx][subIdx].filter(Boolean).length
          const total = subchapter.flashcards.length
          return total > 0 ? (completed / total) * 100 : 0
        }
        return 0
      }),
    )

    return { overall: overallProgress, chapters: chapterProgress, subchapters: subchapterProgress }
  }

  const progress = calculateProgress()

  // Toggle chapter expansion
  const toggleChapterExpansion = (chapterIdx: number) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterIdx]: !prev[chapterIdx],
    }))
  }

  // Handle navigation with animation
  const changeCard = (chapterIdx: number, subchapterIdx: number, cardIdx: number) => {
    setIsChanging(true)
    setFlipped(false)

    setTimeout(() => {
      setCurrentChapterIndex(chapterIdx)
      setCurrentSubchapterIndex(subchapterIdx)
      setCurrentCardIndex(cardIdx)
      setIsChanging(false)
    }, 300)
  }

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      // Previous card in same subchapter
      changeCard(currentChapterIndex, currentSubchapterIndex, currentCardIndex - 1)
    } else if (currentSubchapterIndex > 0) {
      // Last card of previous subchapter
      const prevSubchapterIndex = currentSubchapterIndex - 1
      const prevSubchapterLastCardIndex = currentChapter.subchapters[prevSubchapterIndex].flashcards.length - 1
      changeCard(currentChapterIndex, prevSubchapterIndex, prevSubchapterLastCardIndex)
    } else if (currentChapterIndex > 0) {
      // Last card of last subchapter of previous chapter
      const prevChapterIndex = currentChapterIndex - 1
      const prevChapter = myCourse.chapters[prevChapterIndex]
      const prevSubchapterIndex = prevChapter.subchapters.length - 1
      const prevSubchapterLastCardIndex = prevChapter.subchapters[prevSubchapterIndex].flashcards.length - 1
      changeCard(prevChapterIndex, prevSubchapterIndex, prevSubchapterLastCardIndex)
    } else {
      // Wrap to last card of last subchapter of last chapter
      const lastChapterIndex = myCourse.chapters.length - 1
      const lastChapter = myCourse.chapters[lastChapterIndex]
      const lastSubchapterIndex = lastChapter.subchapters.length - 1
      const lastCardIndex = lastChapter.subchapters[lastSubchapterIndex].flashcards.length - 1
      changeCard(lastChapterIndex, lastSubchapterIndex, lastCardIndex)
    }
  }

  const handleNext = () => {
    // Mark current card as completed
    const newCompletedCards = [...completedCards]
    newCompletedCards[currentChapterIndex][currentSubchapterIndex][currentCardIndex] = true
    setCompletedCards(newCompletedCards)

    if (currentCardIndex < currentSubchapter.flashcards.length - 1) {
      // Next card in same subchapter
      changeCard(currentChapterIndex, currentSubchapterIndex, currentCardIndex + 1)
    } else if (currentSubchapterIndex < currentChapter.subchapters.length - 1) {
      // First card of next subchapter
      changeCard(currentChapterIndex, currentSubchapterIndex + 1, 0)
    } else if (currentChapterIndex < myCourse.chapters.length - 1) {
      // First card of first subchapter of next chapter
      changeCard(currentChapterIndex + 1, 0, 0)
    } else {
      // Wrap to first card of first subchapter of first chapter
      changeCard(0, 0, 0)
    }
  }

  // Handle shuffle
  const handleShuffle = () => {
    const randomChapterIndex = Math.floor(Math.random() * myCourse.chapters.length)
    const randomChapter = myCourse.chapters[randomChapterIndex]
    const randomSubchapterIndex = Math.floor(Math.random() * randomChapter.subchapters.length)
    const randomSubchapter = randomChapter.subchapters[randomSubchapterIndex]
    const randomCardIndex = Math.floor(Math.random() * randomSubchapter.flashcards.length)
    changeCard(randomChapterIndex, randomSubchapterIndex, randomCardIndex)
  }

  // Handle card flip
  const handleCardFlip = () => {
    setFlipped(!flipped)
  }

  // Handle favorite toggle
  const handleFavorite = () => {
    setFavorited(!favorited)
  }

  // Handle chapter selection
  const handleChapterSelect = (chapterIndex: number) => {
    toggleChapterExpansion(chapterIndex)
  }

  // Handle subchapter selection
  const handleSubchapterSelect = (chapterIndex: number, subchapterIndex: number) => {
    changeCard(chapterIndex, subchapterIndex, 0)
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-[18rem] border-r mt-5 p-4 hidden md:block">
        <div className="mb-6">
          <h2 className="font-black text-slate-800 dark:text-slate-300 text-md mb-2">{myCourse.courseName}</h2>
          <Progress value={progress.overall ?? 0} className="h-1.5 mt-4 rounded-full mb-4" />
        </div>

        {/* Chapters list with subchapters */}
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-2">
            {myCourse.chapters.map((chapter, chapterIdx) => (
              <div key={chapterIdx} className="space-y-1">
                <div
                  className="flex items-center gap-2 py-1 cursor-pointer  rounded px-1"
                  onClick={() => handleChapterSelect(chapterIdx)}
                >
                  {expandedChapters[chapterIdx] ? (
                    <ChevronDown className="h-4 w-4 font-black text-slate-800 dark:text-slate-300" />
                  ) : (
                    <ChevronRight className="h-4 w-4 font-black text-slate-800 dark:text-slate-300" />
                  )}
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-300">{chapter.chapterName}</span>
                  <div
                    className={cn(
                      "ml-auto w-5 h-5 rounded-full border-4 flex items-center justify-center",
                      (progress.chapters[chapterIdx] ?? 0) === 100
                        ? "bg-green-500 border-green-500"
                        : (progress.chapters[chapterIdx] ?? 0) > 0
                          ? "bg-white border-green-500"
                          : "bg-white border-gray-300",
                    )}
                  />
                </div>

                {/* Chapter progress bar */}
                <div className="ml-6 mr-2 rounded-full">
                  <Progress value={progress.chapters[chapterIdx] ?? 0} className="h-1 rounded-full" />
                </div>

                {/* Subchapters dropdown */}
                {expandedChapters[chapterIdx] && (
                  <div className="ml-6 space-y-1 mt-2">
                    {chapter.subchapters.map((subchapter, subchapterIdx) => {
                      // Calculate completed cards for this subchapter
                      const completedCount = completedCards[chapterIdx][subchapterIdx].filter(Boolean).length
                      const totalCount = subchapter.flashcards.length

                      return (
                        <div key={subchapterIdx}>
                          <div
                            className={cn(
                              "flex items-center font-medium gap-2 py-1 cursor-pointer  rounded px-1",
                              currentChapterIndex === chapterIdx &&
                                currentSubchapterIndex === subchapterIdx &&
                                "text-bold",
                            )}
                            onClick={() => handleSubchapterSelect(chapterIdx, subchapterIdx)}
                          >
                            <span className="text-xs  text-slate-700 dark:text-slate-300">{subchapter.subchapterName}</span>
                            <span className="ml-auto text-xs  text-slate-600 dark:text-slate-300">
                              {completedCount}/{totalCount}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mb-20 flex flex-col gap-2 justify-center items-center">
            <div 
              onClick={openModal} 
              className="text-xm hover:cursor-pointer font-bold  "
            >
              Add Notes
            </div>
            <div className="text-xm font-bold bg-black text-white dark:bg-white dark:text-black px-2 rounded-mid">
              Favourites
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Flashcard container */}
        <div className="flex-1 p-6 max-w-3xl mx-auto w-full flex flex-col">
          <div className="rounded-lg flex-1 flex flex-col overflow-hidden">
            {/* Card header */}
            <div className="flex px-8 justify-between">
              <div></div>
              <div className="flex justify-center flex-col items-center p-4">
                <div className="text-sm font-black text-gray-600 dark:text-gray-300">
                  {getCurrentCardNumber()} / {totalFlashcards}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-800 dark:text-gray-300 border-2 border-gray-400 text-xs font-bold px-3 py-1 rounded-full">
                    {currentChapter.chapterName} - {currentSubchapter.subchapterName}
                  </span>
                </div>
              </div>
              <Link href="/course/course-details" className="h-full flex items-center">
                <X strokeWidth={3} className="w-6 h-5 font-bold hover:text-red-600 hover:cursor-pointer" />
              </Link>
            </div>

            {/* Card content with 3D flip */}
            <div className="flex-1 flex flex-col font-black dark:text-slate-300 text-slate-800 items-center justify-center p-8 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentChapterIndex}-${currentSubchapterIndex}-${currentCardIndex}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <div className="w-full dark:bg-black border border-gray-300 h-full min-h-[200px] font-semibold text-slate-800 shadow-xl rounded-xl overflow-hidden">
                    <FlashcardWithFlip
                      front={currentFlashcard.question}
                      back={currentFlashcard.answer}
                      flipped={flipped}
                      onFlip={handleCardFlip}
                      onFavorite={handleFavorite}
                      favorited={favorited}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Card footer */}
            <div className="flex items-center justify-between p-4">
              {/* Left spacer */}
              <div className="w-20" />

              {/* Centered arrow buttons */}
              <div className="flex space-x-2">
                <div
                  onClick={handlePrevious}
                  className="w-16 h-9 border border-slate-400 rounded-full hover:bg-gray-100 dark:hover:bg-black transition-colors cursor-pointer flex items-center justify-center"
                >
                  <ArrowLeft className="w-6 h-5 font-bold" />
                </div>

                <div
                  onClick={handleNext}
                  className="w-16 h-9 border border-slate-400 rounded-full hover:bg-gray-100 dark:hover:bg-black transition-colors cursor-pointer flex items-center justify-center"
                >
                  <ArrowRight className="w-6 h-5 font-bold" />
                </div>
              </div>

              {/* Right-aligned Shuffle */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShuffle}
                  disabled={isChanging}
                  className="flex items-center gap-1 hover:bg-gray-100 transition-colors"
                >
                  <Shuffle className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm font-bold">Shuffle</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FlashcardPage() {
  return (
    <ModalProvider>
      <FlashcardContent />
    </ModalProvider>
  )
}
