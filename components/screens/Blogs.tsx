import { ArrowRight } from "lucide-react"
import { HoverCard } from "@/components/pages/HoverCard"
import Link from "next/link"
import { Highlight } from "@/components/pages/Highlight"

type Blog = {
  id: number
  title: string
  primary_description?: string
}

export default async function LatestArticles() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/blogs/latest/`, { cache: "no-store" })
  const blogs = (await res.json()) as Blog[]

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold text-[#111827] inline-block relative">
          
          Latest <Highlight>Articles</Highlight> 
        
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.slice(0, 3).map((blog) => (
          <HoverCard key={blog.id} > 
          <div className="flex p-4 flex-col">
            
            <h3 className="text-xl font-bold mb-2 text-slate-700 line-clamp-2">{blog.title}</h3>
            <p className="text-gray-600 mb-4 flex-grow line-clamp-2">{blog.primary_description}</p>
         
            <div className="mt-auto ">
        <Link href={`/main/blogs/${blog.id}`} className="mt-auto py-1  inline-flex items-center hover:border-blue-500  text-slate-700 text-sm font-medium border-b border-black">
          Read More <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
            </div>
          </div>
          </HoverCard> 
        ))}
      </div>
      <div className="text-center pt-6">  <Link href="/main/blogs" className="mt-auto py-1  inline-flex items-center hover:border-blue-500  text-slate-700 text-sm font-medium border-b border-black">View All Blogs <ArrowRight className="ml-1 h-4 w-4" /></Link></div>
    
    </div>
  )
}

