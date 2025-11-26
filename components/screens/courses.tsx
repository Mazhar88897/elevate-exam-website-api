"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, ArrowDownRight, BookOpen, Code, FileText, Laptop, Database, ExternalLink } from "lucide-react"
import { HoverCard } from "@/components/pages/hoverCardstill"
import Link from "next/link"
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

export default function Courses() {
  // State to track which accordions are open
  const [openAccordions, setOpenAccordions] = useState<number[]>([0]) // First one open by default
  const [openAccordionsright, setOpenAccordionsright] = useState<number[]>([1]) // Second one open by default
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
        const mappedTopics: Topic[] = domains.map((domain) => ({
          id: domain.id,
          title: domain.name,
          description: `Explore ${domain.name} courses and enhance your skills in this domain.`,
          icon: getIcon(domain.name),
          links: domain.courses.map((course) => ({
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

  // Toggle accordion open/close
  const toggleAccordion = (index: number) => {
    setOpenAccordions((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const toggleAccordionright = (index: number) => {
    setOpenAccordionsright((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

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
    <div className="flex justify-center mx-auto py-12 pb-18 items-center px-8">
      <div className="max-w-6xl w-full flex flex-wrap gap-8">
        {/* Left Column - Topics Section */}
        <div className="flex-1 min-w-[300px] space-y-4">
          <div className="space-y-1">
            {/* Accordion Topics - Even indices (0, 2, 4...) */}
            {topics.map((topic, index) => (
              index % 2 === 0 && (
                <div key={index}>
                  <HoverCard isActive={index === 0 ? true : false}>
                    <div
                      className="flex items-center justify-between p-3 border border-gray-800 cursor-pointer"
                      onClick={() => toggleAccordion(index)}
                    >
                      <h3 className="text-sm font-semibold text-gray-800">{topic.title}</h3>
                      {openAccordions.includes(index) ? (
                        <ArrowDownRight className="h-5 w-5 text-blue-600 transition-transform duration-200 scale-x-[-1]" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-gray-600 transition-transform duration-200" />
                      )}
                    </div>
                  </HoverCard>
                  <div
                    className={`my-3 text-gray-500 overflow-hidden transition-all duration-300 ${
                      openAccordions.includes(index) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-xs py-3 pl-5">{topic.description}</p>

                    {/* Links List */}
                    <ul className="mt-2 pl-5 space-y-2">
                      {topic.links.map((link, linkIndex) => (
                        <li onClick={() => {sessionStorage.setItem('DomainIdForPayment', topic.id.toString())}} key={linkIndex}>
                            <Link
                              href={`/main/courses/${link.id}`}
                              className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors group"
                            >
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                              {topic.icon}
                            </span>
                            {link.text}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Right Column - Topics List */}
        <div className="flex-1 min-w-[300px] space-y-4">
          <div className="space-y-1">
            {/* Accordion Topics - Odd indices (1, 3, 5...) */}
            {topics.map((topic, index) => (
              index % 2 === 1 && (
                <div key={index}>
                  <HoverCard isActive={index === 1 ? true : false}>
                    <div
                      className="flex items-center justify-between p-3 border border-gray-800 cursor-pointer"
                      onClick={() => toggleAccordionright(index)}
                    >
                      <h3 className="text-sm font-semibold text-gray-800">{topic.title}</h3>
                      {openAccordionsright.includes(index) ? (
                        <ArrowDownRight className="h-5 w-5 text-blue-600 transition-transform duration-200 scale-x-[-1]" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-gray-600 transition-transform duration-200" />
                      )}
                    </div>
                  </HoverCard>
                  <div
                    className={`my-3 text-gray-500 overflow-hidden transition-all duration-300 ${
                      openAccordionsright.includes(index) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-xs py-3 pl-5">{topic.description}</p>

                    {/* Links List */}
                    <ul className="mt-2 pl-5 space-y-2">
                      {topic.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link
                            href={`/main/courses/${link.id}`}
                            className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors group"
                          >
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                              {topic.icon}
                            </span>
                            {link.text}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

