"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  Loader2,
  Plus,
  Send,
  SkipForward,
  X,
} from "lucide-react"
import { toast } from "react-hot-toast"

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

interface ProgressApiResponse {
  id: number
  course: number
  attempted_questions: number
  last_viewed_question: number | null
  is_submitted: boolean
  questions: ProgressQuestion[]
}

interface LocalQuestion {
  id: number
  question: string
  options: string[]
  correctOption: number
  explanation: string
  selectedOption: number | null
  isFlagged: boolean
}

interface ChapterMeta {
  id: number
  name: string
}

interface TopicRow {
  id: number
  name: string
  indexes: number[]
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  isThinking?: boolean
}

const OPTION_LETTERS = ["A", "B", "C", "D"] as const

const AI_CHIPS = [
  "Explain this concept simply",
  "What should I revise next?",
  "Give me a memory tip",
]

function formatCourseSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

function isAnsweredOption(v: number | null | undefined) {
  return v !== null && v !== undefined && v >= 0 && v <= 3
}

export default function MockExamPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = String(params?.id ?? "")

  const [questions, setQuestions] = useState<LocalQuestion[]>([])
  const [chapters, setChapters] = useState<ChapterMeta[]>([])
  const [courseName, setCourseName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showQuitModal, setShowQuitModal] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [aiInput, setAiInput] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const hasFetched = useRef(false)
  const chatRef = useRef<HTMLDivElement>(null)

  const token = () =>
    typeof window !== "undefined"
      ? sessionStorage.getItem("Authorization")
      : null

  useEffect(() => {
    if (!courseId || hasFetched.current) return
    hasFetched.current = true

    const load = async () => {
      setLoading(true)
      setError(null)
      const auth = token()
      if (!auth) {
        setError("Please sign in")
        setLoading(false)
        return
      }

      sessionStorage.setItem("course_id", courseId)
      sessionStorage.removeItem("mock_redo_question_ids")

      try {
        const [questionsRes, progressRes, detailsRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}/full_test_page/`,
            { headers: { Authorization: auth } }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/test_progress/${courseId}/progress/?source=content`,
            { headers: { Authorization: auth } }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/course_details/${courseId}/`,
            { headers: { Authorization: auth } }
          ),
        ])

        if (!questionsRes.ok) throw new Error("Failed to load full exam questions")

        const qData: QuestionsApiResponse = await questionsRes.json()
        let progress: ProgressApiResponse | null = null
        if (progressRes.ok) progress = await progressRes.json()

        if (detailsRes.ok) {
          const details = await detailsRes.json()
          setCourseName(
            details.name || sessionStorage.getItem("course_name") || ""
          )
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

        const mapped: LocalQuestion[] = qData.questions.map((apiQ) => {
          const pq = progress?.questions?.find((p) => p.question === apiQ.id)
          return {
            id: apiQ.id,
            question: apiQ.text,
            options: [apiQ.option0, apiQ.option1, apiQ.option2, apiQ.option3],
            correctOption: apiQ.correct_option,
            explanation: apiQ.explanation,
            selectedOption: isAnsweredOption(pq?.selected_option ?? null)
              ? (pq!.selected_option as number)
              : null,
            isFlagged: pq?.is_flagged || false,
          }
        })

        setQuestions(mapped)

        let start = 0
        if (progress?.last_viewed_question != null) {
          const lastIdx = mapped.findIndex(
            (q) => q.id === progress!.last_viewed_question
          )
          if (lastIdx !== -1) {
            start = lastIdx + 1 < mapped.length ? lastIdx + 1 : lastIdx
          }
        } else {
          const firstOpen = mapped.findIndex(
            (q) => !isAnsweredOption(q.selectedOption)
          )
          if (firstOpen !== -1) start = firstOpen
        }

        setCurrentIndex(start)
        const startQ = mapped[start]
        setSelectedOption(
          startQ && isAnsweredOption(startQ.selectedOption)
            ? startQ.selectedOption
            : null
        )
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load exam")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId])

  const topics: TopicRow[] = useMemo(() => {
    if (questions.length === 0) return []
    if (chapters.length === 0) {
      return [
        {
          id: 0,
          name: "All questions",
          indexes: questions.map((_, i) => i),
        },
      ]
    }
    const n = chapters.length
    return chapters.map((ch, i) => {
      const start = Math.floor((i * questions.length) / n)
      const end = Math.floor(((i + 1) * questions.length) / n)
      return {
        id: ch.id,
        name: ch.name,
        indexes: Array.from({ length: end - start }, (_, j) => start + j),
      }
    })
  }, [chapters, questions])

  const current = questions[currentIndex]
  const total = questions.length

  const activeTopic = useMemo(
    () => topics.find((t) => t.indexes.includes(currentIndex)) || topics[0],
    [topics, currentIndex]
  )

  const answeredCount = useMemo(
    () => questions.filter((q) => isAnsweredOption(q.selectedOption)).length,
    [questions]
  )

  const flaggedCount = useMemo(
    () => questions.filter((q) => q.isFlagged).length,
    [questions]
  )

  const topicPercent = useCallback(
    (topic: TopicRow) => {
      if (topic.indexes.length === 0) return 0
      let done = 0
      for (const i of topic.indexes) {
        if (isAnsweredOption(questions[i]?.selectedOption)) done += 1
      }
      return Math.round((done / topic.indexes.length) * 100)
    },
    [questions]
  )

  const updateQuestion = async (
    questionId: number,
    selected: number | null,
    isFlagged: boolean
  ) => {
    const auth = token()
    if (!auth) throw new Error("Not signed in")
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/test_progress/update_question/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
        body: JSON.stringify({
          question_id: questionId,
          selected_option: selected,
          is_flagged: isFlagged,
        }),
      }
    )
    if (!res.ok) throw new Error(`Save failed (${res.status})`)
  }

  const submitExam = async () => {
    const auth = token()
    if (!auth) throw new Error("Not signed in")
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/test_progress/${courseId}/submit/`,
      {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
      }
    )
    if (!res.ok) throw new Error("Submit failed")
    toast.success("Exam submitted")
    router.push(`/dashboard/single-course/mock/result/${courseId}`)
  }

  const quitExam = async () => {
    const auth = token()
    if (!auth) return
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/test_progress/${courseId}/quit/`,
      {
        method: "POST",
        headers: { Authorization: auth },
      }
    )
    if (res.ok) {
      toast.success("Exam quit — progress cleared")
      router.push("/dashboard/single-course")
    } else {
      toast.error("Failed to quit exam")
    }
  }

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= total) return
    setCurrentIndex(idx)
    const q = questions[idx]
    setSelectedOption(
      q && isAnsweredOption(q.selectedOption) ? q.selectedOption : null
    )
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

  const handleFlag = () => {
    if (!current) return
    const nextFlag = !current.isFlagged
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === currentIndex ? { ...q, isFlagged: nextFlag } : q
      )
    )
  }

  const handleSkip = async () => {
    if (!current || isSubmitting) return
    setIsSubmitting(true)
    try {
      await updateQuestion(current.id, null, current.isFlagged)
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === currentIndex ? { ...q, selectedOption: null } : q
        )
      )
      setSelectedOption(null)
      if (currentIndex < total - 1) goTo(currentIndex + 1)
      else setShowSubmitModal(true)
    } catch {
      toast.error("Could not skip question")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinue = async () => {
    if (!current || isSubmitting) return
    if (!isAnsweredOption(selectedOption)) {
      toast.error("Select an answer, or skip")
      return
    }
    setIsSubmitting(true)
    try {
      await updateQuestion(current.id, selectedOption, current.isFlagged)
      if (currentIndex < total - 1) goTo(currentIndex + 1)
      else await submitExam()
    } catch {
      toast.error("Could not save answer")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrev = async () => {
    if (!current || currentIndex === 0 || isSubmitting) return
    setIsSubmitting(true)
    try {
      await updateQuestion(
        current.id,
        isAnsweredOption(selectedOption) ? selectedOption : null,
        current.isFlagged
      )
      goTo(currentIndex - 1)
    } catch {
      toast.error("Could not save answer")
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmSubmit = async () => {
    setShowSubmitModal(false)
    if (!current) return
    setIsSubmitting(true)
    try {
      await updateQuestion(
        current.id,
        isAnsweredOption(selectedOption) ? selectedOption : null,
        current.isFlagged
      )
      await submitExam()
    } catch {
      toast.error("Failed to submit exam")
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendAi = async (queryOverride?: string) => {
    const query = (queryOverride ?? aiInput).trim()
    if (!query || aiLoading) return

    const historyMsgs = messages.filter((m) => !m.isThinking)
    let history = { query: "", response: "" }
    if (historyMsgs.length >= 2) {
      const lastTwo = historyMsgs.slice(-2)
      const u = lastTwo.find((m) => m.role === "user")
      const a = lastTwo.find((m) => m.role === "assistant")
      history = { query: u?.content || "", response: a?.content || "" }
    }

    const thinkingId = String(Date.now() + 1)
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), role: "user", content: query },
      {
        id: thinkingId,
        role: "assistant",
        content: "Thinking…",
        isThinking: true,
      },
    ])
    setAiInput("")
    setAiLoading(true)

    try {
      const name = courseName || sessionStorage.getItem("course_name") || ""
      const auth = token()
      if (!auth) throw new Error("Not signed in")

      const context = current
        ? `Mock exam question (do not reveal the correct answer unless asked): ${current.question}\nOptions: ${current.options
            .map((o, i) => `${OPTION_LETTERS[i]}. ${o}`)
            .join(" | ")}\n\nUser: ${query}`
        : query

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/query/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
        body: JSON.stringify({
          course_id: formatCourseSlug(name) || "course",
          query: context,
          history,
        }),
      })
      if (!res.ok) throw new Error("AI request failed")
      const data = await res.json()
      const text = data.response || data.answer || "No response received"
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId
            ? { ...m, content: text, isThinking: false }
            : m
        )
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed")
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId
            ? {
                ...m,
                content: "Sorry, something went wrong. Try again.",
                isThinking: false,
              }
            : m
        )
      )
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (aiOpen && messages.length === 0 && current) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `I can help with this mock exam question on ${activeTopic?.name || "this topic"}. I won't reveal the answer unless you ask.`,
        },
      ])
    }
  }, [aiOpen, current?.id]) // eslint-disable-line react-hooks/exhaustive-deps

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
          onClick={() => router.push("/dashboard/single-course")}
          className="border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white"
        >
          Back to course
        </button>
      </div>
    )
  }

  const progressPct = total > 0 ? (currentIndex / total) * 100 : 0

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-black">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-black px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setShowQuitModal(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-black hover:bg-neutral-50"
            aria-label="Quit"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="truncate font-display text-sm font-semibold sm:text-base">
            {courseName || "Course"}
            <span className="font-normal text-neutral-400"> · Mock Exam</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            className="inline-flex items-center gap-1.5 border border-black bg-black px-3 py-1.5 font-display text-xs font-semibold text-white hover:bg-neutral-800 sm:text-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Ask AI
          </button>
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="border border-black bg-white px-3 py-1.5 font-display text-xs font-semibold hover:bg-neutral-50 sm:text-sm"
          >
            Submit now
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-black md:flex lg:w-80">
          <div className="flex-1 overflow-y-auto px-3 py-5">
            <p className="mb-3 px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Topics
            </p>
            <ul>
              {topics.map((topic) => {
                const active = topic.id === activeTopic?.id
                const pct = topicPercent(topic)
                return (
                  <li key={topic.id}>
                    <button
                      type="button"
                      onClick={() => {
                        const first = topic.indexes[0]
                        if (typeof first === "number") goTo(first)
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm ${
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
          <div className="space-y-1 border-t border-black px-4 py-3 font-mono text-xs text-neutral-500">
            <div className="flex justify-between">
              <span>Answered</span>
              <span className="tabular-nums">
                {answeredCount} / {total}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Flagged</span>
              <span className="tabular-nums">{flaggedCount}</span>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-10">
          <div className="mx-auto w-full max-w-2xl">
            <div className="mb-4 h-1 w-full overflow-hidden bg-neutral-100">
              <div
                className="h-full bg-black transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-xs text-neutral-400">
                Question {currentIndex + 1} of {total}
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSkip}
                  className="inline-flex items-center gap-1 font-display text-xs font-semibold text-neutral-500 hover:text-black disabled:opacity-40"
                >
                  <SkipForward className="h-3 w-3" strokeWidth={2.5} />
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleFlag}
                  className={`inline-flex items-center gap-1 font-display text-xs font-semibold ${
                    current.isFlagged
                      ? "text-black"
                      : "text-neutral-500 hover:text-black"
                  }`}
                >
                  <Flag
                    className="h-3 w-3"
                    strokeWidth={2.5}
                    fill={current.isFlagged ? "currentColor" : "none"}
                  />
                  {current.isFlagged ? "Flagged" : "Flag"}
                </button>
              </div>
            </div>

            <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              {activeTopic?.name || "Exam"}
            </p>
            <h1 className="mt-3 font-display text-xl font-bold leading-snug sm:text-2xl">
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
              Feedback at the end only · no hints during the exam
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={currentIndex === 0 || isSubmitting}
                onClick={handlePrev}
                className="inline-flex items-center gap-2 border border-black bg-white px-5 py-2.5 font-display text-sm font-semibold disabled:opacity-40"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <button
                type="button"
                disabled={isSubmitting || !isAnsweredOption(selectedOption)}
                onClick={handleContinue}
                className="inline-flex items-center gap-2 border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white disabled:opacity-40"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : currentIndex === total - 1 ? (
                  "Continue & submit"
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </main>

        {aiOpen && (
          <aside className="absolute inset-y-14 right-0 z-20 flex w-full max-w-sm shrink-0 flex-col border-l border-black bg-white shadow-xl md:static md:shadow-none">
            <div className="flex h-12 items-center justify-between border-b border-neutral-200 px-4">
              <p className="font-display text-sm font-semibold">AI Assistant</p>
              <button
                type="button"
                onClick={() => setAiOpen(false)}
                className="p-1 text-neutral-500 hover:text-black"
                aria-label="Close AI"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div
              ref={chatRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[90%] px-3 py-2.5 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-black text-white"
                      : "bg-neutral-100 text-neutral-800"
                  } ${m.isThinking ? "animate-pulse" : ""}`}
                >
                  {m.role === "assistant" && (
                    <p className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                      AI Assistant
                    </p>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
            <div className="shrink-0 border-t border-neutral-200 px-3 py-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {AI_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    disabled={aiLoading}
                    onClick={() => sendAi(chip)}
                    className="border border-neutral-300 px-2.5 py-1 font-mono text-[10px] text-neutral-600 hover:border-black hover:text-black disabled:opacity-50"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  sendAi()
                }}
              >
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask about this question…"
                  disabled={aiLoading}
                  className="h-10 flex-1 border border-black px-3 font-display text-sm outline-none placeholder:text-neutral-400"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiInput.trim()}
                  className="flex h-10 w-10 items-center justify-center bg-black text-white disabled:opacity-40"
                  aria-label="Send"
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </div>
          </aside>
        )}
      </div>

      {showQuitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md border-2 border-black bg-white p-6">
            <h3 className="font-display text-xl font-bold">Quit exam?</h3>
            <p className="mt-3 text-sm text-neutral-500">
              Quitting clears your mock exam progress. This can&apos;t be
              undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowQuitModal(false)}
                className="border border-black bg-white px-5 py-2.5 font-display text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={quitExam}
                className="border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white"
              >
                Quit exam
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md border-2 border-black bg-white p-6">
            <h3 className="font-display text-xl font-bold">Submit exam?</h3>
            <p className="mt-3 text-sm text-neutral-500">
              Once submitted you can&apos;t change answers. Feedback is shown
              after submission.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="border border-black bg-white px-5 py-2.5 font-display text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirmSubmit}
                className="border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white disabled:opacity-50"
              >
                {isSubmitting ? "Submitting…" : "Submit now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
