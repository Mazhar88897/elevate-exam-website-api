import { ArrowRight } from "lucide-react"
import Link from "next/link"

type Blog = {
  id: number
  title: string
  primary_description?: string
  author?: string
  date?: string
  category?: string
}

export const dynamic = "force-dynamic"

function formatDate(iso?: string) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function estimateReadMinutes(text?: string) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200) + 3)
}

export default async function LatestArticles() {
  let blogs: Blog[] = []

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      return (
        <div className="mx-auto max-w-[720px] px-6 py-20 text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Blog
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-black">
            Latest articles
          </h1>
          <p className="mt-4 text-sm text-neutral-500">
            Unable to load blogs. Please check your environment configuration.
          </p>
        </div>
      )
    }

    const res = await fetch(`${baseUrl}/blogs/`, {
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch blogs: ${res.status} ${res.statusText}`)
    }

    blogs = (await res.json()) as Blog[]
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return (
      <div className="mx-auto max-w-[720px] px-6 py-20 text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          Blog
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-black">
          Latest articles
        </h1>
        <p className="mt-4 text-sm text-neutral-500">
          Unable to load blogs at this time. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white text-black">
      <div className="mx-auto max-w-[720px] px-6 pb-20 pt-14 sm:pt-20">
        <header>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            From the blog
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Latest articles
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
            Study tips, exam technique, and how to get more from your practice.
          </p>
          <div className="mt-8 h-px w-full bg-[#F5C6C6]" aria-hidden />
        </header>

        {blogs.length === 0 ? (
          <p className="mt-12 text-sm text-neutral-500">
            No articles available at this time.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-neutral-200">
            {blogs.map((blog) => {
              const minutes = estimateReadMinutes(blog.primary_description)
              const category = blog.category?.trim() || "Insights"
              return (
                <li key={blog.id} className="py-8">
                  <Link href={`/main/blogs/${blog.id}`} className="group block">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                      {category}
                      <span className="mx-2 text-[#F5C6C6]">•</span>
                      {minutes} min read
                    </p>
                    <h2 className="mt-3 font-display text-2xl font-bold leading-snug tracking-tight text-black transition-colors group-hover:text-neutral-700">
                      {blog.title}
                    </h2>
                    {blog.primary_description ? (
                      <p className="mt-3 line-clamp-2 font-display text-base leading-relaxed text-neutral-500">
                        {blog.primary_description}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="font-mono text-[12px] text-neutral-400">
                        By {blog.author?.trim() || "ElevateExams"}
                        {blog.date ? (
                          <>
                            <span className="mx-2 text-[#F5C6C6]">•</span>
                            {formatDate(blog.date)}
                          </>
                        ) : null}
                      </p>
                      <span className="inline-flex items-center gap-1 font-display text-sm font-semibold text-black">
                        Read more
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
