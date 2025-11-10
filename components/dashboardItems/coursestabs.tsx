"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  ScrollText,
  Briefcase,
  Award,
  Cpu,
  Laptop,
  ShieldCheck,
  Code,
  Coffee,
  SquareIcon as SquareJs,
  SquareIcon as SquareC,
  SquareIcon as SquareG,
  Brackets,
  Palette,
  Smartphone,
  Gamepad,
  CloudCog,
  BarChart,
  LineChart,
  Brain,
  Bot,
  Cloud,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useWindowSize } from "@/hooks/use-window-size"
import Image from "next/image"
import { toast } from "react-hot-toast"
// API data interfaces
interface Course {
  id: number;
  name: string;
}

interface Domain {
  id: number;
  name: string;
  currently_studying: Course[];
  course_library: Course[];
}

// Map icon names to Lucide React components
const iconMap: { [key: string]: any } = {
  ScrollText,
  Briefcase,
  Award,
  Cpu,
  Laptop,
  ShieldCheck,
  Code,
  Coffee,
  SquareJs,
  SquareC,
  SquareG,
  Brackets,

  Palette,
  Smartphone,
  Gamepad,
  CloudCog,
  BarChart,
  LineChart,
  Brain,
  Bot,
  Cloud,
}



const SUBJECTS_PER_LOAD = 8

// Domain component for industry carousel
function Domain({ 
  domains, 
  selectedDomain, 
  onDomainSelect, 
  loading, 
  error 
}: { 
  domains: Domain[]
  selectedDomain: Domain | null
  onDomainSelect: (domain: Domain) => void
  loading: boolean
  error: string | null
}) {
  const domainList = Array.isArray(domains) ? domains : []
  const [industryStartIndex, setIndustryStartIndex] = useState(0)
  const [industriesToShow, setIndustriesToShow] = useState(8)
  const windowSize = useWindowSize()

  // Update industries to show based on window size
  useEffect(() => {
    if (windowSize.width) {
      if (windowSize.width >= 1024) {
        setIndustriesToShow(12) // Show 12 industries on large screens
      } else if (windowSize.width >= 768) {
        setIndustriesToShow(6) // Show 6 industries on medium screens
      } else if (windowSize.width >= 640) {
        setIndustriesToShow(4) // Show 4 industries on small screens
      } else {
        setIndustriesToShow(3) // Show 3 industries on extra small screens
      }
      // Reset carousel position when window size changes
      setIndustryStartIndex(0)
    }
  }, [windowSize.width])

  // Navigation handlers for industry carousel
  const handleIndustryLeft = () => {
    if (industryStartIndex > 0) {
      setIndustryStartIndex(industryStartIndex - 1)
    }
  }
  
  const handleIndustryRight = () => {
    if (industryStartIndex < domainList.length - industriesToShow) {
      setIndustryStartIndex(industryStartIndex + 1)
    }
  }
  
  const isIndustryLeftDisabled = industryStartIndex === 0
  const isIndustryRightDisabled = industryStartIndex >= domainList.length - industriesToShow

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">All Domains</h2>
        </div>
        <div className="w-full border-b-2 mr-8 my-6 sm:my-5">
          <div className="flex space-x-4 min-w-max pr-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse h-8 w-24"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <Image src="/something-went-wrong.png" alt="Something went wrong" width={260} height={260} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">All Domains</h2>
        {domainList.length > industriesToShow && (
          <div className="flex ml-2 gap-2">
            <button
              className={`h-8 w-8 rounded-full border flex items-center justify-center ${
                isIndustryLeftDisabled
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-[#ffd404] border-[#ffd404]"
              }`}
              onClick={handleIndustryLeft}
              disabled={isIndustryLeftDisabled}
              aria-label="Previous domains"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className={`h-8 w-8 rounded-full border flex items-center justify-center ${
                isIndustryRightDisabled
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-[#ffd404] border-[#ffd404]"
              }`}
              onClick={handleIndustryRight}
              disabled={isIndustryRightDisabled}
              aria-label="Next domains"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto border-b-2 sm:overflow-x-hidden mr-8 my-6 sm:my-5">
        {/* Desktop view: show carousel with buttons */}
        {windowSize.width && windowSize.width >= 1024 ? (
          <div className="flex items-center">
            <div className="flex space-x-4 min-w-max pr-4">
              {domainList.slice(industryStartIndex, industryStartIndex + industriesToShow).map((domain) => (
                <button
                  key={domain.id}
                  onClick={() => onDomainSelect(domain)}
                  className={`px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
                    selectedDomain?.id === domain.id
                      ? "border-b-4 border-[#ffd404] text-black dark:text-white "
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {domain.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Mobile view: keep horizontal scroll
          <div className="flex space-x-4 min-w-max pr-4">
            {domainList.map((domain) => (
              <button
                key={domain.id}
                onClick={() => onDomainSelect(domain)}
                className={`px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
                  selectedDomain?.id === domain.id
                    ? "border-b-4 border-[#ffd404] text-black dark:text-white "
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {domain.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Main component combining Domain and Course Tabs
export default function Component() {
  const router = useRouter()
  const [visibleSubjectsCount, setVisibleSubjectsCount] = useState(SUBJECTS_PER_LOAD)
  const [visibleLibraryCount, setVisibleLibraryCount] = useState(SUBJECTS_PER_LOAD)
  
  // API data states
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
  const domainList = Array.isArray(domains) ? domains : []

  // Fetch API data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const token = sessionStorage.getItem('Authorization')


    
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard-paid/`, {
          method: 'GET',
          headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json',
          },
        })


        const data = await response.json()
        setDomains(data)
        
        // Set first domain as selected by default
        if (Array.isArray(data) && data.length > 0) {
          setSelectedDomain(data[0])
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleLoadMore = () => {
    setVisibleSubjectsCount((prevCount) => prevCount + SUBJECTS_PER_LOAD)
  }

  const handleLoadMoreLibrary = () => {
    setVisibleLibraryCount((prevCount) => prevCount + SUBJECTS_PER_LOAD)
  }

  // Handle course registration from course library
  const handleRegisterCourse = async (courseId: number) => {
    try {
      const token = sessionStorage.getItem('Authorization')
      
      if (!token) {
        console.error('No authorization token found')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user_courses/`, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course: courseId.toString(),
          status: 'studying'
        }),
      })

      if (response.ok) {
        toast.success('Course registered successfully')
      } else {
        console.error('Failed to register course:', response.statusText)
        // toast.error('Failed to register course')
      }
    } catch (error) {
      console.error('Error registering course:', error)
    }
  }

  // Get currently studying courses from selected domain
  const currentlyStudyingCourses = selectedDomain?.currently_studying || []
  const courseLibraryCourses = selectedDomain?.course_library || []

  const subjectsToDisplay = currentlyStudyingCourses.slice(0, visibleSubjectsCount)
  const libraryToDisplay = courseLibraryCourses.slice(0, visibleLibraryCount)
  const hasMoreSubjects = visibleSubjectsCount < currentlyStudyingCourses.length
  const hasMoreLibrary = visibleLibraryCount < courseLibraryCourses.length

  if (loading) {
    return (
      <div className="py-8 p-4 rounded-[10px] text-black dark:text-white pt-6">
        <div className="mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">All Domains</h2>
            </div>
            <div className="w-full border-b-2 mr-8 my-6 sm:my-5">
              <div className="text-center py-8">
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-[#ffd404] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#ffd404] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-[#ffd404] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center py-8">
            <div className="text-lg">Loading courses...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <Image src="/nothing.svg" alt="Nothing to show" width={260} height={260} />
      </div>
    )
  }

  if (!loading && !error && domainList.length === 0) {
    return (
      <Link href="/dashboard/add-domain">
      <div className="w-full flex flex-col items-center justify-center py-12 gap-6">
        <Image src="/nothing.svg" alt="Nothing to show" width={260} height={260} />
       
          <p className=" text-foreground text-sm font-semibold">
            Buy domain first
          </p>
          
        
      </div>
      </Link>
    )
  }

  return (
    <div className="py-8 p-4 rounded-[10px] text-black dark:text-white pt-6">
      <div className="mx-auto">
        
       
        {/* Domain Section */}
        <div className="mb-8">
          <Domain 
            domains={domainList}
            selectedDomain={selectedDomain}
            onDomainSelect={setSelectedDomain}
            loading={loading}
            error={error}
          />
        </div>

        {/* Course Tabs Section */}
        <h2 className="text-xl font-bold mb-8 text-black dark:text-white">Our path to exam success starts here</h2>

        <Tabs defaultValue="top-subjects" className="w-full">
          <TabsList className="bg-transparent border-b border-zinc-300 dark:border-zinc-800 mb-8 justify-start h-auto p-0">
            <TabsTrigger
              value="top-subjects"
              className="relative px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-0.5 data-[state=active]:after:bg-yellow-400 rounded-none"
            >
              Currently studying
            </TabsTrigger>
            <TabsTrigger
              value="certification-prep"
              className="relative px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-0.5 data-[state=active]:after:bg-yellow-400 rounded-none"
            >
              Course library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top-subjects">
            {subjectsToDisplay.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
               <Image src="/nothing.svg" alt="No Courses" width={200} height={200} className="mx-auto mb-4" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {subjectsToDisplay.map((course, index) => {
                    // Use a default icon for courses
                    const IconComponent = iconMap["Code"] || Code
                    return (
                     
                      <div
                        key={course.id}
                        className="flex hover:pointer flex-row text-xs sm:text-md items-center text-black dark:text-white hover:text-[#ffd404] dark:hover:text-[#ffd404] justify-start h-auto p-4 border border-gray-800 dark:border-white rounded-[6px] text-left bg-white dark:bg-black hover:bg-[#282434] dark:hover:bg-[#282434] transition-colors gap-3 cursor-pointer"
                        onClick={() => {
                         sessionStorage.setItem('course_id', course.id.toString());
                         sessionStorage.setItem('course_name', course.name);
                         router.push(`/course/${course.id}`);      
                        }}
                      >
                      
                        <IconComponent className="w-6 h-6" />
                        <span className="text-base font-medium">{course.name}</span>

                      </div>
                 
                    )
                  })}
                </div>
                
                {hasMoreSubjects && (
                  <div className="mt-9 text-center">
                    <div onClick={handleLoadMore} className="inline-flex font-bold items-center text-[#ffd404] hover:text-yellow-300 cursor-pointer">
                      load more
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="certification-prep">
            {libraryToDisplay.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Image src="/nothing.svg" alt="No Courses" width={200} height={200} className="mx-auto mb-4" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {libraryToDisplay.map((course, index) => {
                    // Use a default icon for courses
                    const IconComponent = iconMap["Code"] || Code
                    return (
                     
                      <div
                        key={course.id}
                        className="flex flex-row items-center text-xs sm:text-md text-black dark:text-white hover:text-[#ffd404] dark:hover:text-[#ffd404] justify-start h-auto p-4 border border-gray-600 dark:border-white rounded-[6px] text-left bg-white dark:bg-black hover:bg-[#282434] dark:hover:bg-[#282434] transition-colors gap-3 cursor-pointer"
                        onClick={() => {
                          handleRegisterCourse(course.id)
                          sessionStorage.setItem('course_id', course.id.toString());
                          sessionStorage.setItem('course_name', course.name);

                          router.push(`/course/${course.id}`)
                        }}
                     >
                        <IconComponent className="w-6 h-6" />
                        <span className="text-base font-medium">{course.name}</span>
                      </div>
                      //  </Link>
                    )
                  })}
                </div>
                
                {hasMoreLibrary && (
                  <div className="mt-9 text-center">
                    <div onClick={handleLoadMoreLibrary} className="inline-flex font-bold items-center text-[#ffd404] hover:text-yellow-300 cursor-pointer">
                      load more
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
