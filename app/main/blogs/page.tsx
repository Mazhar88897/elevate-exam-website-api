import { ArrowRight } from "lucide-react"
import { HoverCard } from "@/components/pages/HoverCard"
import Link from "next/link"
import { Highlight } from "@/components/pages/Highlight"

type Blog = {
  id: number
  title: string
  primary_description?: string
}

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

export default async function LatestArticles() {
  let blogs: Blog[] = []
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_BASE_URL is not set')
      return (
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-[#111827] inline-block relative">
              Latest <Highlight>Articles Grid</Highlight> 
            </h2>
          </div>
          <div className="text-center text-gray-600">
            <p>Unable to load blogs. Please check your environment configuration.</p>
          </div>
        </div>
      )
    }

    const res = await fetch(`${baseUrl}/blogs/`, { 
      cache: "no-store",
      next: { revalidate: 0 }
    })
    
    if (!res.ok) {
      throw new Error(`Failed to fetch blogs: ${res.status} ${res.statusText}`)
    }
    
    blogs = (await res.json()) as Blog[]
  } catch (error) {
    console.error('Error fetching blogs:', error)
    // Return empty state or error message
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-[#111827] inline-block relative">
            Latest <Highlight>Articles Grid</Highlight> 
          </h2>
        </div>
        <div className="text-center text-gray-600">
          <p>Unable to load blogs at this time. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold text-[#111827] inline-block relative">
          Latest <Highlight>Articles Grid</Highlight> 
        </h2>
      </div>
      {blogs.length === 0 ? (
        <div className="text-center text-gray-600 py-12">
          <p>No articles available at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-6">
          {blogs.map((blog) => (
            <HoverCard key={blog.id}> 
              <div className="flex p-4 flex-col">
                <h3 className="text-xl font-bold mb-2 text-slate-700 line-clamp-2">{blog.title}</h3>
                <p className="text-gray-600 mb-4 flex-grow line-clamp-2">{blog.primary_description}</p>
                <div className="mt-auto">
                  <Link 
                    href={`/main/blogs/${blog.id}`} 
                    className="mt-auto py-1 inline-flex items-center hover:border-blue-500 text-slate-700 text-sm font-medium border-b border-black"
                  >
                    Read More <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </HoverCard> 
          ))}
        </div>
      )}
    </div>
  )
}

