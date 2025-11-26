"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Play, Clock, FileStack } from "lucide-react"
import Image from "next/image"
import { Megaphone } from "lucide-react";
import Access from "@/components/dashboardItems/access";
import Link from "next/link";
import { useParams } from "next/navigation";

// API data interfaces
interface SubTopic {
  id: number;
  name: string;
}

interface Chapter {
  id: number;
  name: string;
  subtopics: SubTopic[];
}

interface Announcement {
  id: number;
  primary_text: string;
  secondary_text: string;
  created_at: string;
}

interface CourseDetails {
  id: number;
  name: string;
  about_primary: string;
  about_secondary: string;
  total_questions: number;
  total_chapters: number;
  announcements: Announcement[];
  chapters: Chapter[];
}
export default function CoursePage() {
  const params = useParams()
  const courseId = params.id as string
  
  // State management
  const [courseData, setCourseData] = useState<CourseDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"about" | "announcement">("about")
  const [expandedChapter, setExpandedChapter] = useState<number | null>(0)

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const token = sessionStorage.getItem('Authorization')
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/course_details/${courseId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch course details: ${response.status} ${response.statusText}`)
        }
        
        const data: CourseDetails = await response.json()
        setCourseData(data)
      } catch (error) {
        console.error('Error fetching course details:', error)
        setError(error instanceof Error ? error.message : 'Failed to load course details')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourseDetails()
    }
  }, [courseId])

  const toggleChapter = (index: number) => {
    if (expandedChapter === index) {
      setExpandedChapter(null)
    } else {
      setExpandedChapter(index)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="px-3">
        <div className="px-5 py-5 md:pt-0"></div>
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 px-4">
            <div className="text-center py-8">
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-xcolor rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-xcolor rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-xcolor rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <div className="text-lg mt-4">Loading course details...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="px-3">
        <div className="px-5 py-5 md:pt-0"></div>
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 px-4">
            <div className="text-center py-8">
              <Image src="/nothing.png" alt="Error" width={200} height={200} className="mx-auto mb-4" />
              <div className="text-lg text-red-500">{error}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No course data
  if (!courseData) {
    return (
      <div className="px-3">
        <div className="px-5 py-5 md:pt-0"></div>
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 px-4">
            <div className="text-center py-8">
              <Image src="/nothing.png" alt="No Course" width={200} height={200} className="mx-auto mb-4" />
              <div className="text-lg">Course not found</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3">
     <div className="px-5   py-5 md:pt-0">
    {/* <Access /> */}
    </div>
    <div className="flex flex-col md:flex-row">
   
      <div className="flex-1 px-4">
        <div className="mb-4">
          <h1 className="text-lg font-black ">{courseData.name}</h1>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mt-1">
            <span className="flex items-center mr-4 font-bold">
            <Clock className="w-4 h-4 mr-1" strokeWidth={3} />
              Total {courseData.total_questions} questions
            </span>
            <span className="flex items-center font-bold">
            <FileStack className="w-4 h-4 mr-1" strokeWidth={3} />
              {courseData.total_chapters} Chapters
            </span>
          </div>
        </div>

        <div className="h-48 rounded-lg overflow-hidden mb-6 border-">
          <div className="aspect-video flex items-center justify-center">
            <Image
              src="/animation.png"
              alt="Course video thumbnail"
              width={300}
              height={260}
              className="w-full h-full object-cover opacity-70"
            />
            {/* <div className="absolute inset-0 flex items-center justify-center">
              <button className="bg-white rounded-full p-3 shadow-lg">
                <Play className="w-8 h-8 text-gray-800 fill-current" />
              </button>
            </div> */}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActiveTab("about")}
              className={`px-4 text-xs py-2 rounded-mid ${
                activeTab === "about" ? "bg-xcolor text-white" : "bg-[#f0f0ff]  text-xcolor"
              }`}
            >
             <p className="font-bold text-xs"> About the Course</p>
            </button>
            <button
              onClick={() => setActiveTab("announcement")}
              className={`px-4 text-xs py-2 rounded-md ${
                activeTab === "announcement" ? "bg-xcolor text-white" : "bg-[#f0f0ff]  text-xcolor"
              }`}
            >
              <p className="font-bold text-xs">Announcement</p>
            </button>
          </div>

          {activeTab === "about" && (
            <div className=" border-2 p-6 rounded-mid shadow-sm">
              <h2 className="text-md font-bold mb-4">About the Course</h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                {courseData.about_primary}
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                {courseData.about_secondary}
              </p>

              {/* <h3 className="text-md font-bold mt-6 mb-4">What will you learn here</h3>
              <ul className="text-gray-700 dark:text-gray-300 text-sm">
                {courseData.chapters.map((chapter, index) => (
                  <li key={chapter.id} className="flex items-start">
                    <svg className="w-5 h-5 text-green-800 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{chapter.name}</span>
                  </li>
                ))}
              </ul> */}
            </div>
          )}

          {activeTab === "announcement" && (
            <div className=" p-6 border-2 rounded-mid shadow-sm">
              <h2 className="text-md font-bold mb-4">Announcement</h2>

              <div className="space-y-4">
                {courseData.announcements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Image src="/nothing.png" alt="No Announcements" width={200} height={200} className="mx-auto mb-4" />
                    <div>No announcements available</div>
                  </div>
                ) : (
                  courseData.announcements.map((announcement) => (
                    <div key={announcement.id} className="p-4 rounded-mid">
                      <div className="flex">
                        <Megaphone className="w-5 h-5 mr-2" strokeWidth={3} />
                        <h3 className="font-bold text-gray-900 dark:text-gray-300">{announcement.primary_text}</h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {announcement.secondary_text}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full mb-10 md:w-96 py-4 border-2 dark:border-gray-800 border-gray-200">
        <div className=" rounded-lg shadow-sm p-4">
          <h2 className="font-bold text-md mb-4">Course Content & Chapters</h2>

          <div className="space-y-2">
            {courseData.chapters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Image src="/nothing.png" alt="No Chapters" width={150} height={150} className="mx-auto mb-4" />
                <div>No chapters available</div>
              </div>
            ) : (
              courseData.chapters.map((chapter, index) => (
                <div key={chapter.id} className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
                  <button
                    onClick={() => toggleChapter(index)}
                    className="w-full flex items-center justify-between p-3 text-left"
                  >
                    <span className="text-sm font-bold">
                      {String(index + 1).padStart(2, '0')} {chapter.name}
                    </span>
                    {expandedChapter === index ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  {expandedChapter === index && (
                    <div className="p-3 bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-gray-800">
                      <ul className="space-y-2 text-sm font font-semibold text-slate-600 dark:text-slate-100">
                        {chapter.subtopics.length === 0 ? (
                          <li className="text-gray-500">No subtopics available</li>
                        ) : (
                          chapter.subtopics.map((subtopic) => (
                            <li key={subtopic.id}>{subtopic.name}</li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* <Link href="/pages/exam" className="w-full mt-6 bg-[#35821B] text-white py-2 rounded-mid font-semibold text-sm flex items-center justify-center">
            Start Course 
            <svg className="w-4 h-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link> */}
        </div>
      </div>
    </div>
    </div>
  )
}
