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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

const PRICING = {
  monthly: 5.99,
  annually: 79.99,
}

// Stripe Price IDs
const STRIPE_PRICE_IDS = {
  monthly: "price_1SQ9Ac00CDQdww264AvpWJv0",
  yearly: "price_1SQ9CM00CDQdww26Sh4FRNYr",
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
          <h2 className="text-lg font-bold">Industries Marketplace</h2>
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
        <h2 className="text-lg font-bold">Industries Marketplace</h2>
        {domainList.length > industriesToShow && (
          <div className="flex ml-2 gap-2">
            <button
              className={`h-8 w-8 rounded-full border flex items-center justify-center ${
                isIndustryLeftDisabled
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-xcolor border-xcolor"
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
                  : "text-xcolor border-xcolor"
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
                      ? "border-b-4 border-xcolor text-black dark:text-white "
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
                    ? "border-b-4 border-xcolor text-black dark:text-white "
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
export default function PaidComponent() {
  const router = useRouter()
  const [visibleSubjectsCount, setVisibleSubjectsCount] = useState(SUBJECTS_PER_LOAD)
  const [visibleLibraryCount, setVisibleLibraryCount] = useState(SUBJECTS_PER_LOAD)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [purchaseStep, setPurchaseStep] = useState<1 | 2>(1)
  const [selectedSubscription, setSelectedSubscription] = useState<'monthly' | 'yearly' | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  
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


    
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard-unpaid/`, {
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

  const openPurchaseModal = (course: Course) => {
    setSelectedCourse(course)
    setPurchaseStep(1)
    setSelectedSubscription(null)
    setIsProcessingPayment(false)
    setPurchaseModalOpen(true)
  }

  const handlePurchaseDomain = () => {
    setPurchaseStep(2)
  }

  const handleProceedWithPayment = async () => {
    if (!selectedSubscription || !selectedDomain) {
      toast.error('Please select a subscription plan')
      return
    }

    setIsProcessingPayment(true)

    try {
      const token = sessionStorage.getItem('Authorization')
      
      if (!token) {
        toast.error('Please sign in to continue')
        setIsProcessingPayment(false)
        return
      }

      const domainId = selectedDomain.id
      const planInterval = selectedSubscription === 'monthly' ? 'monthly' : 'yearly'
      const priceId = selectedSubscription === 'monthly' ? STRIPE_PRICE_IDS.monthly : STRIPE_PRICE_IDS.yearly

      // Create Stripe checkout session
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/create-checkout-session/`, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain_id: domainId,
          plan_interval: planInterval,
          price_id: priceId
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Failed to create checkout session')
      }

      // Redirect to Stripe checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to proceed with payment')
      setIsProcessingPayment(false)
    }
  }

  const handleCloseModal = () => {
    setPurchaseModalOpen(false)
    setPurchaseStep(1)
    setSelectedSubscription(null)
    setIsProcessingPayment(false)
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
      <div className="py-2 p-4 rounded-[10px] text-black dark:text-white ">
        <div className="mx-auto">
          <div className="mb-8">
            
            <div className="w-full  my-8">
              <div className="text-center py-8">
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-xcolor rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-xcolor rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-xcolor rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
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
      <div className="w-full bg-background flex flex-col items-center justify-center py-12 gap-6">
        <Image src="/nothing.svg" alt="Nothing to show" width={260} height={260} />
       
          <p className=" text-foreground text-sm font-semibold">
           Wait for our new domains to be added.
          </p>
          
        
      </div>
      </Link>
    )
  }

  return (
    <>
    <div className="mb-8 px-2 rounded-[10px] text-black dark:text-white ">
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
        <h2 className="text-lg font-bold mb-8 text-black dark:text-white">Checkout on any Course to buy that industry</h2>

        <Tabs defaultValue="course-library" className="w-full">
          <TabsList className="bg-transparent border-b border-zinc-300 dark:border-zinc-800 mb-8 justify-start h-auto p-0">
            {/* <TabsTrigger
              value="top-subjects"
              className="relative px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-0.5 data-[state=active]:after:bg-xcolor rounded-none"
            >
              Currently studying
            </TabsTrigger> */}
            <TabsTrigger
              value="course-library"
              className="relative px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-0.5 data-[state=active]:after:bg-xcolor rounded-none"
            >
              Course library of this industry
            </TabsTrigger>
          </TabsList>

          {/* <TabsContent value="top-subjects">
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
                        className="flex hover:pointer flex-row text-xs sm:text-md items-center text-black dark:text-white hover:text-xcolor dark:hover:text-xcolor justify-start h-auto p-4 border border-gray-800 dark:border-white rounded-[6px] text-left bg-white dark:bg-black hover:bg-[#282434] dark:hover:bg-[#282434] transition-colors gap-3 cursor-pointer"
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
                    <div onClick={handleLoadMore} className="inline-flex font-bold items-center text-xcolor hover:text-yellow-300 cursor-pointer">
                      load more
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent> */}
          
          <TabsContent value="course-library">
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
                        className="flex flex-row items-center text-xs sm:text-md text-black dark:text-white hover:text-xcolor dark:hover:text-xcolor justify-start h-auto p-4 border border-gray-600 dark:border-white rounded-[6px] text-left bg-white dark:bg-black hover:bg-[#282434] dark:hover:bg-[#282434] transition-colors gap-3 cursor-pointer"
                        onClick={() => openPurchaseModal(course)}
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
                    <div onClick={handleLoadMoreLibrary} className="inline-flex font-bold items-center text-xcolor hover:text-yellow-300 cursor-pointer">
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
      <Dialog open={purchaseModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[700px] max-w-[600px] h-[90vh] sm:h-[80vh] md:h-[80vh] max-h-[90vh] sm:max-h-[80vh] md:max-h-[80vh] flex flex-col p-0">
          {/* Step Tabs */}
          <div className="flex-shrink-0 flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setPurchaseStep(1)}
              className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                purchaseStep === 1
                  ? 'text-black dark:text-white border-b-2 border-xcolor font-bold'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="hidden sm:inline">Step 1: </span>Confirm Purchase
            </button>
            <button
              onClick={() => purchaseStep === 2 && setPurchaseStep(2)}
              className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                purchaseStep === 2
                  ? 'text-black dark:text-white border-b-2 border-xcolor font-bold'
                  : 'text-gray-600 dark:text-gray-400'
              } ${purchaseStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={purchaseStep === 1}
            >
              <span className="hidden sm:inline">Step 2: </span>Choose Plan
            </button>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {purchaseStep === 1 ? (
              <>
                <DialogHeader className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                  <DialogTitle className="text-base sm:text-lg font-semibold">
                    {`Purchase ${selectedDomain?.name || 'this domain'}?`}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm mt-1">
                    Unlock this industry and get access to the following courses. They will be added to your dashboard immediately after purchase.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {(selectedDomain?.course_library || []).map((course) => {
                      const IconComponent = iconMap["Code"] || Code
                      return (
                        <div
                          key={course.id}
                          className="flex flex-row items-center text-xs sm:text-sm text-black dark:text-white hover:text-xcolor dark:hover:text-xcolor justify-start h-auto p-3 sm:p-4 border border-gray-600 dark:border-white rounded-[6px] text-left bg-white dark:bg-black hover:bg-[#282434] dark:hover:bg-[#282434] transition-colors gap-2 sm:gap-3"
                        >
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                          <span className="text-sm sm:text-base font-medium truncate">{course.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <DialogHeader className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                  <DialogTitle className="text-base sm:text-lg font-semibold">
                    Choose Your Subscription Plan
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm mt-1">
                    Select a monthly or yearly plan to proceed with your purchase.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Monthly Card */}
                  <div
                    onClick={() => setSelectedSubscription('monthly')}
                    className={`relative sm:aspect-square p-4 sm:p-6 border-2 rounded-[6px] cursor-pointer transition-all min-h-[140px] sm:min-h-0 ${
                      selectedSubscription === 'monthly'
                        ? 'border-xcolor bg-[#282434] dark:bg-[#282434]'
                        : 'border-gray-600 dark:border-white bg-white dark:bg-black hover:bg-[#282434] dark:hover:bg-[#282434]'
                    }`}
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-black dark:text-white mb-1 sm:mb-2">Monthly</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Pay monthly and get full access
                        </p>
                      </div>
                      <div className="mt-auto pt-2">
                        <div className="text-xl sm:text-2xl font-bold text-xcolor">${PRICING.monthly}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">per month</div>
                      </div>
                    </div>
                    {selectedSubscription === 'monthly' && (
                      <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-xcolor rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Yearly Card */}
                  <div
                    onClick={() => setSelectedSubscription('yearly')}
                    className={`relative sm:aspect-square p-4 sm:p-6 border-2 rounded-[6px] cursor-pointer transition-all min-h-[140px] sm:min-h-0 ${
                      selectedSubscription === 'yearly'
                        ? 'border-xcolor bg-[#282434] dark:bg-[#282434]'
                        : 'border-gray-600 dark:border-white bg-white dark:bg-black hover:bg-[#282434] dark:hover:bg-[#282434]'
                    }`}
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-black dark:text-white mb-1 sm:mb-2">Yearly</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Save more with annual billing
                        </p>
                      </div>
                      <div className="mt-auto pt-2">
                        <div className="text-xl sm:text-2xl font-bold text-xcolor">${PRICING.annually}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">per year</div>
                      </div>
                    </div>
                    {selectedSubscription === 'yearly' && (
                      <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-xcolor rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800">
            {purchaseStep === 1 ? (
              <>
                <Button variant="ghost" className="w-full sm:w-auto order-2 sm:order-1" onClick={handleCloseModal}>
                  Maybe later
                </Button>
                <Button className="w-full sm:w-auto bg-xcolor hover:bg-xcolor text-black font-semibold order-1 sm:order-2 text-sm sm:text-base" onClick={handlePurchaseDomain}>
                  <span className="hidden sm:inline">Yes, purchase this domain</span>
                  <span className="sm:hidden">Purchase Domain</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full sm:w-auto order-2 sm:order-1" onClick={() => setPurchaseStep(1)}>
                  Back
                </Button>
                <Button 
                  className="w-full sm:w-auto bg-xcolor hover:bg-xcolor text-black font-semibold order-1 sm:order-2 text-sm sm:text-base" 
                  onClick={handleProceedWithPayment}
                  disabled={!selectedSubscription || isProcessingPayment}
                >
                  {isProcessingPayment ? 'Processing...' : (
                    <>
                      <span className="hidden sm:inline">Proceed with Payment</span>
                      <span className="sm:hidden">Proceed to Payment</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
