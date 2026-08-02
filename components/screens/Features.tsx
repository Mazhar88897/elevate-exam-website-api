"use client"

import {
  BarChart3,
  CalendarDays,
  FileText,
  RefreshCw,
  Sparkles,
  Timer,
} from "lucide-react"

const features = [
  {
    title: "Exam-style Quiz Questions",
    description:
      "Sharpen your knowledge with exam-focused quizzes designed to mirror the format, difficulty, and timing of actual test papers. Each question is crafted to reinforce key concepts, highlight common pitfalls, and build the confidence you need to excel on exam day.",
    icon: FileText,
    iconClass: "text-[#E8A0A0]",
  },
  {
    title: "Practice Exams",
    description:
      "Simulate the full test experience with timed, exam-length practice papers. Get a true measure of your readiness and identify exactly where to focus before the real exam.",
    icon: Timer,
    iconClass: "text-neutral-700",
  },
  {
    title: "AI Assistant",
    description:
      "Get instant, intelligent support as you study. Our AI Assistant explains answers, breaks down tough concepts, and guides your revision with personalised suggestions.",
    icon: Sparkles,
    iconClass: "text-neutral-800",
  },
  {
    title: "Flashcards",
    description:
      "Master key facts and formulas with smart, easy-to-review flashcards. Perfect for quick study sessions and long-term retention.",
    icon: RefreshCw,
    iconClass: "text-neutral-700",
  },
  {
    title: "Performance Analytics",
    description:
      "Track your progress with clear, insightful performance stats. See your strengths, spot weaknesses, and watch your improvement over time.",
    icon: BarChart3,
    iconClass: "text-[#5B8DEF]",
  },
  {
    title: "Calendar",
    description:
      "Mark your exam date and keep it visible on your dashboard. A simple reminder of how many days you have left, so your revision always has a clear deadline to work towards.",
    icon: CalendarDays,
    iconClass: "text-neutral-700",
  },
]

export default function Features() {
  return (
    <section className="w-full bg-white px-6 py-16 lg:px-10 lg:py-20 xl:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-[#C97878]" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97878]">
              Everything you need
            </p>
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight text-black sm:text-5xl">
            Features We
            <br />
            Offer.
          </h2>
        </div>

        <div className="grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <article key={feature.title} className="bg-white p-7 sm:p-8 lg:p-9">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300">
                  <Icon
                    className={`h-5 w-5 ${feature.iconClass}`}
                    strokeWidth={1.75}
                  />
                </div>
                <h3 className="font-display text-lg font-bold tracking-tight text-black">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  {feature.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
