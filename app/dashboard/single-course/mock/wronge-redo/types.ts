export type WrongRedoResultPayload = {
  courseId: string
  courseName: string
  total: number
  correct: number
  incorrect: number
  skipped: number
  percent: number
  items: Array<{
    id: number
    index: number
    text: string
    options: string[]
    correctOption: number
    selectedOption: number | null
    explanation: string
    status: "correct" | "incorrect" | "skipped"
  }>
}
