"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  RefreshCw,
  Timer,
  X,
} from "lucide-react"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SubTopic {
  id: number
  name: string
}

interface Chapter {
  id: number
  name: string
  subtopics: SubTopic[]
}

interface CourseDetails {
  id: number
  name: string
  about_primary: string
  about_secondary: string
  total_questions: number
  total_chapters: number
  chapters: Chapter[]
}

interface DomainProgress {
  id: number
  name: string
  percent: number
  subtopics: Array<{
    id: number
    name: string
    percent: number
  }>
}

interface ResumeState {
  current: number
  total: number
  label: string
  startedLabel: string
}

function formatTimeAgo(iso?: string): string {
  if (!iso) return "Recently"
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return "Recently"
  const hours = Math.max(0, Math.floor((Date.now() - then) / 3600000))
  if (hours < 1) return "Started less than an hour ago"
  if (hours === 1) return "Started 1 hour ago"
  if (hours < 48) return `Started ${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `Started ${days} day${days === 1 ? "" : "s"} ago`
}

export default function SingleCoursePage() {
  const router = useRouter()
  const [courseId, setCourseId] = useState<string>("")
  const [courseName, setCourseName] = useState("")
  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [domains, setDomains] = useState<DomainProgress[]>([])
  const [resume, setResume] = useState<ResumeState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [discarding, setDiscarding] = useState(false)
  const [mockModalOpen, setMockModalOpen] = useState(false)
  const [flashModalOpen, setFlashModalOpen] = useState(false)
  const [practiceModalOpen, setPracticeModalOpen] = useState(false)
  const [selectedFlashDomains, setSelectedFlashDomains] = useState<number[]>([])
  // const [practiceTimerOn, setPracticeTimerOn] = useState(false)

  useEffect(() => {
    const id = sessionStorage.getItem("course_id") || ""
    const name = sessionStorage.getItem("course_name") || ""
    setCourseId(id)
    setCourseName(name)
  }, [])

  const quizHref = `/dashboard/single-course/practice/${courseId || ""}`

  const load = useCallback(async () => {
    if (!courseId) {
      setLoading(false)
      setError("No course selected")
      return
    }

    const token = sessionStorage.getItem("Authorization")
    if (!token) {
      setError("Please sign in")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const detailsRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/course_details/${courseId}/`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      )
      if (!detailsRes.ok) throw new Error("Failed to load course")
      const details: CourseDetails = await detailsRes.json()
      setCourse(details)
      sessionStorage.setItem("course_name", details.name)
      setCourseName(details.name)

      // Domain + subtopic progress from quiz_progress (best-effort)
      let domainRows: DomainProgress[] = details.chapters.map((ch) => ({
        id: ch.id,
        name: ch.name,
        percent: 0,
        subtopics: (ch.subtopics ?? []).map((st) => ({
          id: st.id,
          name: st.name,
          percent: 0,
        })),
      }))

      try {
        const progressRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/quiz_progress/${courseId}/progress/`,
          { headers: { Authorization: token } }
        )
        if (progressRes.ok) {
          const progressData = await progressRes.json()
          const chapters: Array<{
            chapter: number
            subtopics?: Array<{
              subtopic?: number
              attempted_questions?: number
              total_questions?: number
              questions?: unknown[]
            }>
          }> = progressData?.chapters || []

          domainRows = details.chapters.map((ch) => {
            const match = chapters.find((c) => c.chapter === ch.id)
            const subtopicRows = (ch.subtopics ?? []).map((st) => {
              const stMatch = match?.subtopics?.find(
                (ps) => ps.subtopic === st.id
              )
              const attempted = stMatch?.attempted_questions ?? 0
              const total =
                stMatch?.total_questions ??
                (Array.isArray(stMatch?.questions)
                  ? stMatch!.questions!.length
                  : 0)
              const percent =
                total > 0 ? Math.round((attempted / total) * 100) : 0
              return { id: st.id, name: st.name, percent }
            })

            let attempted = 0
            let total = 0
            if (match?.subtopics?.length) {
              for (const st of match.subtopics) {
                attempted += st.attempted_questions ?? 0
                total +=
                  st.total_questions ??
                  (Array.isArray(st.questions) ? st.questions.length : 0)
              }
            }
            const percent =
              total > 0 ? Math.round((attempted / total) * 100) : 0

            return {
              id: ch.id,
              name: ch.name,
              percent,
              subtopics: subtopicRows,
            }
          })
        }
      } catch {
        // keep zeros
      }

      setDomains(domainRows)
      setSelectedFlashDomains(domainRows.map((d) => d.id))

      // Resume banner from mock exam progress (best-effort)
      try {
        const testRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/test_progress/${courseId}/progress/?source=content`,
          { headers: { Authorization: token } }
        )
        if (testRes.ok) {
          const testData = await testRes.json()
          const questions: Array<{
            selected_option: number | null
          }> = testData?.questions || []
          if (questions.length > 0) {
            const answered = questions.filter(
              (q) => q.selected_option !== null && q.selected_option !== undefined
            ).length
            const current = Math.min(answered + 1, questions.length)
            const hasProgress = answered > 0 && answered < questions.length
            if (hasProgress) {
              setResume({
                current,
                total: questions.length,
                label: "Mock Exam",
                startedLabel: formatTimeAgo(
                  testData?.updated_at || testData?.started_at
                ),
              })
            } else {
              setResume(null)
            }
          } else {
            setResume(null)
          }
        }
      } catch {
        setResume(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load course")
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    load()
  }, [load])

  const handleDiscard = async () => {
    if (!courseId) return
    setDiscarding(true)
    try {
      const token = sessionStorage.getItem("Authorization")
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/test_progress/${courseId}/quit/`,
        {
          method: "POST",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      setResume(null)
      toast.success("Progress discarded")
    } catch {
      toast.error("Could not discard progress")
    } finally {
      setDiscarding(false)
    }
  }

  const examStats = useMemo(() => {
    const topics = domains.length || course?.chapters?.length || 0
    const subtopics =
      domains.reduce((sum, d) => sum + d.subtopics.length, 0) ||
      course?.chapters?.reduce((sum, ch) => sum + (ch.subtopics?.length || 0), 0) ||
      0
    const questions = course?.total_questions ?? 0
    return { topics, subtopics, questions }
  }, [course, domains])

  const activities = useMemo(
    () => [
      {
        id: "practice" as const,
        title: "Practice Quiz",
        description:
          "Work through questions by domain with instant feedback and explanations after every answer.",
        footer: "View results →",
        icon: CheckCircle2,
        href: quizHref,
        resultHref: `/dashboard/single-course/practice/result/${courseId || ""}`,
      },
      {
        id: "flashcards" as const,
        title: "Flashcards",
        description:
          "Quick recall practice. Flip cards, mark what you know, and revisit weak areas.",
        footer: "Unscored · Self-paced",
        icon: RefreshCw,
        href: `/dashboard/single-course/flashcards/${courseId || ""}`,
      },
      {
        id: "mock" as const,
        title: "Mock Exam",
        description:
          "Full-length exam conditions. One sitting, no hints — just like the real thing.",
        footer: "View results →",
        icon: Timer,
        href: `/dashboard/single-course/mock/${courseId || ""}`,
        resultHref: `/dashboard/single-course/mock/result/${courseId || ""}`,
      },
    ],
    [quizHref, courseId]
  )

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
        <div className="h-8 w-48 animate-pulse bg-neutral-100" />
        <div className="mt-8 h-28 animate-pulse bg-neutral-100" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse border border-neutral-200 bg-neutral-50" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
        <p className="text-sm text-red-600">{error || "Course not found"}</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-black underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-6 lg:px-10">
        <div className="mb-8 flex items-center justify-end">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 border border-black bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-neutral-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>

        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Course
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-black sm:text-3xl">
            {courseName || course.name}
          </h1>
          {course.about_primary && (
            <p className="mt-2 max-w-2xl text-sm text-neutral-500">
              {course.about_primary}
            </p>
          )}
        </div>

        {/* Resume banner */}
        {resume && (
          <div className="mb-8 flex flex-col gap-4 bg-black px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Resume where you left off
              </p>
              <p className="mt-1.5 font-display text-lg font-bold text-white sm:text-xl">
                {resume.label} — Question {resume.current} of {resume.total}
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                {resume.startedLabel}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <button
                type="button"
                onClick={handleDiscard}
                disabled={discarding}
                className="text-sm text-neutral-400 transition-colors hover:text-white disabled:opacity-50"
              >
                {discarding ? "Discarding…" : "Discard"}
              </button>
              <Link
                href={`/dashboard/single-course/mock/${courseId || ""}`}
                className="inline-flex items-center gap-1.5 bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-neutral-100"
              >
                Resume
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Activity cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {activities.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === "mock") {
                    setMockModalOpen(true)
                    return
                  }
                  if (item.id === "flashcards") {
                    setSelectedFlashDomains(domains.map((d) => d.id))
                    setFlashModalOpen(true)
                    return
                  }
                  if (item.id === "practice") {
                    // setPracticeTimerOn(false)
                    setPracticeModalOpen(true)
                  }
                }}
                className="flex h-full flex-col border border-black bg-white p-5 text-left transition-colors hover:bg-neutral-50"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300">
                  <Icon className="h-5 w-5 text-neutral-700" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-base font-bold text-black">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-500">
                  {item.description}
                </p>
                {"resultHref" in item && item.resultHref ? (
                  <Link
                    href={item.resultHref}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 text-xs text-neutral-400 underline underline-offset-2 transition-colors hover:text-black"
                  >
                    {item.footer}
                  </Link>
                ) : (
                  <p className="mt-4 text-xs text-neutral-400">{item.footer}</p>
                )}
              </button>
            )
          })}
        </div>

        {/* Domains + subtopics */}
        <div className="mt-12">
          <h2 className="font-display text-lg font-bold tracking-tight text-black">
            Domains in this course
          </h2>

          {domains.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-400">
              No domains listed for this course yet.
            </p>
          ) : (
            <div className="mt-4 space-y-6">
              {domains.map((domain) => (
                <div key={domain.id}>
                  <div className="flex items-center justify-between gap-6 border-b border-neutral-200 py-3">
                    <p className="min-w-0 flex-1 text-sm font-bold text-black">
                      {domain.name}
                    </p>
                    <div className="flex w-40 shrink-0 items-center gap-3 sm:w-52">
                      <div className="h-1.5 flex-1 overflow-hidden bg-neutral-100">
                        <div
                          className="h-full bg-[#F5C6C6]"
                          style={{
                            width: `${Math.min(100, Math.max(0, domain.percent))}%`,
                          }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs tabular-nums text-neutral-500">
                        {domain.percent}%
                      </span>
                    </div>
                  </div>

                  {domain.subtopics.length > 0 ? (
                    <ul className="divide-y divide-neutral-100 border-b border-neutral-200">
                      {domain.subtopics.map((st) => (
                        <li
                          key={st.id}
                          className="flex items-center justify-between gap-6 py-3 pl-4"
                        >
                          <p className="min-w-0 flex-1 text-sm font-medium text-neutral-700">
                            {st.name}
                          </p>
                          <div className="flex w-40 shrink-0 items-center gap-3 sm:w-52">
                            <div className="h-1.5 flex-1 overflow-hidden bg-neutral-100">
                              <div
                                className="h-full bg-[#F5C6C6]"
                                style={{
                                  width: `${Math.min(100, Math.max(0, st.percent))}%`,
                                }}
                              />
                            </div>
                            <span className="w-10 text-right text-xs tabular-nums text-neutral-500">
                              {st.percent}%
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="border-b border-neutral-200 py-3 pl-4 text-xs text-neutral-400">
                      No subtopics in this domain
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={mockModalOpen} onOpenChange={setMockModalOpen}>
        <DialogContent className="max-w-lg gap-0 overflow-hidden border-2 border-black bg-white p-0 shadow-none sm:rounded-none [&>button]:hidden">
          <DialogHeader className="flex flex-row items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5 text-left">
            <DialogTitle className="font-display text-xl font-bold tracking-tight text-black">
              Mock exam — exam conditions
            </DialogTitle>
            <button
              type="button"
              onClick={() => setMockModalOpen(false)}
              className="shrink-0 rounded-full border border-neutral-300 p-1 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-black"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="px-6 py-5">
            <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Exam format
            </p>
            <ul className="divide-y divide-neutral-200 border border-neutral-200">
              {[
                { label: "Questions", value: String(examStats.questions) },
                { label: "Topics", value: String(examStats.topics) },
                { label: "Sub-topics", value: String(examStats.subtopics) },
                { label: "Domains covered", value: "All" },
                { label: "Feedback", value: "At the end only" },
              ].map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-4 px-4 py-3.5"
                >
                  <span className="text-sm text-neutral-500">{row.label}</span>
                  <span className="font-display text-sm font-bold tabular-nums text-black">
                    {row.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4">
            <button
              type="button"
              onClick={() => setMockModalOpen(false)}
              className="border border-black bg-white px-5 py-2.5 font-display text-sm font-semibold text-black transition-colors hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setMockModalOpen(false)
                const id =
                  courseId || sessionStorage.getItem("course_id") || ""
                router.push(`/dashboard/single-course/mock/${id}`)
              }}
              className="inline-flex items-center gap-1.5 border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              Begin mock exam
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={flashModalOpen} onOpenChange={setFlashModalOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg gap-0 overflow-hidden border-2 border-black bg-white p-0 shadow-none sm:rounded-none [&>button]:hidden">
          <DialogHeader className="flex flex-row items-start justify-between gap-4 px-6 pb-2 pt-6 text-left sm:text-left">
            <DialogTitle className="font-display text-xl font-bold tracking-tight text-black">
              Set up flashcards
            </DialogTitle>
            <button
              type="button"
              onClick={() => setFlashModalOpen(false)}
              className="shrink-0 rounded-full border border-neutral-300 p-1 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-black"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="max-h-[min(55vh,28rem)] overflow-y-auto px-6 py-4">
            <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Domains to include
            </p>

            {domains.length === 0 ? (
              <p className="text-sm text-neutral-400">
                No domains available for this course yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {domains.map((domain) => {
                  const checked = selectedFlashDomains.includes(domain.id)
                  return (
                    <li key={domain.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFlashDomains((prev) =>
                            checked
                              ? prev.filter((id) => id !== domain.id)
                              : [...prev, domain.id]
                          )
                        }}
                        className="flex w-full items-center gap-3 border border-black bg-white px-4 py-3 text-left transition-colors hover:bg-neutral-50"
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center border border-black ${
                            checked ? "bg-black text-white" : "bg-white"
                          }`}
                          aria-hidden
                        >
                          {checked ? (
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          ) : null}
                        </span>
                        <span className="text-sm font-medium text-black">
                          {domain.name}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-5">
            <button
              type="button"
              onClick={() => setFlashModalOpen(false)}
              className="border border-black bg-white px-5 py-2.5 font-display text-sm font-semibold text-black transition-colors hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedFlashDomains.length === 0}
              onClick={() => {
                sessionStorage.setItem(
                  "flashcard_domain_ids",
                  JSON.stringify(selectedFlashDomains)
                )
                setFlashModalOpen(false)
                const id =
                  courseId || sessionStorage.getItem("course_id") || ""
                router.push(`/dashboard/single-course/flashcards/${id}`)
              }}
              className="inline-flex items-center gap-1.5 border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start flashcards
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={practiceModalOpen} onOpenChange={setPracticeModalOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg gap-0 overflow-hidden border-2 border-black bg-white p-0 shadow-none sm:rounded-none [&>button]:hidden">
          <DialogHeader className="flex flex-row items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5 text-left">
            <DialogTitle className="font-display text-xl font-bold tracking-tight text-black">
              Set up your practice quiz
            </DialogTitle>
            <button
              type="button"
              onClick={() => setPracticeModalOpen(false)}
              className="shrink-0 rounded-full border border-neutral-300 p-1 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-black"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="max-h-[min(50vh,26rem)] overflow-y-auto px-6 py-5">
            <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Domains to include
            </p>

            {domains.length === 0 ? (
              <p className="text-sm text-neutral-400">
                No domains available for this course yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {domains.map((domain) => (
                  <li key={domain.id}>
                    <div className="flex w-full items-center gap-3 border border-black bg-white px-4 py-3 text-left">
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center border border-black bg-black text-white"
                        aria-hidden
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <span className="text-sm font-medium text-black">
                        {domain.name}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Timer — disabled for now
            <p className="mb-3 mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Timer
            </p>
            <button
              type="button"
              onClick={() => setPracticeTimerOn((v) => !v)}
              className="flex w-full items-center justify-between gap-4 border border-black bg-white px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-black">
                {practiceTimerOn
                  ? "On — timed practice"
                  : "Off — work at your own pace"}
              </span>
              <span
                className={`relative h-6 w-11 shrink-0 border border-black transition-colors ${
                  practiceTimerOn ? "bg-black" : "bg-neutral-200"
                }`}
                aria-hidden
              >
                <span
                  className={`absolute top-0.5 h-4.5 w-4.5 border border-black bg-white transition-all ${
                    practiceTimerOn ? "left-[22px]" : "left-0.5"
                  }`}
                  style={{ height: 18, width: 18 }}
                />
              </span>
            </button>
            */}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4">
            <button
              type="button"
              onClick={() => setPracticeModalOpen(false)}
              className="border border-black bg-white px-5 py-2.5 font-display text-sm font-semibold text-black transition-colors hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={domains.length === 0}
              onClick={() => {
                const allDomainIds = domains.map((d) => d.id)
                sessionStorage.setItem(
                  "practice_domain_ids",
                  JSON.stringify(allDomainIds)
                )
                // sessionStorage.setItem(
                //   "practice_timer_on",
                //   practiceTimerOn ? "1" : "0"
                // )
                setPracticeModalOpen(false)
                const id =
                  courseId || sessionStorage.getItem("course_id") || ""
                router.push(`/dashboard/single-course/practice/${id}`)
              }}
              className="inline-flex items-center gap-1.5 border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start practice
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
