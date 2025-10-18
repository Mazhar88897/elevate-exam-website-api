"use client" // This component now needs client-side interactivity

import React from "react"

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
} from "lucide-react"
import { useRouter } from "next/navigation"

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

const allSubjects = [
  { name: "Code foundations", icon: "Award" }, // Changed icon to match the new image
  { name: "Professional skills", icon: "Briefcase" },
  { name: "Python", icon: "Code" },
  { name: "HTML & CSS", icon: "Brackets" },
  { name: "Data science", icon: "BarChart" },
  { name: "Java", icon: "Coffee" },
  { name: "Web development", icon: "CodeXml" },
  { name: "Data analytics", icon: "LineChart" },
  { name: "Interview prep", icon: "Award" },
  { name: "JavaScript", icon: "SquareJs" },
  { name: "Web design", icon: "Palette" },
  { name: "Machine learning", icon: "Brain" },
  { name: "Computer science", icon: "Cpu" },
  { name: "C++", icon: "SquareC" },
  { name: "Mobile development", icon: "Smartphone" },
  { name: "AI", icon: "Bot" },
  { name: "IT", icon: "Laptop" },
  { name: "C#", icon: "SquareC" },
  { name: "Game development", icon: "Gamepad" },
  { name: "Cloud computing", icon: "Cloud" },
  { name: "Cybersecurity", icon: "ShieldCheck" },
  { name: "Go", icon: "SquareG" },
  { name: "DevOps", icon: "CloudCog" },
  { name: "Certification prep", icon: "Award" },
  // Add more subjects here to demonstrate load more
  { name: "Networking", icon: "Cloud" },
  { name: "Databases", icon: "BarChart" },
  { name: "Algorithms", icon: "Brain" },
  { name: "Operating Systems", icon: "Cpu" },
  { name: "Software Engineering", icon:"Brain" },
  { name: "Project Management", icon: "Briefcase" },
]

const courseLibrarySubjects = [
  { name: "AWS Certification", icon: "Cloud" },
  { name: "Microsoft Azure", icon: "CloudCog" },
  { name: "Google Cloud", icon: "Cloud" },
  { name: "Cisco Networking", icon: "Cpu" },
  { name: "CompTIA A+", icon: "Laptop" },
  { name: "CompTIA Security+", icon: "ShieldCheck" },
  { name: "PMP Certification", icon: "Briefcase" },
  { name: "Scrum Master", icon: "Award" },
  { name: "Data Science Professional", icon: "BarChart" },
  { name: "Machine Learning Engineer", icon: "Brain" },
  { name: "Full Stack Developer", icon: "Code" },
  { name: "DevOps Engineer", icon: "CloudCog" },
  { name: "Cybersecurity Analyst", icon: "ShieldCheck" },
  { name: "UI/UX Designer", icon: "Palette" },
  { name: "Mobile App Developer", icon: "Smartphone" },
  { name: "Game Developer", icon: "Gamepad" },
  { name: "Database Administrator", icon: "BarChart" },
  { name: "System Administrator", icon: "Cpu" },
  { name: "AI Engineer", icon: "Bot" },
  { name: "Blockchain Developer", icon: "Code" },
  { name: "Cloud Architect", icon: "Cloud" },
  { name: "Network Engineer", icon: "Cpu" },
  { name: "Software Architect", icon: "Brain" },
  { name: "QA Engineer", icon: "ShieldCheck" },
  { name: "Product Manager", icon: "Briefcase" },
  { name: "Technical Lead", icon: "Award" },
]

const SUBJECTS_PER_LOAD = 8 // Number of subjects to load at a time

export default function Component() {
  const router = useRouter();
  const [visibleSubjectsCount, setVisibleSubjectsCount] = React.useState(SUBJECTS_PER_LOAD)
  const [visibleLibraryCount, setVisibleLibraryCount] = React.useState(SUBJECTS_PER_LOAD)

  const handleLoadMore = () => {
    setVisibleSubjectsCount((prevCount) => prevCount + SUBJECTS_PER_LOAD)
  }

  const handleLoadMoreLibrary = () => {
    setVisibleLibraryCount((prevCount) => prevCount + SUBJECTS_PER_LOAD)
  }

  const subjectsToDisplay = allSubjects.slice(0, visibleSubjectsCount)
  const libraryToDisplay = courseLibrarySubjects.slice(0, visibleLibraryCount)
  const hasMoreSubjects = visibleSubjectsCount < allSubjects.length
  const hasMoreLibrary = visibleLibraryCount < courseLibrarySubjects.length

  return (
    <div className="min-h-scree  py-8 p-4 rounded-[10px] text-white dark:text-white pt-6">
      <div className=" mx-auto">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {subjectsToDisplay.map((subject, index) => {
                const IconComponent = iconMap[subject.icon]
                return (
                  <div
                    key={index}
                    className="flex hover:pointer flex-row text-xs sm:text-md items-center text-black dark:text-white hover:text-[#ffd404] dark:hover:text-[#ffd404] justify-start h-auto p-4 border border-gray-800 dark:border-white rounded-[6px] text-left bg-white dark:bg-black hover:bg-[#282434] dark:hover:bg-[#282434] transition-colors gap-3 cursor-pointer"
                    onClick={() => {
                      router.push(`/course/course-details`)
                    }}
                 >
                    {IconComponent && <IconComponent className="w-6 h-6" />}
                    <span className="text-base font-medium">{subject.name}</span>
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
          </TabsContent>
          
          <TabsContent value="certification-prep">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {libraryToDisplay.map((subject, index) => {
                const IconComponent = iconMap[subject.icon]
                return (
                  <div
                    key={index}
                    className="flex flex-row items-center text-xs sm:text-md text-black dark:text-white hover:text-[#ffd404] dark:hover:text-[#ffd404] justify-start h-auto p-4 border border-gray-600 dark:border-white rounded-[6px] text-left bg-white dark:bg-black hover:bg-[#282434] dark:hover:bg-[#282434] transition-colors gap-3 cursor-pointer"
                  >
                    {IconComponent && <IconComponent className="w-6 h-6" />}
                    <span className="text-base font-medium">{subject.name}</span>
                  </div>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
