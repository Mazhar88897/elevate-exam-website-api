"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Plus,
  Send,
  X,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { FREE_LIMIT_PAY_MODAL_OPEN_EVENT } from "@/components/dashboardItems/free-limit-pay-modal"

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

interface ApiSubtopic {
  id: number
  name: string
  questions: ApiQuestion[]
}

interface ApiChapter {
  id: number
  name: string
  subtopics: ApiSubtopic[]
}

interface ApiQuestionsResponse {
  id: number
  name: string
  total_questions: number
  chapters: ApiChapter[]
}

interface ProgressQuestion {
  id: number
  question: number
  selected_option: number | null
  is_flagged: boolean
}

interface ProgressSubtopic {
  id: number
  subtopic: number
  attempted_questions: number
  questions: ProgressQuestion[]
}

interface ProgressChapter {
  id: number
  chapter: number
  attempted_questions: number
  subtopics: ProgressSubtopic[]
}

interface ProgressApiResponse {
  id: number
  course: number
  attempted_questions: number
  correct_count: number
  last_viewed_question: number | null
  is_submitted: boolean
  chapters: ProgressChapter[]
}

interface FlatQuestion {
  id: number
  question: string
  options: string[]
  correctOption: number
  explanation: string
  selectedOption: number | null
  chapterId: number
  chapterName: string
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
  "Why is the correct answer right?",
  "What should I revise next?",
]

function formatCourseSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

export default function PracticeQuizPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = String(params?.id ?? "")

  const [questions, setQuestions] = useState<FlatQuestion[]>([])
  const [courseName, setCourseName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [checkingOn, setCheckingOn] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [aiOpen, setAiOpen] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [aiInput, setAiInput] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [apiCorrectCount, setApiCorrectCount] = useState(0)
  // Timer — disabled for now
  // const [timerOn, setTimerOn] = useState(false)
  // const [elapsedSec, setElapsedSec] = useState(0)
  const hasFetched = useRef(false)
  const chatRef = useRef<HTMLDivElement>(null)

  const authToken = () =>
    typeof window !== "undefined"
      ? sessionStorage.getItem("Authorization")
      : null

  // useEffect(() => {
  //   setTimerOn(sessionStorage.getItem("practice_timer_on") === "1")
  // }, [])

  // useEffect(() => {
  //   if (!timerOn || loading) return
  //   const id = window.setInterval(() => {
  //     setElapsedSec((s) => s + 1)
  //   }, 1000)
  //   return () => window.clearInterval(id)
  // }, [timerOn, loading])

  useEffect(() => {
    if (!courseId || hasFetched.current) return
    hasFetched.current = true

    const load = async () => {
      setLoading(true)
      setError(null)
      const auth = authToken()
      if (!auth) {
        setError("Please sign in")
        setLoading(false)
        return
      }

      sessionStorage.setItem("course_id", courseId)

      try {
        const [qRes, pRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}/question_page/`,
            { headers: { Authorization: auth } }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/quiz_progress/${courseId}/progress/`,
            { headers: { Authorization: auth } }
          ),
        ])

        if (!qRes.ok) throw new Error("Failed to load questions")

        const qData: ApiQuestionsResponse = await qRes.json()
        setCourseName(qData.name || sessionStorage.getItem("course_name") || "")
        sessionStorage.setItem("course_name", qData.name || "")

        let progress: ProgressApiResponse | null = null
        if (pRes.ok) {
          progress = await pRes.json()
          setApiCorrectCount(progress.correct_count || 0)
        }

        const progressMap = new Map<number, number | null>()
        if (progress) {
          for (const ch of progress.chapters || []) {
            for (const st of ch.subtopics || []) {
              for (const pq of st.questions || []) {
                progressMap.set(pq.question, pq.selected_option)
              }
            }
          }
        }

        const flat: FlatQuestion[] = []
        let selectedDomainIds: number[] | null = null
        try {
          const raw = sessionStorage.getItem("practice_domain_ids")
          if (raw) {
            const ids = JSON.parse(raw)
            if (Array.isArray(ids) && ids.length > 0) selectedDomainIds = ids
          }
        } catch {
          // ignore
        }

        for (const ch of qData.chapters || []) {
          if (selectedDomainIds && !selectedDomainIds.includes(ch.id)) continue
          for (const st of ch.subtopics || []) {
            for (const q of st.questions || []) {
              const sel = progressMap.has(q.id)
                ? progressMap.get(q.id)!
                : null
              flat.push({
                id: q.id,
                question: q.text,
                options: [q.option0, q.option1, q.option2, q.option3],
                correctOption: q.correct_option,
                explanation: q.explanation,
                selectedOption:
                  sel !== null && sel !== undefined && sel >= 0 && sel <= 3
                    ? sel
                    : null,
                chapterId: ch.id,
                chapterName: ch.name,
              })
            }
          }
        }

        if (flat.length === 0) throw new Error("No questions available")

        setQuestions(flat)

        let start = 0
        if (progress?.last_viewed_question != null) {
          const lastIdx = flat.findIndex(
            (q) => q.id === progress!.last_viewed_question
          )
          if (lastIdx !== -1) {
            start = lastIdx + 1 < flat.length ? lastIdx + 1 : lastIdx
          }
        } else {
          const firstOpen = flat.findIndex((q) => q.selectedOption === null)
          if (firstOpen !== -1) start = firstOpen
        }

        setCurrentIndex(start)
        setSelectedOption(flat[start]?.selectedOption ?? null)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load quiz")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [courseId])

  const topics: TopicRow[] = useMemo(() => {
    const map = new Map<number, TopicRow>()
    questions.forEach((q, i) => {
      const existing = map.get(q.chapterId)
      if (existing) existing.indexes.push(i)
      else
        map.set(q.chapterId, {
          id: q.chapterId,
          name: q.chapterName,
          indexes: [i],
        })
    })
    return Array.from(map.values())
  }, [questions])

  const current = questions[currentIndex]
  const total = questions.length
  const isAnswered = selectedOption !== null

  const activeTopic = useMemo(
    () => topics.find((t) => t.indexes.includes(currentIndex)) || topics[0],
    [topics, currentIndex]
  )

  const answeredCount = useMemo(
    () => questions.filter((q) => q.selectedOption !== null).length,
    [questions]
  )

  const correctSoFar = useMemo(() => {
    const local = questions.filter(
      (q) =>
        q.selectedOption !== null && q.selectedOption === q.correctOption
    ).length
    return Math.max(local, apiCorrectCount)
  }, [questions, apiCorrectCount])

  const topicPercent = useCallback(
    (topic: TopicRow) => {
      if (topic.indexes.length === 0) return 0
      let done = 0
      for (const i of topic.indexes) {
        if (questions[i]?.selectedOption !== null) done += 1
      }
      return Math.round((done / topic.indexes.length) * 100)
    },
    [questions]
  )

  const saveQuestion = async (
    questionId: number,
    selected: number | null,
    isFlagged = false
  ) => {
    const auth = authToken()
    if (!auth) return
    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/quiz_progress/update_question/`,
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
  }

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= total) return
    setCurrentIndex(idx)
    setSelectedOption(questions[idx]?.selectedOption ?? null)
  }

  const handleSelect = (optionIndex: number) => {
    // With checking on, lock once answered
    if (checkingOn && isAnswered) return

    const next =
      !checkingOn && selectedOption === optionIndex ? null : optionIndex
    setSelectedOption(next)
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === currentIndex ? { ...q, selectedOption: next } : q
      )
    )
  }

  const gateFreeLimit = () => {
    const status = (
      sessionStorage.getItem("subscription_status") ?? ""
    )
      .trim()
      .toLowerCase()
    if (status === "active") return true
    const n = parseInt(sessionStorage.getItem("QuestionCountFree") ?? "0", 10)
    const freeCount = Number.isFinite(n) ? n : 0
    if (freeCount >= 10) {
      window.dispatchEvent(new CustomEvent(FREE_LIMIT_PAY_MODAL_OPEN_EVENT))
      return false
    }
    sessionStorage.setItem("QuestionCountFree", String(freeCount + 1))
    return true
  }

  const handleNext = async () => {
    if (!current) return
    if (!gateFreeLimit()) return

    setIsSubmitting(true)
    try {
      await saveQuestion(current.id, selectedOption)
      if (currentIndex < total - 1) goTo(currentIndex + 1)
      else setShowSubmitModal(true)
    } catch {
      toast.error("Could not save answer")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrev = async () => {
    if (!current || currentIndex === 0) return
    setIsSubmitting(true)
    try {
      await saveQuestion(current.id, selectedOption)
      goTo(currentIndex - 1)
    } finally {
      setIsSubmitting(false)
    }
  }

  const finish = () => router.push("/dashboard/single-course")

  const confirmSubmit = async () => {
    setShowSubmitModal(false)
    const auth = authToken()
    if (!auth) return
    try {
      if (current) await saveQuestion(current.id, selectedOption)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/quiz_progress/${courseId}/submit/`,
        {
          method: "POST",
          headers: {
            Authorization: auth,
            "Content-Type": "application/json",
          },
        }
      )
      if (res.ok) {
        toast.success("Quiz submitted")
        router.push(`/dashboard/single-course/practice/result/${courseId}`)
      } else toast.error("Failed to submit quiz")
    } catch {
      toast.error("Failed to submit quiz")
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
      const auth = authToken()
      if (!auth) throw new Error("Not signed in")

      const context = current
        ? `Current practice question: ${current.question}\nOptions: ${current.options
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
          content: `I can help with this ${activeTopic?.name || "topic"} question. Ask anything — I won't spoil the answer unless you ask.`,
        },
      ])
    }
  }, [aiOpen, current?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const showFeedback = checkingOn && isAnswered
  const isCorrect =
    selectedOption !== null && selectedOption === current?.correctOption

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
          onClick={finish}
          className="border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white"
        >
          Back to course
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
            onClick={finish}
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-black transition-colors hover:bg-neutral-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="truncate font-display text-sm font-semibold sm:text-base">
            {courseName || "Course"}
            <span className="font-normal text-neutral-400">
              {" "}
              · Practice Quiz
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Timer display — disabled for now
          {timerOn ? (
            <span className="hidden border border-black px-3 py-1.5 font-mono text-xs tabular-nums sm:inline-block">
              {String(Math.floor(elapsedSec / 3600)).padStart(2, "0")}:
              {String(Math.floor((elapsedSec % 3600) / 60)).padStart(2, "0")}:
              {String(elapsedSec % 60).padStart(2, "0")}
            </span>
          ) : null}
          */}
          <button
            type="button"
            onClick={() => setCheckingOn((v) => !v)}
            className="hidden items-center gap-1.5 font-display text-sm sm:inline-flex"
            title="Toggle instant feedback"
          >
            <span className="text-neutral-500">Checking:</span>
            <span
              className={`font-semibold ${
                checkingOn ? "text-black" : "text-neutral-400"
              }`}
            >
              {checkingOn ? "On" : "Off"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setAiOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 border border-black bg-black px-3 py-1.5 font-display text-xs font-semibold text-white transition-colors hover:bg-neutral-800 sm:text-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Ask AI
          </button>
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="border border-black bg-white px-3 py-1.5 font-display text-xs font-semibold text-black transition-colors hover:bg-neutral-50 sm:text-sm"
          >
            Submit now
          </button>
        </div>
      </header>

      {/* Mobile checking toggle */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2 sm:hidden">
        <button
          type="button"
          onClick={() => setCheckingOn((v) => !v)}
          className="font-display text-sm"
        >
          <span className="text-neutral-500">Checking: </span>
          <span className="font-semibold">
            {checkingOn ? "On" : "Off"}
          </span>
        </button>
        <span className="font-mono text-xs text-neutral-400">
          {answeredCount}/{total}
        </span>
      </div>

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
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? "bg-black font-semibold text-white"
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
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
              <span>Correct so far</span>
              <span className="tabular-nums">{correctSoFar}</span>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-10">
          <div className="mx-auto w-full max-w-2xl">
            <p className="font-mono text-xs text-neutral-400">
              Question {currentIndex + 1} of {total}
            </p>
            <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              {current.chapterName}
            </p>
            <h1 className="mt-3 font-display text-xl font-bold leading-snug text-black sm:text-2xl">
              {current.question}
            </h1>

            <div className="mt-8 space-y-3">
              {current.options.map((option, i) => {
                let style =
                  "border-neutral-300 bg-white text-black hover:border-black"

                if (showFeedback) {
                  if (i === current.correctOption) {
                    style =
                      "border-emerald-600 bg-emerald-50 text-black"
                  } else if (i === selectedOption) {
                    style = "border-red-500 bg-red-50 text-black"
                  } else {
                    style = "border-neutral-200 bg-white text-neutral-400"
                  }
                } else if (selectedOption === i) {
                  style = "border-black bg-black text-white"
                }

                const letterStyle = showFeedback
                  ? i === current.correctOption
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : i === selectedOption
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-neutral-300 text-neutral-400"
                  : selectedOption === i
                    ? "border-white text-white"
                    : "border-black text-black"

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelect(i)}
                    disabled={checkingOn && isAnswered}
                    className={`flex w-full items-start gap-3 border px-4 py-3.5 text-left transition-colors disabled:cursor-default ${style}`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${letterStyle}`}
                    >
                      {OPTION_LETTERS[i]}
                    </span>
                    <span className="pt-0.5 font-display text-sm font-medium leading-relaxed">
                      {option}
                    </span>
                  </button>
                )
              })}
            </div>

            {showFeedback && (
              <div className="mt-6 bg-neutral-50 px-5 py-4">
                <p
                  className={`font-display text-sm font-bold uppercase tracking-wide ${
                    isCorrect ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {isCorrect ? "Correct" : "Not quite"}
                </p>
                {current.explanation ? (
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {current.explanation}
                  </p>
                ) : null}
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={currentIndex === 0 || isSubmitting}
                onClick={handlePrev}
                className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-5 py-2.5 font-display text-sm font-semibold text-neutral-500 transition-colors hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleNext}
                className="inline-flex items-center gap-2 border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : currentIndex === total - 1 ? (
                  "Submit"
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
              <p className="font-display text-sm font-semibold">
                ✦ AI Assistant
              </p>
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
                    className="border border-neutral-300 px-2.5 py-1 font-mono text-[10px] text-neutral-600 transition-colors hover:border-black hover:text-black disabled:opacity-50"
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
                  className="h-10 flex-1 border border-black bg-white px-3 font-display text-sm outline-none placeholder:text-neutral-400"
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

      {showSubmitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md border-2 border-black bg-white p-6">
            <h3 className="font-display text-xl font-bold text-black">
              Submit quiz?
            </h3>
            <p className="mt-3 text-sm text-neutral-500">
              You can review your results after submitting.
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
                onClick={confirmSubmit}
                className="border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white"
              >
                Submit now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
