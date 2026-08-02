"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, ChevronDown, Loader2, X } from "lucide-react"
import type { PracticeWrongRedoResultPayload } from "../types"

const OPTION_LETTERS = ["A", "B", "C", "D"] as const

export default function PracticeWrongRedoResultPage() {
  const router = useRouter()
  const [payload, setPayload] = useState<PracticeWrongRedoResultPayload | null>(
    null
  )
  const [openIds, setOpenIds] = useState<Record<number, boolean>>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("practice_wrong_redo_result")
      if (raw) {
        setPayload(JSON.parse(raw) as PracticeWrongRedoResultPayload)
      }
    } catch {
      setPayload(null)
    } finally {
      setReady(true)
    }
  }, [])

  if (!ready) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (!payload) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white px-6">
        <p className="font-display text-sm text-neutral-500">
          No practice result found.
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

  const practiceAgain = () => {
    const ids = payload.items.map((i) => i.id)
    sessionStorage.setItem("practice_redo_question_ids", JSON.stringify(ids))
    router.push(
      `/dashboard/single-course/practice/wronge-redo/${payload.courseId}`
    )
  }

  return (
    <div className="min-h-screen bg-white px-4 py-12 text-black sm:px-6">
      <div className="mx-auto w-full max-w-2xl text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          Wrong answers practice · local only · {payload.courseName}
        </p>

        <p className="mt-6 font-display font-bold leading-none tracking-tight">
          <span className="text-6xl sm:text-7xl">{payload.correct}</span>
          <span className="text-3xl text-neutral-400 sm:text-4xl">
            /{payload.total}
          </span>
        </p>

        <p className="mt-5 text-sm text-neutral-500">
          This practice isn&apos;t saved. Take a full practice quiz for
          official progress.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-4 border-b border-neutral-200 pb-8">
          <div>
            <p className="font-display text-3xl font-bold tabular-nums">
              {payload.correct}
            </p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Correct
            </p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold tabular-nums">
              {payload.incorrect}
            </p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Incorrect
            </p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold tabular-nums">
              {payload.percent}%
            </p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Score
            </p>
          </div>
        </div>

        <div className="mt-8 border border-neutral-200 text-left">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="font-display text-base font-bold">
              Question review
            </h2>
          </div>
          <ul className="divide-y divide-neutral-200">
            {payload.items.map((item) => {
              const open = !!openIds[item.id]
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
                      setOpenIds((prev) => ({
                        ...prev,
                        [item.id]: !prev[item.id],
                      }))
                    }
                    className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-neutral-50"
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border ${
                        item.status === "correct"
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : item.status === "incorrect"
                            ? "border-red-500 bg-red-500 text-white"
                            : "border-neutral-300 text-neutral-400"
                      }`}
                    >
                      {item.status === "correct" ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      ) : item.status === "incorrect" ? (
                        <X className="h-3.5 w-3.5" strokeWidth={3} />
                      ) : (
                        "—"
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-mono text-[10px] uppercase text-neutral-400">
                          Question {item.index}
                        </p>
                        <span
                          className={`font-mono text-[10px] font-semibold uppercase ${statusClass}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm font-medium">
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
                    <div className="space-y-2 bg-neutral-50 px-5 py-4">
                      {item.options.map((option, i) => {
                        const isCorrect = i === item.correctOption
                        const isSelected = item.selectedOption === i
                        let box =
                          "border-neutral-200 bg-white text-neutral-600"
                        if (isCorrect)
                          box = "border-emerald-600 bg-emerald-50 text-black"
                        else if (isSelected)
                          box = "border-red-500 bg-red-50 text-black"
                        return (
                          <div
                            key={i}
                            className={`flex items-start gap-3 border px-3 py-2.5 text-sm ${box}`}
                          >
                            <span className="font-semibold">
                              {OPTION_LETTERS[i]}.
                            </span>
                            <span className="flex-1">{option}</span>
                          </div>
                        )
                      })}
                      {item.explanation ? (
                        <p className="pt-1 text-xs leading-relaxed text-neutral-500">
                          {item.explanation}
                        </p>
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
            onClick={practiceAgain}
            className="inline-flex items-center justify-center gap-1.5 border border-black bg-white px-4 py-3 font-display text-sm font-semibold"
          >
            Practice these again
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("practice_redo_question_ids")
              window.location.href = `/dashboard/single-course/practice/${payload.courseId}`
            }}
            className="inline-flex items-center justify-center gap-1.5 border border-black bg-white px-4 py-3 font-display text-sm font-semibold"
          >
            Take full practice quiz
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(
              `/dashboard/single-course/practice/result/${payload.courseId}`
            )
          }
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 border border-black bg-black px-4 py-3 font-display text-sm font-semibold text-white sm:w-auto sm:min-w-[16rem]"
        >
          Back to official results
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
