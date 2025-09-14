"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Globe, Clock, Award, BookOpen, User, Bookmark } from "lucide-react"
import { CustomButton } from "@/components/pages/CustomButton"
import { HoverCard } from "@/components/pages/hoverCardHard"

export default function CourseLandingPage() {
  const [isLoaded, setIsLoaded] = useState(false)
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

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-7xl">
      <div className="flex  flex-col-reverse   lg:flex-row gap-8">
        {/* Left side - Course card */}
       
        <div className="w-full p-2 lg:w-[350px]  h-[70vh] overflow-auto">
        <HoverCard>
          <CardContent className="p-0">
            {/* <div className="relative">
              <Image
                src="/placeholder.svg?height=200&width=350"
                width={350}
                height={200}
                alt="Programmer working at desk with monitors"
                className="w-full object-cover"
              />
            </div> */}

            <div className="p-6 space-y-6">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">
                  $23<span className="text-sm text-gray-500 font-normal">/Course</span>
                </div>
                <div className="flex text-amber-400">
                  <span>★★★★</span>
                  <span className="text-amber-300">★</span>
                </div>
              </div>

              
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">Instructor : Will Potter</span>
                </div>

                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">Lecturer : 4</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">Duration : 2 Hours 32 Minutes</span>
                </div>

                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">Language : English</span>
                </div>

                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">Certificate : Yes</span>
                </div>

                <div className="flex items-center gap-3">
                  <Bookmark className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">Access : Lifetime</span>
                </div>
              </div>
             <CustomButton ><p className="text-sm font-semibold">Try Now!</p></CustomButton>
            </div>
          </CardContent>
          </HoverCard>
        </div>
      

        {/* Right side - Course details */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-3xl md:text-3xl font-bold text-gray-900 mb-4">
              Swift Programming Can Be Used For Android After A Few Years
            </h1>

            <p className="text-gray-600 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ulla laboris nisi ut aliquip ex ea
              commodo consequat. Duis aute irure dolor in reprehenderit in volup velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Overview</h2>

            <p className="text-gray-600 text-sm mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ulla laboris nisi ut aliquip ex ea
              commodo consequat. Duis aute irure dolor in reprehenderit.
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

          <p className="text-gray-600 text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ulla laboris nisi ut aliquip ex ea
            commodo consequat.
          </p>

          <div>
          <CurriculumAccordion />
            
          </div>
        </div>
      </div>
    </div>
  )
}




import { Plus, Minus } from "lucide-react"

// Define the curriculum items structure
interface CurriculumItem {
  id: string
  title: string
  content: string
}
function CurriculumAccordion() {
  // Array of curriculum items
  const curriculumItems: CurriculumItem[] = [
    {
      id: "introduction",
      title: "Introduction",
      content:
        "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa cum sociis natoque penatibus consectetuer adipiscing elit.",
    },
    {
      id: "install-software",
      title: "Install Software",
      content: "Instructions for installing required software and tools for this course.",
    },
    {
      id: "diy-functions",
      title: "DIY Functions",
      content: "Learn how to create and use custom functions to solve problems.",
    },
    {
      id: "shape-maker",
      title: "Shape Maker",
      content: "Create and manipulate shapes using our interactive shape maker tool.",
    },
    {
      id: "grading-quiz",
      title: "Grading Quiz",
      content: "Test your knowledge with our comprehensive grading quiz.",
    },
  ]

  // Track which item is expanded
  const [expandedItem, setExpandedItem] = useState<string>("introduction")

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
            {expandedItem === item.id && <div className="px-6 py-4 text-gray-600 ">{item.content}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

