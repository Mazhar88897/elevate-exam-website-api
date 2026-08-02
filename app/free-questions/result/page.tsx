"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, ChevronDown, X } from "lucide-react"
import { loadFreeQuizResult } from "@/lib/free-questions/storage"
import type { FreeQuizResult } from "@/lib/free-questions/types"

const OPTION_LETTERS = ["A", "B", "C", "D"] as const

export default function FreeQuestionsResultPage() {
  const router = useRouter()
  const [payload, setPayload] = useState<FreeQuizResult | null>(null)
  const [ready, setReady] = useState(false)
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setPayload(loadFreeQuizResult())
    setReady(true)
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
      </div>
    )
  }

  if (!payload) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6">
        <p className="font-display text-sm text-neutral-500">
          No demo result found.
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

  return (
    <div className="min-h-screen bg-white px-4 py-12 text-black sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Free demo · {payload.examLabel}
          </p>

          <p className="mt-6 font-display font-bold leading-none tracking-tight">
            <span className="text-6xl sm:text-7xl">{payload.correct}</span>
            <span className="text-3xl text-neutral-400 sm:text-4xl">
              /{payload.total}
            </span>
          </p>

          <p className="mt-5 text-sm text-neutral-500">
            Saved on this device only. Create an account for full courses and
            tracked progress.
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
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/free-questions/${payload.examId}`)}
            className="border border-black bg-white px-5 py-2.5 font-display text-sm font-semibold text-black transition-colors hover:bg-neutral-50"
          >
            Try again
          </button>
          <Link
            href="/auth/sign-up"
            className="bg-black px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Register free
          </Link>
          <Link
            href="/main/courses"
            className="font-display text-sm text-neutral-500 underline-offset-4 hover:text-black hover:underline"
          >
            Browse courses
          </Link>
        </div>

        <div className="mt-10 border border-neutral-200 text-left">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="font-display text-base font-bold">
              Question review
            </h2>
          </div>
          <ul className="divide-y divide-neutral-200">
            {payload.items.map((item) => {
              const open = !!openIds[item.id]
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
                        <span className="text-[10px] font-bold">–</span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                        Q{item.index + 1} · {item.domain}
                      </p>
                      <p className="mt-1 font-display text-sm font-medium text-neutral-900">
                        {item.text}
                      </p>
                    </div>
                    <ChevronDown
                      className={`mt-1 h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {open && (
                    <div className="space-y-2 px-5 pb-5">
                      {item.options.map((option, i) => {
                        const isCorrect = i === item.correctOption
                        const isSelected = i === item.selectedOption
                        let cls =
                          "border-neutral-200 bg-white text-neutral-700"
                        if (isCorrect) {
                          cls =
                            "border-emerald-500 bg-emerald-50 text-emerald-900"
                        } else if (isSelected) {
                          cls = "border-red-400 bg-red-50 text-red-900"
                        }
                        return (
                          <div
                            key={`${item.id}-opt-${i}`}
                            className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm ${cls}`}
                          >
                            <span className="font-display text-xs font-semibold">
                              {OPTION_LETTERS[i]}
                            </span>
                            <span className="font-display">{option}</span>
                          </div>
                        )
                      })}
                      <p className="mt-3 rounded-md bg-neutral-50 px-3 py-3 font-display text-sm leading-relaxed text-neutral-700">
                        {item.explanation}
                      </p>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
