"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Loader2, SkipForward, X } from "lucide-react"
import { toast } from "react-hot-toast"
import type { PracticeWrongRedoResultPayload } from "../types"

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

interface LocalQuestion {
  id: number
  question: string
  options: string[]
  correctOption: number
  explanation: string
  selectedOption: number | null
}

const OPTION_LETTERS = ["A", "B", "C", "D"] as const

function isAnswered(v: number | null | undefined) {
  return v !== null && v !== undefined && v >= 0 && v <= 3
}

export default function PracticeWrongRedoPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = String(params?.id ?? "")

  const [courseName, setCourseName] = useState("")
  const [questions, setQuestions] = useState<LocalQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!courseId || hasFetched.current) return
    hasFetched.current = true

    const load = async () => {
      setLoading(true)
      setError(null)

      let redoIds: number[] = []
      try {
        const raw = sessionStorage.getItem("practice_redo_question_ids")
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) redoIds = parsed
        }
      } catch {
        // ignore
      }

      if (redoIds.length === 0) {
        setError("No wrong answers selected for practice.")
        setLoading(false)
        return
      }

      const token = sessionStorage.getItem("Authorization")
      if (!token) {
        setError("Please sign in")
        setLoading(false)
        return
      }

      sessionStorage.setItem("course_id", courseId)

      try {
        // GET only — no quiz_progress POSTs
        const qRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}/question_page/`,
          { headers: { Authorization: token } }
        )
        if (!qRes.ok) throw new Error("Failed to load questions")

        const qData: {
          name: string
          chapters: Array<{
            subtopics: Array<{ questions: ApiQuestion[] }>
          }>
        } = await qRes.json()

        setCourseName(qData.name || sessionStorage.getItem("course_name") || "")
        sessionStorage.setItem("course_name", qData.name || "")

        const all: LocalQuestion[] = []
        for (const ch of qData.chapters || []) {
          for (const st of ch.subtopics || []) {
            for (const q of st.questions || []) {
              all.push({
                id: q.id,
                question: q.text,
                options: [q.option0, q.option1, q.option2, q.option3],
                correctOption: q.correct_option,
                explanation: q.explanation || "",
                selectedOption: null,
              })
            }
          }
        }

        const filtered = all.filter((q) => redoIds.includes(q.id))
        if (filtered.length === 0) {
          setError("Those questions are no longer available.")
          setLoading(false)
          return
        }

        setQuestions(filtered)
        setCurrentIndex(0)
        setSelectedOption(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load practice")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId])

  const current = questions[currentIndex]
  const total = questions.length

  const answeredCount = useMemo(
    () => questions.filter((q) => isAnswered(q.selectedOption)).length,
    [questions]
  )

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= total) return
    setCurrentIndex(idx)
    setSelectedOption(questions[idx]?.selectedOption ?? null)
  }

  const handleSelect = (optionIndex: number) => {
    const next = selectedOption === optionIndex ? null : optionIndex
    setSelectedOption(next)
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === currentIndex ? { ...q, selectedOption: next } : q
      )
    )
  }

  const handleSkip = () => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === currentIndex ? { ...q, selectedOption: null } : q
      )
    )
    setSelectedOption(null)
    if (currentIndex < total - 1) goTo(currentIndex + 1)
    else setShowFinishModal(true)
  }

  const handleNext = () => {
    if (!isAnswered(selectedOption)) {
      toast.error("Select an answer, or skip")
      return
    }
    if (currentIndex < total - 1) goTo(currentIndex + 1)
    else setShowFinishModal(true)
  }

  const handlePrev = () => {
    if (currentIndex === 0) return
    goTo(currentIndex - 1)
  }

  const finishPractice = () => {
    let correct = 0
    let incorrect = 0
    let skipped = 0
    const items = questions.map((q, index) => {
      let status: "correct" | "incorrect" | "skipped" = "skipped"
      if (!isAnswered(q.selectedOption)) skipped += 1
      else if (q.selectedOption === q.correctOption) {
        correct += 1
        status = "correct"
      } else {
        incorrect += 1
        status = "incorrect"
      }
      return {
        id: q.id,
        index: index + 1,
        text: q.question,
        options: q.options,
        correctOption: q.correctOption,
        selectedOption: q.selectedOption,
        explanation: q.explanation,
        status,
      }
    })

    const payload: PracticeWrongRedoResultPayload = {
      courseId,
      courseName:
        courseName || sessionStorage.getItem("course_name") || "Course",
      total,
      correct,
      incorrect,
      skipped,
      percent: total > 0 ? Math.round((correct / total) * 100) : 0,
      items,
    }

    sessionStorage.setItem(
      "practice_wrong_redo_result",
      JSON.stringify(payload)
    )
    router.push(
      "/dashboard/single-course/practice/wronge-redo/wronge-redo-result"
    )
  }

  const leave = () => {
    router.push(`/dashboard/single-course/practice/result/${courseId}`)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (error || !current || total === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white px-6">
        <p className="font-display text-sm text-neutral-500">
          {error || "No questions available."}
        </p>
        <button
          type="button"
          onClick={leave}
          className="border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white"
        >
          Back to results
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-black">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-black px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={leave}
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-black hover:bg-neutral-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="truncate font-display text-sm font-semibold sm:text-base">
            {courseName || "Course"}
            <span className="font-normal text-neutral-400">
              {" "}
              · Wrong answers practice
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[10px] uppercase tracking-wider text-neutral-400 sm:inline">
            Local only · not saved
          </span>
          <button
            type="button"
            onClick={() => setShowFinishModal(true)}
            className="border border-black bg-white px-3 py-1.5 font-display text-xs font-semibold sm:text-sm"
          >
            Finish practice
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-10">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-4 h-1 w-full overflow-hidden bg-neutral-100">
            <div
              className="h-full bg-black transition-all"
              style={{
                width: `${total > 0 ? (currentIndex / total) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs text-neutral-400">
              Question {currentIndex + 1} of {total}
            </p>
            <button
              type="button"
              onClick={handleSkip}
              className="inline-flex items-center gap-1 font-display text-xs font-semibold text-neutral-500 hover:text-black"
            >
              <SkipForward className="h-3 w-3" strokeWidth={2.5} />
              Skip
            </button>
          </div>

          <h1 className="mt-6 font-display text-xl font-bold leading-snug sm:text-2xl">
            {current.question}
          </h1>

          <div className="mt-8 space-y-3">
            {current.options.map((option, i) => {
              const selected = selectedOption === i
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(i)}
                  className={`flex w-full items-start gap-3 border px-4 py-3.5 text-left ${
                    selected
                      ? "border-black bg-black text-white"
                      : "border-black bg-white hover:bg-neutral-50"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                      selected
                        ? "border-white text-white"
                        : "border-black text-black"
                    }`}
                  >
                    {OPTION_LETTERS[i]}
                  </span>
                  <span className="pt-0.5 text-sm font-medium leading-relaxed">
                    {option}
                  </span>
                </button>
              )
            })}
          </div>

          <p className="mt-4 font-mono text-[10px] text-neutral-400">
            Local practice · answers are not saved · Answered {answeredCount}/
            {total}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePrev}
              className="inline-flex items-center gap-2 border border-black bg-white px-5 py-2.5 font-display text-sm font-semibold disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white"
            >
              {currentIndex === total - 1 ? "Finish practice" : "Next"}
              {currentIndex < total - 1 ? (
                <ArrowRight className="h-3.5 w-3.5" />
              ) : null}
            </button>
          </div>
        </div>
      </main>

      {showFinishModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md border-2 border-black bg-white p-6">
            <h3 className="font-display text-xl font-bold">Finish practice?</h3>
            <p className="mt-3 text-sm text-neutral-500">
              We&apos;ll show a local score for these questions. Nothing is
              posted to your quiz progress.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowFinishModal(false)}
                className="border border-black bg-white px-5 py-2.5 font-display text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={finishPractice}
                className="border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white"
              >
                See practice result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
