import type {
  FreeQuizExamId,
  FreeQuizProgress,
  FreeQuizResult,
} from "./types"
import { FREE_QUIZ_PROGRESS_KEY, FREE_QUIZ_RESULT_KEY } from "./types"

export function saveFreeQuizProgress(progress: FreeQuizProgress) {
  if (typeof window === "undefined") return
  localStorage.setItem(FREE_QUIZ_PROGRESS_KEY, JSON.stringify(progress))
}

export function loadFreeQuizProgress(
  examId: FreeQuizExamId
): FreeQuizProgress | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(FREE_QUIZ_PROGRESS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as FreeQuizProgress
    if (parsed.examId !== examId) return null
    return parsed
  } catch {
    return null
  }
}

export function clearFreeQuizProgress() {
  if (typeof window === "undefined") return
  localStorage.removeItem(FREE_QUIZ_PROGRESS_KEY)
}

export function saveFreeQuizResult(result: FreeQuizResult) {
  if (typeof window === "undefined") return
  localStorage.setItem(FREE_QUIZ_RESULT_KEY, JSON.stringify(result))
}

export function loadFreeQuizResult(): FreeQuizResult | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(FREE_QUIZ_RESULT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as FreeQuizResult
  } catch {
    return null
  }
}
