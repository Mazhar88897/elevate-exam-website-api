"use client"

import LeaveReply from "@/components/screens/LeaveReply"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { ArrowLeft, Loader2, Share2 } from "lucide-react"

type Blog = {
  id: number
  title: string
  primary_description?: string
  secondary_description?: string
  author?: string
  date?: string
  quotation?: string
  primary_sub_description?: string
  secondary_sub_description?: string
  category?: string
}

function estimateReadMinutes(blog: Blog | null) {
  if (!blog) return 1
  const text = [
    blog.primary_description,
    blog.secondary_description,
    blog.primary_sub_description,
    blog.secondary_sub_description,
    blog.quotation,
  ]
    .filter(Boolean)
    .join(" ")
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

function formatDate(iso?: string) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function BlogPostPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id?.toString()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    let isMounted = true
    const fetchBlog = async () => {
      try {
        setIsLoading(true)
        setNotFound(false)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/blogs/${id}/`,
          { cache: "no-store" }
        )
        if (!res.ok) {
          if (isMounted) setNotFound(true)
          return
        }
        const data = (await res.json()) as Blog
        if (isMounted) setBlog(data)
      } catch {
        if (isMounted) setNotFound(true)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchBlog()
    return () => {
      isMounted = false
    }
  }, [id])

  const readMinutes = useMemo(() => estimateReadMinutes(blog), [blog])
  const category = blog?.category?.trim() || "Insights"

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    } catch {
      toast.error("Could not copy link")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (notFound || !blog) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-20 text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          Blog
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-black">
          Article not found
        </h1>
        <Link
          href="/main/blogs"
          className="mt-8 inline-flex items-center gap-2 font-display text-sm font-semibold text-black underline decoration-[#F5C6C6] underline-offset-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to articles
        </Link>
      </div>
    )
  }

  const paragraphs = [
    blog.primary_description,
    blog.secondary_description,
  ].filter((p): p is string => Boolean(p?.trim()))

  const bodySections = [
    blog.primary_sub_description,
    blog.secondary_sub_description,
  ].filter((p): p is string => Boolean(p?.trim()))

  return (
    <article className="bg-white text-black">
      <div className="mx-auto max-w-[720px] px-6 pb-20 pt-14 sm:pt-20">
        <Link
          href="/main/blogs"
          className="mb-10 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-3 w-3" />
          All articles
        </Link>

        <header>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            {category}
            <span className="mx-2 text-[#F5C6C6]">•</span>
            {readMinutes} min read
          </p>

          <h1 className="mt-4 font-display text-[2rem] font-bold leading-[1.15] tracking-[-0.02em] text-black sm:text-4xl sm:leading-[1.12] md:text-[2.75rem]">
            {blog.title}
          </h1>

          <p className="mt-5 font-mono text-[12px] text-neutral-400">
            By {blog.author?.trim() || "ElevateExams"}
            {blog.date ? (
              <>
                <span className="mx-2 text-[#F5C6C6]">•</span>
                {formatDate(blog.date)}
              </>
            ) : null}
          </p>

          <div className="mt-8 h-px w-full bg-[#F5C6C6]" aria-hidden />
        </header>

        <div className="mt-10 space-y-6 font-display text-[1.05rem] leading-[1.7] text-neutral-700">
          {paragraphs.map((text, i) => (
            <p key={`intro-${i}`}>{text}</p>
          ))}

          {blog.quotation?.trim() ? (
            <blockquote className="border-l-2 border-[#F5C6C6] pl-5 font-display text-lg font-medium italic leading-relaxed text-black">
              {blog.quotation.trim()}
            </blockquote>
          ) : null}

          {bodySections.length > 0 ? (
            <>
              <h2 className="pt-4 font-display text-2xl font-bold tracking-tight text-black">
                What to take away
              </h2>
              {bodySections.map((text, i) => (
                <p key={`body-${i}`}>{text}</p>
              ))}
            </>
          ) : null}
        </div>

        <footer className="mt-14 flex items-center justify-between border-t border-neutral-200 pt-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
            Share this article
          </p>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 border border-black bg-white px-4 py-2 font-display text-sm font-semibold text-black transition-colors hover:bg-neutral-50"
          >
            <Share2 className="h-3.5 w-3.5" />
            Copy link
          </button>
        </footer>

        <LeaveReply blogId={blog.id} />
      </div>
    </article>
  )
}
