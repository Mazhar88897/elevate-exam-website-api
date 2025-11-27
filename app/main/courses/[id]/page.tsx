"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Globe, Clock, Award, BookOpen, User, Bookmark } from "lucide-react"
import { CustomButton } from "@/components/pages/CustomButton"
import { HoverCard } from "@/components/pages/hoverCardHard"
import { PurchaseModal } from "@/components/pages/PurchaseModal"

interface Announcement {
  id: number
  primary_text: string
  secondary_text: string
  created_at: string
}

interface Subtopic {
  id: number
  name: string
}

interface Chapter {
  id: number
  name: string
  subtopics: Subtopic[]
}

interface CourseDetails {
  id: number
  name: string
  about_primary: string
  about_secondary: string
  total_questions: number
  total_chapters: number
  announcements: Announcement[]
  chapters: Chapter[]
}

export default function CourseLandingPage() {
  const params = useParams()
  const courseId = params.id
  const [courseData, setCourseData] = useState<CourseDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [progressValues, setProgressValues] = useState({
    handleAdvanced: 0,
    dimensionalityReduction: 0,
    machineLearning: 0,
    modelSelection: 0,
  })

  const finalValues = {
    handleAdvanced: 80,
    dimensionalityReduction: 92,
    machineLearning: 73,
    modelSelection: 85,
  }

  // Fetch course details from API
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/course_details/${courseId}/`, {
          method: 'GET',
          headers: {
            // 'Authorization': `${sessionStorage.getItem('Authorization')}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch course details')
        }
        
        const data: CourseDetails = await response.json()
        setCourseData(data)
      } catch (error) {
        console.error('Error fetching course details:', error)
        setError('Failed to load course details')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourseDetails()
    }
  }, [courseId])

  useEffect(() => {
    // Set a small delay to ensure the component is rendered before animation starts
    const timer = setTimeout(() => {
      setIsLoaded(true)

      // Animate progress bars
      const duration = 1500 // Animation duration in ms
      const steps = 20 // Number of steps in the animation
      const interval = duration / steps

      let currentStep = 0

      const animationInterval = setInterval(() => {
        currentStep++
        const progress = Math.min(currentStep / steps, 1)

        setProgressValues({
          handleAdvanced: Math.round(finalValues.handleAdvanced * progress),
          dimensionalityReduction: Math.round(finalValues.dimensionalityReduction * progress),
          machineLearning: Math.round(finalValues.machineLearning * progress),
          modelSelection: Math.round(finalValues.modelSelection * progress),
        })

        if (currentStep >= steps) {
          clearInterval(animationInterval)
        }
      }, interval)

      return () => {
        clearInterval(animationInterval)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading course details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !courseData) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-600">{error || 'Course not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <PurchaseModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex  flex-col-reverse   lg:flex-row gap-8">
        {/* Left side - Course card */}
       
        <div className="w-full p-2 lg:w-[350px]  h-[70vh] overflow-auto">
        <HoverCard>
          <CardContent className="p-0">
            <div className="p-6 space-y-6">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">
                £5.99<span className="text-sm text-gray-500 font-normal">/Domain</span>
                </div>
               
              </div>

              
              <div className="space-y-4 pt-2">
                

                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">Chapters : {courseData.total_chapters}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">Questions : {courseData.total_questions}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">Language : English</span>
                </div>

                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">Analytics : Yes</span>
                </div>

                <div className="flex items-center gap-3">
                  <Bookmark className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">Access : Yearly</span>
                </div>
                <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">AI Assistant : Yes</span>
                
                </div>
              </div>
             <CustomButton onClick={() => setIsModalOpen(true)}><p className="text-sm font-semibold">Try Now!</p></CustomButton>
            </div>
          </CardContent>
          </HoverCard>
        </div>
      

        {/* Right side - Course details */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-3xl md:text-3xl font-bold text-gray-900 mb-4">
              {courseData.name}
            </h1>

            <p className="text-gray-600 text-sm mb-4">
              {courseData.about_primary}
            </p>

            <p className="text-gray-600 text-sm">
              {courseData.about_secondary}
            </p>
          </div>

          {/* Announcements */}
          {courseData.announcements && courseData.announcements.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Announcements</h2>
              <div className="space-y-4">
                {courseData.announcements.map((announcement) => (
                  <div key={announcement.id} className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <p className="font-medium text-blue-800">{announcement.primary_text}</p>
                    <p className="text-blue-600 text-sm mt-1">{announcement.secondary_text}</p>
                    <p className="text-blue-500 text-xs mt-2">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-4">Overview</h2>

            <p className="text-gray-600 text-sm mb-6">
              This course covers essential concepts and practical applications. 
              With {courseData.total_chapters} chapters and {courseData.total_questions} questions, 
              you&apos;ll gain comprehensive knowledge in this field.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">Handle Advanced</span>
                  <span className="text-black">{progressValues.handleAdvanced}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressValues.handleAdvanced}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">Dimensionality Reduction</span>
                  <span>{progressValues.dimensionalityReduction}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressValues.dimensionalityReduction}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">Machine Learning</span>
                  <span>{progressValues.machineLearning}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressValues.machineLearning}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">Model Selection</span>
                  <span>{progressValues.modelSelection}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressValues.modelSelection}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div>
          <CurriculumAccordion courseData={courseData} />
            
          </div>
        </div>
      </div>
    </div>
    </>
  )
}




import { Plus, Minus } from "lucide-react"

// Define the curriculum items structure
interface CurriculumItem {
  id: string
  title: string
  content: string
  subtopics?: Subtopic[]
}

function CurriculumAccordion({ courseData }: { courseData: CourseDetails }) {
  // Convert API chapters to curriculum items
  const curriculumItems: CurriculumItem[] = courseData.chapters.map((chapter) => ({
    id: `chapter-${chapter.id}`,
    title: chapter.name,
    content: `Explore ${chapter.name} and the topics covered in it, arranged in a logical order to help you understand the material better.`,
    subtopics: chapter.subtopics,
  }))

  // Track which item is expanded
  const [expandedItem, setExpandedItem] = useState<string>(curriculumItems.length > 0 ? curriculumItems[0].id : "")

  // Toggle function for accordion items
  const toggleItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? "" : itemId)
  }

  return (
    <div className="  ">
      <h1 className="text-2xl    font-bold mb-6">Curriculum</h1>

      <div className="space-y-4 ">
        {curriculumItems.map((item) => (
          <div key={item.id} className=" rounded-lg  ">
            {/* Custom accordion header with plus/minus icons */}
            <HoverCard >
            <div
              className="flex justify-between border items-center px-6 py-3 cursor-pointer "
              onClick={() => toggleItem(item.id)}
            >
              <span className="text-lg font-medium">{item.title}</span>
              {expandedItem === item.id ? (
                <Minus className="h-5 w-5 text-blue-800 " />
              ) : (
                <Plus className="h-5 w-5 text-gray-800" />
              )}
            </div>
            </HoverCard>
            {/* Content area that shows/hides based on state */}
            {expandedItem === item.id && (
              <div className="px-6 py-4 text-gray-600">
                <p className="mb-4 text-sm">{item.content}</p>
                {item.subtopics && item.subtopics.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Topics covered:</h4>
                    <ul className="space-y-1">
                      {item.subtopics.map((subtopic) => (
                        <li key={subtopic.id} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="text-md font-semibold">{subtopic.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

