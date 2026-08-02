"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, X } from "lucide-react"

interface FlashcardAPI {
  id: number
  primary_text: string
  secondary_text: string
}

interface SubTopicAPI {
  id: number
  name: string
  flashcards: FlashcardAPI[]
}

interface ChapterAPI {
  id: number
  name: string
  subtopics: SubTopicAPI[]
}

interface CourseAPI {
  id: number
  name: string
  total_flashcards: number
  chapters: ChapterAPI[]
}

type FlatCard = {
  id: number
  question: string
  answer: string
  chapterId: number
  chapterName: string
}

type TopicRow = {
  id: number
  name: string
  cardIndexes: number[]
}

export default function DashboardFlashcardsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = String(params?.id ?? "")

  const [course, setCourse] = useState<CourseAPI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDomainIds, setSelectedDomainIds] = useState<number[] | null>(
    null
  )
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState<Set<number>>(() => new Set())

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("flashcard_domain_ids")
      if (raw) {
        const ids = JSON.parse(raw)
        if (Array.isArray(ids) && ids.length > 0) setSelectedDomainIds(ids)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (!courseId) {
      setLoading(false)
      setError("No course selected")
      return
    }

    const token = sessionStorage.getItem("Authorization")
    if (!token) {
      setLoading(false)
      setError("Please sign in")
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}/flashcard_page/`,
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        )
        if (!res.ok) throw new Error("Failed to load flashcards")
        const data: CourseAPI = await res.json()
        if (!cancelled) {
          setCourse(data)
          sessionStorage.setItem("course_id", String(data.id))
          sessionStorage.setItem("course_name", data.name)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load flashcards")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [courseId])

  const { cards, topics } = useMemo(() => {
    if (!course) return { cards: [] as FlatCard[], topics: [] as TopicRow[] }

    const chapters = course.chapters.filter(
      (ch) => !selectedDomainIds || selectedDomainIds.includes(ch.id)
    )

    const flat: FlatCard[] = []
    const topicRows: TopicRow[] = []

    for (const chapter of chapters) {
      const start = flat.length
      for (const sub of chapter.subtopics) {
        for (const fc of sub.flashcards || []) {
          flat.push({
            id: fc.id,
            question: fc.primary_text,
            answer: fc.secondary_text,
            chapterId: chapter.id,
            chapterName: chapter.name,
          })
        }
      }
      const end = flat.length
      if (end > start) {
        topicRows.push({
          id: chapter.id,
          name: chapter.name,
          cardIndexes: Array.from({ length: end - start }, (_, i) => start + i),
        })
      }
    }

    return { cards: flat, topics: topicRows }
  }, [course, selectedDomainIds])

  const current = cards[cardIndex]
  const total = cards.length
  const activeTopicId = current?.chapterId

  const topicProgress = useCallback(
    (topic: TopicRow) => {
      if (topic.cardIndexes.length === 0) return 0
      let done = 0
      for (const i of topic.cardIndexes) {
        if (reviewed.has(cards[i]?.id)) done += 1
      }
      return Math.round((done / topic.cardIndexes.length) * 100)
    },
    [cards, reviewed]
  )

  const goTo = (next: number) => {
    if (total === 0) return
    setFlipped(false)
    setCardIndex(((next % total) + total) % total)
  }

  const markReviewedAndNext = () => {
    if (current) {
      setReviewed((prev) => {
        const next = new Set(prev)
        next.add(current.id)
        return next
      })
    }
    if (cardIndex < total - 1) goTo(cardIndex + 1)
    else goTo(0)
  }

  const finish = () => {
    router.push("/dashboard/single-course")
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <p className="font-display text-sm text-neutral-500">
          Loading flashcards…
        </p>
      </div>
    )
  }

  if (error || !course || total === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white px-6">
        <p className="font-display text-sm text-neutral-500">
          {error || "No flashcards available for the selected domains."}
        </p>
        <button
          type="button"
          onClick={finish}
          className="border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white"
        >
          Back to course
        </button>
      </div>
    )
  }

  const courseName =
    course.name || sessionStorage.getItem("course_name") || "Course"

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-black">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-black px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={finish}
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-black transition-colors hover:bg-neutral-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="truncate font-display text-sm font-semibold sm:text-base">
            {courseName}
            <span className="font-normal text-neutral-400"> · Flashcards</span>
          </p>
        </div>

        <p className="hidden font-mono text-xs text-neutral-500 sm:block">
          Card {cardIndex + 1} of {total}
        </p>

        <button
          type="button"
          onClick={finish}
          className="shrink-0 font-display text-sm font-medium text-black transition-opacity hover:opacity-70"
        >
          Finish session →
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Topics sidebar */}
        <aside className="hidden w-72 shrink-0 flex-col border-r border-black md:flex lg:w-80">
          <div className="flex-1 overflow-y-auto px-4 py-5">
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Topics
            </p>
            <ul className="space-y-0">
              {topics.map((topic) => {
                const active = topic.id === activeTopicId
                const pct = topicProgress(topic)
                return (
                  <li key={topic.id}>
                    <button
                      type="button"
                      onClick={() => {
                        const first = topic.cardIndexes[0]
                        if (typeof first === "number") goTo(first)
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? "bg-black font-semibold text-white"
                          : "text-black hover:bg-neutral-50"
                      }`}
                    >
                      <span className="min-w-0 truncate">{topic.name}</span>
                      <span
                        className={`shrink-0 font-mono text-xs tabular-nums ${
                          active ? "text-neutral-300" : "text-neutral-400"
                        }`}
                      >
                        {pct}%
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex items-center justify-between border-t border-black px-4 py-3 font-mono text-xs text-neutral-500">
            <span>Reviewed</span>
            <span className="tabular-nums">
              {reviewed.size} / {total}
            </span>
          </div>
        </aside>

        {/* Main card area */}
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8">
          <p className="mb-6 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            {current.chapterName}
          </p>

          <div
            className="w-full max-w-xl cursor-pointer sm:min-h-[22rem]"
            style={{ perspective: "1200px" }}
            onClick={() => setFlipped((f) => !f)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setFlipped((f) => !f)
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={flipped ? "Show question" : "Reveal answer"}
          >
            <div
              className="relative h-full min-h-[18rem] w-full transition-transform duration-700 ease-out sm:min-h-[22rem]"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front — question (white) */}
              <div
                className="absolute inset-0 flex flex-col border-2 border-black bg-white px-8 py-10 text-left sm:px-12 sm:py-14"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Question
                </p>
                <p className="mt-8 flex-1 font-display text-xl font-bold leading-snug text-black sm:text-2xl">
                  {current.question}
                </p>
                <p className="mt-10 font-mono text-xs text-neutral-400">
                  Tap to reveal answer
                </p>
              </div>

              {/* Back — answer (black) */}
              <div
                className="absolute inset-0 flex flex-col border-2 border-black bg-black px-8 py-10 text-left sm:px-12 sm:py-14"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Answer
                </p>
                <p className="mt-8 flex-1 font-display text-xl font-bold leading-snug text-white sm:text-2xl">
                  {current.answer}
                </p>
                <p className="mt-10 font-mono text-xs text-neutral-500">
                  Tap to show question
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 font-mono text-xs text-neutral-400 md:hidden">
            Card {cardIndex + 1} of {total} · Reviewed {reviewed.size}/{total}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => goTo(cardIndex - 1)}
              className="inline-flex items-center gap-2 border border-black bg-white px-5 py-2.5 font-display text-sm font-semibold text-black transition-colors hover:bg-neutral-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <button
              type="button"
              onClick={markReviewedAndNext}
              className="inline-flex items-center gap-2 border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              Next card
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
