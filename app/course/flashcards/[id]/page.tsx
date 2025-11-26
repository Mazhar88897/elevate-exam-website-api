"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Star, X, ArrowLeft, ArrowRight, Shuffle, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"

// API data interfaces
interface FlashcardAPI {
  id: number;
  primary_text: string;
  secondary_text: string;
}

// Utility function for class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

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

// Flashcard component with 3D flip effect - Built from scratch
const FlashcardWithFlip = ({
  front,
  back,
  flipped,
  onFlip,
  onFavorite,
  favorited,
  isFavoriteLoading,
}: {
  front: string
  back: string
  flipped: boolean
  onFlip: () => void
  onFavorite: () => void
  favorited: boolean
  isFavoriteLoading: boolean
}) => {
  return (
    <div 
      className="w-full h-full relative cursor-pointer"
      onClick={onFlip}
      style={{
        perspective: "1000px",
      }}
    >
      {/* Card container with 3D transform */}
      <div
        className="relative w-full h-full transition-transform duration-700 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front face of card */}
        <div
          className="absolute inset-0 w-full h-full bg-white dark:bg-slate-900 rounded-xl flex flex-col items-center justify-center p-8 md:p-12 shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          {/* Favorite button */}
          {/* <button
            onClick={(e) => {
              e.stopPropagation()
              onFavorite()
            }}
            className="absolute top-5 right-5 z-20 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            aria-label="Toggle favorite"
          >
            <Star 
              className={cn(
                "h-6 w-6 transition-all duration-200",
                favorited 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              )} 
            />
          </button> */}

          {/* Front content */}
          <div className="relative z-10 w-full max-w-2xl px-4">
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white leading-tight mb-6">
              {front}
            </div>
            <div className="text-xs md:text-sm text-center text-gray-500 dark:text-gray-400 font-medium mt-6">
              Click to flip
            </div>
          </div>
        </div>

        {/* Back face of card */}
        <div
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black rounded-xl flex flex-col items-center justify-center p-8 md:p-12 shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Favorite button */}
         

          {/* Back content */}
          <div className="relative z-10 w-full max-w-2xl px-4">
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-center text-gray-900 dark:text-white leading-relaxed mb-6">
              {back}
            </div>
            <div className="text-xs md:text-sm text-center text-gray-500 dark:text-gray-400 font-medium mt-6">
              Click to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FavoritesFlashcardPage() {
  const params = useParams()
  const courseId = params.id as string

  // API data states
  const [flashcards, setFlashcards] = useState<FlashcardAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Current card state
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  
  // Ref to track if fetch has been initiated (prevents duplicate fetches in Strict Mode)
  const hasFetchedRef = React.useRef<string | null>(null)

  // Fetch API data
  useEffect(() => {
    // Prevent duplicate fetches (especially in React Strict Mode)
    // Use courseId as key to allow refetch when courseId changes
    if (hasFetchedRef.current === courseId) {
      return
    }
    
    if (!courseId) {
      return
    }
    
    hasFetchedRef.current = courseId
    
    const fetchFavoritesData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const token = sessionStorage.getItem('Authorization')
        
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/favorites/course/${courseId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }

        const data: FlashcardAPI[] = await response.json()
        setFlashcards(data)
        
        // Reset to first card when data loads
        setCurrentCardIndex(0)
        setFlipped(false)
      } catch (err) {
        console.error('Error fetching favorites data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load flashcards')
        // Reset ref on error so it can retry if needed
        hasFetchedRef.current = null
      } finally {
        setLoading(false)
      }
    }

    fetchFavoritesData()
  }, [courseId])

  // Current flashcard
  const currentFlashcard = flashcards[currentCardIndex]

  // Handle navigation with animation
  const changeCard = (cardIdx: number) => {
    setIsChanging(true)
    setFlipped(false)
    setFavorited(false) // Reset favorited state when changing cards

    setTimeout(() => {
      setCurrentCardIndex(cardIdx)
      setIsChanging(false)
    }, 300)
  }

  const handlePrevious = () => {
    if (flashcards.length === 0) return

    if (currentCardIndex > 0) {
      changeCard(currentCardIndex - 1)
    } else {
      // Wrap to last card
      changeCard(flashcards.length - 1)
    }
  }

  const handleNext = () => {
    if (flashcards.length === 0) return

    if (currentCardIndex < flashcards.length - 1) {
      changeCard(currentCardIndex + 1)
    } else {
      // Wrap to first card
      changeCard(0)
    }
  }

  // Handle shuffle
  const handleShuffle = () => {
    if (flashcards.length === 0) {
      return
    }

    const randomIndex = Math.floor(Math.random() * flashcards.length)
    changeCard(randomIndex)
  }

  // Handle card flip
  const handleCardFlip = () => {
    setFlipped(!flipped)
  }

  // Handle favorite toggle
  const handleFavorite = async () => {
    if (!currentFlashcard) return
    
    setIsFavoriteLoading(true)
    try {
      const token = sessionStorage.getItem('Authorization')
      
      if (!token) {
        throw new Error('Missing authorization token')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/favorites/`, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flashcard: currentFlashcard.id,
          course: parseInt(courseId),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update favorite')
      }

      // Toggle the favorited state on success
      setFavorited(!favorited)
    } catch (err) {
      console.error('Error updating favorite:', err)
      // Optionally show a toast error message
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center space-x-1 mb-4">
            <div className="w-2 h-2 bg-xcolor rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-xcolor rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-xcolor rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Image src="/nothing.png" alt="No Flashcards" width={200} height={200} className="mx-auto mb-4" />
          <div className="text-lg">No flashcards available</div>
        </div>
      </div>
    )
  }
  const courseName = sessionStorage.getItem('course_name') || ''
  return (
    <div className="h-full  flex flex-col">
      {/* Main content */}
      <div className=" flex flex-col">
        {/* Flashcard container */}
        <div className="flex-1  max-w-3xl mx-auto w-full flex flex-col">
          <div className="rounded-lg  flex flex-col overflow-hidden">
            {/* Card header */}
            <div className="flex px-8 justify-between">
              <div></div>
              <div className="flex justify-center flex-col items-center">
                <div className="text-sm font-black text-gray-600 dark:text-gray-300">
                  {currentCardIndex + 1} / {flashcards.length}
                </div>
                {courseName ? <div className="text-sm pt-1 font-black text-gray-600 dark:text-gray-300">{courseName}</div> : <div></div>}
              </div>
              <div></div>
            </div>

            {/* Card content with 3D flip */}
            <div className="flex-1 flex flex-col font-black dark:text-slate-300 text-slate-800 items-center justify-center p-8 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCardIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <div className="w-full max-w-[600px] h-[400px] md:w-[600px] dark:bg-black border border-gray-300 font-semibold text-slate-800 shadow-xl rounded-xl overflow-hidden">
                    {currentFlashcard ? (
                      <FlashcardWithFlip
                        front={currentFlashcard.primary_text}
                        back={currentFlashcard.secondary_text}
                        flipped={flipped}
                        onFlip={handleCardFlip}
                        onFavorite={handleFavorite}
                        favorited={favorited}
                        isFavoriteLoading={isFavoriteLoading}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center px-8 text-center">
                        <p className="text-base font-semibold text-gray-600 dark:text-gray-300">
                          No flashcards are available.
                        </p>
                      </div>
                    )}
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

