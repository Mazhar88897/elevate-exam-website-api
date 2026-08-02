export type FreeQuizExamId = "cissp" | "cism" | "crisc"

export type FreeQuestion = {
  id: string
  domain: string
  text: string
  options: [string, string, string, string]
  correctOption: 0 | 1 | 2 | 3
  explanation: string
}

export type FreeQuizResultItem = {
  id: string
  index: number
  text: string
  options: string[]
  correctOption: number
  selectedOption: number | null
  explanation: string
  domain: string
  status: "correct" | "incorrect" | "skipped"
}

export type FreeQuizResult = {
  examId: FreeQuizExamId
  examLabel: string
  total: number
  correct: number
  incorrect: number
  skipped: number
  percent: number
  items: FreeQuizResultItem[]
  finishedAt: string
}

export const FREE_QUIZ_RESULT_KEY = "free_quiz_result"
export const FREE_QUIZ_PROGRESS_KEY = "free_quiz_progress"

export type FreeQuizProgress = {
  examId: FreeQuizExamId
  currentIndex: number
  answers: Record<string, number | null>
}
