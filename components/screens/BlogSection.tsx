"use client"

import Link from "next/link"
import { ArrowRight, BarChart3, BookOpen, Timer } from "lucide-react"

const posts = [
  {
    category: "Study strategy",
    readTime: "6 min read",
    title: "How to actually use your domain breakdown (most people ignore it)",
    summary:
      "A score percentage tells you almost nothing. The domain breakdown is where the real signal is — here's how to read it properly.",
    author: "Sarah Chen",
    date: "3 June 2026",
    icon: BarChart3,
    iconClass: "text-[#5B8DEF]",
  },
  {
    category: "Exam technique",
    readTime: "5 min read",
    title: "Why your first mock exam score doesn't matter (and your third one does)",
    summary:
      "Sitting a timed mock exam for the first time is a pacing exercise, not a knowledge test. Here's what changes by your third attempt.",
    author: "Marcus Webb",
    date: "22 May 2026",
    icon: Timer,
    iconClass: "text-neutral-400",
  },
  {
    category: "Study strategy",
    readTime: "4 min read",
    title: "Flashcards and quizzes aren't interchangeable — use them for different jobs",
    summary:
      "They feel similar but they train different things. Mixing them up in your study plan is a common reason revision feels less effective than it should.",
    author: "Sarah Chen",
    date: "9 May 2026",
    icon: BookOpen,
    iconClass: "text-neutral-400",
  },
]

export default function BlogSection() {
  return (
    <section className="w-full bg-white px-6 py-14 lg:px-10 lg:py-16 xl:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-[#C97878]" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97878]">
              From the blog
            </p>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Study tips and exam insight.
          </h2>
        </div>

        <div className="mx-auto grid max-w-4xl gap-3 md:grid-cols-3">
          {posts.map((post) => {
            const Icon = post.icon
            return (
              <article
                key={post.title}
                className="flex max-w-[260px] flex-col overflow-hidden border border-black bg-white md:max-w-none"
              >
                <div className="flex h-20 items-center justify-center bg-black">
                  <Icon
                    className={`h-5 w-5 ${post.iconClass}`}
                    strokeWidth={1.75}
                  />
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                    {post.category} · {post.readTime}
                  </p>
                  <h3 className="mt-1.5 font-display text-[12px] font-bold leading-snug tracking-tight text-black">
                    {post.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-[11px] leading-relaxed text-neutral-500">
                    {post.summary}
                  </p>
                  <p className="mt-2.5 text-[10px] text-neutral-400">
                    {post.author} · {post.date}
                  </p>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/main/blogs"
            className="inline-flex items-center gap-2 border border-black bg-white px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-neutral-50"
          >
            View all articles
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  )
}
