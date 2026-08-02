"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowRight, Check, ChevronDown, Loader2, X } from "lucide-react"

interface ApiQuestion {
  id: number
  text: string
  option0: string
  option1: string
  option2: string
  option3: string
  correct_option: number
  explanation: string
}

interface QuestionsApiResponse {
  total_questions: number
  questions: ApiQuestion[]
}

interface ProgressQuestion {
  id: number
  question: number
  selected_option: number | null
  is_flagged: boolean
}

interface ProgressData {
  id: number
  course: number
  attempted_questions: number
  flagged_count: number
  skipped_count: number
  correct_count: number
  is_submitted: boolean
  questions: ProgressQuestion[]
}

interface ProgressWrapper {
  id: number
  course: number
  data: ProgressData
  updated_at?: string
  detail?: string
}

interface ChapterMeta {
  id: number
  name: string
}

interface DomainStat {
  id: number
  name: string
  correct: number
  total: number
  percent: number
}

type ReviewStatus = "correct" | "incorrect" | "skipped"

interface QuestionReview {
  id: number
  index: number
  text: string
  options: string[]
  correctOption: number
  selectedOption: number | null
  status: ReviewStatus
  explanation: string
  isFlagged: boolean
}

const OPTION_LETTERS = ["A", "B", "C", "D"] as const

export default function MockExamResultPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = String(params?.id ?? "")

  const [courseName, setCourseName] = useState("")
  const [chapters, setChapters] = useState<ChapterMeta[]>([])
  const [questions, setQuestions] = useState<ApiQuestion[]>([])
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noAnalytics, setNoAnalytics] = useState(false)
  const [openReviewIds, setOpenReviewIds] = useState<Record<number, boolean>>(
    {}
  )
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!courseId || hasFetched.current) return
    hasFetched.current = true

    const load = async () => {
      setLoading(true)
      setError(null)
      const token = sessionStorage.getItem("Authorization")
      if (!token) {
        setError("Please sign in")
        setLoading(false)
        return
      }

      sessionStorage.setItem("course_id", courseId)

      try {
        const [qRes, aRes, dRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}/full_test_page/`,
            { headers: { Authorization: token } }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/test_progress/${courseId}/latest-submitted-analytics/`,
            { headers: { Authorization: token } }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/course_details/${courseId}/`,
            { headers: { Authorization: token } }
          ),
        ])

        if (!qRes.ok) throw new Error("Failed to load questions")

        if (!aRes.ok) {
          if (aRes.status === 404) {
            setNoAnalytics(true)
            setLoading(false)
            return
          }
          throw new Error("Failed to load results")
        }

        const qData: QuestionsApiResponse = await qRes.json()
        const wrapper: ProgressWrapper = await aRes.json()

        if (
          wrapper &&
          typeof wrapper === "object" &&
          "detail" in wrapper &&
          String(wrapper.detail || "").toLowerCase().includes("no analytics")
        ) {
          setNoAnalytics(true)
          setLoading(false)
          return
        }

        const progressData = wrapper.data
        if (!progressData) {
          setNoAnalytics(true)
          setLoading(false)
          return
        }

        setQuestions(qData.questions || [])
        setProgress(progressData)

        if (dRes.ok) {
          const details = await dRes.json()
          setCourseName(details.name || sessionStorage.getItem("course_name") || "")
          sessionStorage.setItem("course_name", details.name || "")
          setChapters(
            (details.chapters || []).map((c: { id: number; name: string }) => ({
              id: c.id,
              name: c.name,
            }))
          )
        } else {
          setCourseName(sessionStorage.getItem("course_name") || "Course")
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load results")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId])

  const scored = useMemo(() => {
    if (!progress || questions.length === 0) {
      return {
        total: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        percent: 0,
        wrongIds: [] as number[],
        domains: [] as DomainStat[],
        reviews: [] as QuestionReview[],
      }
    }

    const byId = new Map(
      progress.questions.map((pq) => [pq.question, pq] as const)
    )

    let correct = 0
    let incorrect = 0
    let skipped = 0
    const wrongIds: number[] = []

    const reviews: QuestionReview[] = questions.map((q, index) => {
      const pq = byId.get(q.id)
      const selected =
        pq?.selected_option !== undefined ? pq.selected_option : null
      let status: ReviewStatus = "skipped"
      if (selected === null || selected === undefined) {
        skipped += 1
        status = "skipped"
      } else if (selected === q.correct_option) {
        correct += 1
        status = "correct"
      } else {
        incorrect += 1
        wrongIds.push(q.id)
        status = "incorrect"
      }
      return {
        id: q.id,
        index: index + 1,
        text: q.text,
        options: [q.option0, q.option1, q.option2, q.option3],
        correctOption: q.correct_option,
        selectedOption: selected,
        status,
        explanation: q.explanation || "",
        isFlagged: pq?.is_flagged || false,
      }
    })

    const total = questions.length
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0

    const domainSource =
      chapters.length > 0
        ? chapters
        : [{ id: 0, name: "All questions" }]

    const n = domainSource.length
    const domains: DomainStat[] = domainSource.map((ch, i) => {
      const start =
        chapters.length > 0 ? Math.floor((i * total) / n) : 0
      const end =
        chapters.length > 0 ? Math.floor(((i + 1) * total) / n) : total
      const slice = reviews.slice(start, end)
      const c = slice.filter((r) => r.status === "correct").length
      const t = slice.length
      return {
        id: ch.id,
        name: ch.name,
        correct: c,
        total: t,
        percent: t > 0 ? Math.round((c / t) * 100) : 0,
      }
    })

    return {
      total,
      correct: progress.correct_count ?? correct,
      incorrect:
        (progress.correct_count != null
          ? total - progress.correct_count - (progress.skipped_count || 0)
          : incorrect) || incorrect,
      skipped: progress.skipped_count ?? skipped,
      percent:
        progress.correct_count != null && total > 0
          ? Math.round((progress.correct_count / total) * 100)
          : percent,
      wrongIds,
      domains,
      reviews,
    }
  }, [progress, questions, chapters])

  const encouragement = useMemo(() => {
    if (scored.percent >= 80) {
      return "Excellent work — you're exam-ready. Keep sharpening weak spots."
    }
    if (scored.percent >= 50) {
      return "Solid progress — review weaker domains and try again."
    }
    return "Keep studying — review the highlighted domains carefully."
  }, [scored.percent])

  const backToCourse = () => router.push("/dashboard/single-course")

  const redoEntire = () => {
    sessionStorage.removeItem("mock_redo_question_ids")
    sessionStorage.removeItem("mock_wrong_redo_result")
    router.push(`/dashboard/single-course/mock/${courseId}`)
  }

  const redoWrong = () => {
    if (scored.wrongIds.length === 0) {
      backToCourse()
      return
    }
    sessionStorage.setItem(
      "mock_redo_question_ids",
      JSON.stringify(scored.wrongIds)
    )
    router.push(`/dashboard/single-course/mock/wronge-redo/${courseId}`)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (noAnalytics) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-white px-6 text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          Mock exam results
        </p>
        <h1 className="font-display text-2xl font-bold text-black sm:text-3xl">
          Attempt first
        </h1>
        <p className="max-w-sm text-sm text-neutral-500">
          You haven&apos;t submitted a mock exam for this course yet. Complete
          one sitting to unlock your results here.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/single-course/mock/${courseId}`)
            }
            className="inline-flex items-center gap-1.5 border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white"
          >
            Start mock exam
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={backToCourse}
            className="border border-black bg-white px-5 py-2.5 font-display text-sm font-semibold text-black"
          >
            Back to course
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white px-6">
        <p className="font-display text-sm text-neutral-500">{error}</p>
        <button
          type="button"
          onClick={backToCourse}
          className="border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white"
        >
          Back to course
        </button>
      </div>
    )
  }

  const incorrectDisplay = Math.max(
    0,
    scored.total - scored.correct - (scored.skipped || 0)
  )

  return (
    <div className="min-h-screen bg-white px-4 py-12 text-black sm:px-6">
      <div className="mx-auto w-full max-w-2xl text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          Mock exam complete · {courseName || "Course"}
        </p>

        <p className="mt-6 font-display font-bold leading-none tracking-tight">
          <span className="text-6xl sm:text-7xl">{scored.correct}</span>
          <span className="text-3xl text-neutral-400 sm:text-4xl">
            /{scored.total}
          </span>
        </p>

        <p className="mt-5 text-sm text-neutral-500 sm:text-base">
          {encouragement}
        </p>

        <div className="mt-10 grid grid-cols-3 gap-4 border-b border-neutral-200 pb-8">
          <div>
            <p className="font-display text-3xl font-bold tabular-nums">
              {scored.correct}
            </p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Correct
            </p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold tabular-nums">
              {incorrectDisplay}
            </p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Incorrect
            </p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold tabular-nums">
              {scored.percent}%
            </p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Score
            </p>
          </div>
        </div>

        <div className="mt-8 border border-neutral-200 text-left">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="font-display text-base font-bold text-black">
              Performance by domain
            </h2>
          </div>
          <ul className="divide-y divide-neutral-200">
            {scored.domains.map((d) => (
              <li key={d.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="min-w-0 flex-1 text-sm font-medium text-black">
                    {d.name}
                  </p>
                  <p className="shrink-0 font-mono text-xs tabular-nums text-neutral-500">
                    {d.correct}/{d.total} — {d.percent}%
                  </p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden bg-neutral-100">
                  <div
                    className="h-full bg-black transition-all"
                    style={{ width: `${Math.min(100, d.percent)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 border border-neutral-200 text-left">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="font-display text-base font-bold text-black">
              Complete result
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              Expand any question to see your answer and the correct one
            </p>
          </div>
          <ul className="divide-y divide-neutral-200">
            {scored.reviews.map((item) => {
              const open = !!openReviewIds[item.id]
              const statusLabel =
                item.status === "correct"
                  ? "Correct"
                  : item.status === "incorrect"
                    ? "Incorrect"
                    : "Skipped"
              const statusClass =
                item.status === "correct"
                  ? "text-emerald-700"
                  : item.status === "incorrect"
                    ? "text-red-600"
                    : "text-neutral-400"
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenReviewIds((prev) => ({
                        ...prev,
                        [item.id]: !prev[item.id],
                      }))
                    }
                    className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-neutral-50"
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border ${
                        item.status === "correct"
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : item.status === "incorrect"
                            ? "border-red-500 bg-red-500 text-white"
                            : "border-neutral-300 bg-white text-neutral-400"
                      }`}
                    >
                      {item.status === "correct" ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      ) : item.status === "incorrect" ? (
                        <X className="h-3.5 w-3.5" strokeWidth={3} />
                      ) : (
                        <span className="text-[10px] font-bold">—</span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                          Question {item.index}
                        </p>
                        <span
                          className={`font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 font-display text-sm font-medium text-black">
                        {item.text}
                      </p>
                    </div>
                    <ChevronDown
                      className={`mt-1 h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {open ? (
                    <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-4">
                      <div className="space-y-2">
                        {item.options.map((option, i) => {
                          const isCorrect = i === item.correctOption
                          const isSelected = item.selectedOption === i
                          let box =
                            "border-neutral-200 bg-white text-neutral-600"
                          if (isCorrect) {
                            box =
                              "border-emerald-600 bg-emerald-50 text-black"
                          } else if (isSelected) {
                            box = "border-red-500 bg-red-50 text-black"
                          }
                          return (
                            <div
                              key={i}
                              className={`flex items-start gap-3 border px-3 py-2.5 text-left text-sm ${box}`}
                            >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-semibold">
                                {OPTION_LETTERS[i]}
                              </span>
                              <span className="pt-0.5 flex-1 font-medium leading-relaxed">
                                {option}
                              </span>
                              {isCorrect ? (
                                <span className="shrink-0 font-mono text-[10px] font-semibold uppercase text-emerald-700">
                                  Correct
                                </span>
                              ) : isSelected ? (
                                <span className="shrink-0 font-mono text-[10px] font-semibold uppercase text-red-600">
                                  Yours
                                </span>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                      {item.explanation ? (
                        <div className="mt-4 border border-neutral-200 bg-white px-4 py-3">
                          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                            Explanation
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                            {item.explanation}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={redoEntire}
            className="inline-flex items-center justify-center gap-1.5 border border-black bg-white px-4 py-3 font-display text-sm font-semibold text-black transition-colors hover:bg-neutral-50"
          >
            Redo entire test
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={redoWrong}
            disabled={scored.wrongIds.length === 0}
            className="inline-flex items-center justify-center gap-1.5 border border-black bg-white px-4 py-3 font-display text-sm font-semibold text-black transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Practice {scored.wrongIds.length || incorrectDisplay} wrong answers
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-neutral-400">
          Wrong-answer practice is local only and does not update exam progress.
          Use Redo entire test for an official attempt.
        </p>

        <button
          type="button"
          onClick={backToCourse}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 border border-black bg-black px-4 py-3 font-display text-sm font-semibold text-white transition-colors hover:bg-neutral-800 sm:w-auto sm:min-w-[16rem]"
        >
          Back to course
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
