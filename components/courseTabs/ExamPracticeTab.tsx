"use client"

export default function ExamPracticeTab() {
  const practiceSets = [
    { id: 1, title: "Networking Fundamentals", questions: 20, difficulty: "Easy" },
    { id: 2, title: "Security Operations", questions: 25, difficulty: "Medium" },
    { id: 3, title: "Cloud Security", questions: 15, difficulty: "Hard" },
  ]

  return (
    <div className="p-6 border-2 rounded-mid shadow-sm">
      <h2 className="text-md font-bold mb-4">Exam Practice</h2>
      <div className="space-y-3">
        {practiceSets.map((set) => (
          <div key={set.id} className="border rounded-mid p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold">{set.title}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">{set.questions} Questions</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-md bg-[#f0f0ff] text-xcolor font-semibold">
              {set.difficulty}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
