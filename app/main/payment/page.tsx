"use client"    
import React, { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight, BookOpen, Code, Laptop, Database, ExternalLink } from "lucide-react"
// import { HoverCard } from "@/components/pages/hoverCardstill"
import Link from "next/link"
import { Highlight } from '@/components/pages/Highlight'
import { HoverCard } from '@/components/pages/hoverCardHard'        
export default function page()   {
  return (
      <div className="container mx-auto  py-16 max-w-7xl">
         <div className="mb-12 px-4 text-center">
           <h2 className="text-4xl font-bold text-[#111827] inline-block relative">
             
             Payment & <Highlight>Subscription</Highlight> 
             
           </h2>
           <p></p>
         </div>
         <div className="max-w-6xl w-full mx-auto">
          <Payment />
        </div>
      </div>
  )
}
interface Course {
  id: number
  name: string
}

interface Domain {
  id: number
  name: string
  courses: Course[]
}

interface Topic {
  id: number
  title: string
  description: string
  icon: JSX.Element
  links: Array<{ id: number;  text: string; url: string }>
}

function Payment() {
  // State to track which topic is selected
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(0) // First one selected by default
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  // Icons mapping for different domains
  const getIcon = (domainName: string) => {
    const name = domainName.toLowerCase()
    if (name.includes('data') || name.includes('science')) return <Database className="h-4 w-4" />
    if (name.includes('artificial') || name.includes('intelligence') || name.includes('ai')) return <Laptop className="h-4 w-4" />
    if (name.includes('programming') || name.includes('code')) return <Code className="h-4 w-4" />
    if (name.includes('computer') || name.includes('science')) return <Laptop className="h-4 w-4" />
    return <BookOpen className="h-4 w-4" />
  }

  // Fetch domains and courses from API
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/domains/courses/`, {
          method: 'GET',
          headers: {
                 'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch domains')
        }
        
        const domains: Domain[] = await response.json()
        
        // Map API data to topics structure
        const mappedTopics: Topic[] = domains.map((domain: Domain) => ({
          id: domain.id,
          title: domain.name,
          description: `Explore ${domain.name} courses and enhance your skills in this domain.`,
          icon: getIcon(domain.name),
          links: domain.courses.map((course: Course) => ({
            id: course.id,
            text: course.name,
            url: `#${course.name.toLowerCase().replace(/\s+/g, '-')}`,
          })),
        }))
        
        setTopics(mappedTopics)
      } catch (error) {
        console.error('Error fetching domains:', error)
        // Fallback to empty array or show error
        setTopics([])
      } finally {
        setLoading(false)
      }
    }

    fetchDomains()
  }, [])

  // Select topic - ensures only one is open at a time
  const selectTopic = (index: number) => {
    setSelectedTopicIndex(index)
  }

  // Get selected topic
  const selectedTopic = selectedTopicIndex !== null ? topics[selectedTopicIndex] : null

  if (loading) {
    return (
      <div className="flex justify-center mx-auto py-12 pb-18 items-center px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center mx-auto py-12 pb-18 items-start px-8 gap-6">
      <div className="flex-1 min-w-[300px]">
        {/* Left Column - Topics List */}
        <div className="space-y-1">
          {topics.map((topic: Topic, index: number) => (
            <div className="8" key={index}>
        <div className="mb-4">
              <HoverCard  isActive={selectedTopicIndex === index}>
                <div
                  className={`flex items-center justify-between p-3 border border-gray-800 cursor-pointer transition-colors ${
                    selectedTopicIndex === index ? "bg-blue-50" : "bg-white"
                  }`}
                  onClick={() => selectTopic(index)}
                >
                  <h3 className="text-sm font-semibold text-gray-800">{topic.title}</h3>
                  {selectedTopicIndex === index ? (
                    <ArrowDownRight className="h-5 w-5 text-blue-600 transition-transform duration-200 scale-x-[-1]" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-gray-600 transition-transform duration-200" />
                  )}
                </div>
              </HoverCard>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - Courses Box */}
      <div className="flex-1 min-w-[300px]">
        <div className="border-2 border-red-500 bg-white rounded-lg p-6 min-h-[400px]">
          {selectedTopic ? (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {selectedTopic.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedTopic.description}
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Available Courses:
                </h4>
                <ul className="space-y-2">
                  {selectedTopic.links.map((link: { id: number; text: string; url: string }, linkIndex: number) => (
                    <li key={linkIndex}>
                      <Link
                        href={`/main/courses/${link.id}`}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors group p-2 rounded hover:bg-blue-50"
                      >
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                          {selectedTopic.icon}
                        </span>
                        <span className="flex-1">{link.text}</span>
                        <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <p className="text-gray-500 text-center">
                Select a domain to view available courses
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

