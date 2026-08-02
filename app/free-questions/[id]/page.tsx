"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Check, X } from "lucide-react"
import {
  FREE_QUIZ_EXAMS,
  getFreeQuestions,
  isFreeQuizExamId,
} from "@/lib/free-questions/data"
import {
  clearFreeQuizProgress,
  loadFreeQuizProgress,
  saveFreeQuizProgress,
  saveFreeQuizResult,
} from "@/lib/free-questions/storage"
import type { FreeQuizExamId, FreeQuizResult } from "@/lib/free-questions/types"

const OPTION_LETTERS = ["A", "B", "C", "D"] as const

export default function FreeQuestionsQuizPage() {
  const params = useParams()
  const router = useRouter()
  const rawId = typeof params.id === "string" ? params.id.toLowerCase() : ""
  const examId = isFreeQuizExamId(rawId) ? rawId : null

  const questions = useMemo(
    () => (examId ? getFreeQuestions(examId) : []),
    [examId]
  )

  const [ready, setReady] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | null>>({})

  useEffect(() => {
    if (!examId) {
      setReady(true)
      return
    }
    const saved = loadFreeQuizProgress(examId)
    if (saved) {
      setCurrentIndex(
        Math.min(Math.max(saved.currentIndex, 0), questions.length - 1)
      )
      setAnswers(saved.answers ?? {})
    } else {
      const initial: Record<string, number | null> = {}
      questions.forEach((q) => {
        initial[q.id] = null
      })
      setAnswers(initial)
      setCurrentIndex(0)
    }
    setReady(true)
  }, [examId, questions])

  useEffect(() => {
    if (!ready || !examId) return
    saveFreeQuizProgress({ examId, currentIndex, answers })
  }, [ready, examId, currentIndex, answers])

  if (!examId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6">
        <p className="font-display text-sm text-neutral-500">
          Demo quiz not found.
        </p>
        <Link
          href="/"
          className="bg-black px-5 py-2.5 font-display text-sm font-semibold text-white"
        >
          Back home
        </Link>
      </div>
    )
  }

  if (!ready || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
      </div>
    )
  }

  const exam = FREE_QUIZ_EXAMS[examId]
  const question = questions[currentIndex]
  const selected = answers[question.id] ?? null
  const answered = selected !== null
  const isCorrect = answered && selected === question.correctOption
  const progress = ((currentIndex + (answered ? 1 : 0)) / questions.length) * 100
  const isLast = currentIndex === questions.length - 1

  const selectOption = (optionIndex: number) => {
    if (answered) return
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
  }

  const finishQuiz = (finalAnswers: Record<string, number | null>) => {
    const items = questions.map((q, index) => {
      const selectedOption = finalAnswers[q.id] ?? null
      const status =
        selectedOption === null
          ? ("skipped" as const)
          : selectedOption === q.correctOption
            ? ("correct" as const)
            : ("incorrect" as const)
      return {
        id: q.id,
        index,
        text: q.text,
        options: [...q.options],
        correctOption: q.correctOption,
        selectedOption,
        explanation: q.explanation,
        domain: q.domain,
        status,
      }
    })

    const correct = items.filter((i) => i.status === "correct").length
    const incorrect = items.filter((i) => i.status === "incorrect").length
    const skipped = items.filter((i) => i.status === "skipped").length
    const total = items.length
    const percent = total === 0 ? 0 : Math.round((correct / total) * 100)

    const result: FreeQuizResult = {
      examId: examId as FreeQuizExamId,
      examLabel: exam.label,
      total,
      correct,
      incorrect,
      skipped,
      percent,
      items,
      finishedAt: new Date().toISOString(),
    }

    saveFreeQuizResult(result)
    clearFreeQuizProgress()
    router.push("/free-questions/result")
  }

  const goNext = () => {
    if (!answered) return
    if (isLast) {
      finishQuiz(answers)
      return
    }
    setCurrentIndex((i) => i + 1)
  }

  const handleExit = () => {
    clearFreeQuizProgress()
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA]">
      {/* Top bar */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#F5C6C6] font-display text-[10px] font-bold text-black">
              EE
            </span>
            <span className="truncate font-display text-sm text-neutral-500">
              {exam.title}
            </span>
          </div>

          <div className="hidden w-48 flex-col items-center sm:flex sm:w-56">
            <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full bg-neutral-800 transition-all duration-300"
                style={{ width: `${Math.max(progress, 8)}%` }}
              />
            </div>
            <p className="mt-1.5 font-mono text-[10px] tracking-wide text-neutral-400">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>

          <button
            type="button"
            onClick={handleExit}
            className="inline-flex items-center gap-1.5 font-display text-sm text-neutral-500 transition-colors hover:text-black"
          >
            <X className="h-4 w-4" strokeWidth={2} />
            Exit
          </button>
        </div>
        <div className="px-4 pb-3 sm:hidden">
          <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full bg-neutral-800 transition-all duration-300"
              style={{ width: `${Math.max(progress, 8)}%` }}
            />
          </div>
          <p className="mt-1.5 text-center font-mono text-[10px] tracking-wide text-neutral-400">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
      </header>

      {/* Question body */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          {question.domain}
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold leading-snug tracking-tight text-black sm:text-[1.75rem]">
          {question.text}
        </h1>

        <ul className="mt-8 space-y-3">
          {question.options.map((option, i) => {
            const letter = OPTION_LETTERS[i]
            const isSelected = selected === i
            const showCorrect = answered && i === question.correctOption
            const showWrong = answered && isSelected && i !== question.correctOption

            let boxClass =
              "border-neutral-200 bg-white hover:border-neutral-400"
            let circleClass =
              "border-neutral-300 bg-white text-neutral-500"

            if (showCorrect) {
              boxClass = "border-emerald-500 bg-emerald-50"
              circleClass = "border-emerald-600 bg-emerald-600 text-white"
            } else if (showWrong) {
              boxClass = "border-red-400 bg-red-50"
              circleClass = "border-red-500 bg-red-500 text-white"
            } else if (answered) {
              boxClass = "border-neutral-200 bg-white opacity-60"
            }

            return (
              <li key={`${question.id}-${i}`}>
                <button
                  type="button"
                  disabled={answered}
                  onClick={() => selectOption(i)}
                  className={`flex w-full items-center gap-3.5 rounded-md border px-4 py-3.5 text-left transition-colors ${boxClass} ${
                    answered ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-display text-sm font-semibold ${circleClass}`}
                  >
                    {letter}
                  </span>
                  <span className="font-display text-[15px] text-neutral-900">
                    {option}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {answered && (
          <div
            className={`mt-6 rounded-md border-l-4 bg-neutral-100 px-4 py-4 ${
              isCorrect ? "border-l-emerald-500" : "border-l-red-500"
            }`}
          >
            <p
              className={`font-display text-xs font-bold uppercase tracking-wider ${
                isCorrect ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {isCorrect ? "Correct" : "Incorrect"}
            </p>
            <p className="mt-1.5 font-display text-sm leading-relaxed text-neutral-800">
              {question.explanation}
            </p>
          </div>
        )}
      </main>

      {/* Bottom bar */}
      <footer className="sticky bottom-0 border-t border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4 sm:px-6">
          <div className="min-w-[5rem]">
            {answered && (
              <span
                className={`inline-flex items-center gap-1.5 font-display text-sm font-medium ${
                  isCorrect ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {isCorrect ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                ) : (
                  <X className="h-4 w-4" strokeWidth={2.5} />
                )}
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!answered}
            onClick={goNext}
            className="bg-black px-5 py-2.5 font-display text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLast ? "See results →" : "Next question →"}
          </button>
        </div>
      </footer>
    </div>
  )
}
