"use client"
import { BookOpen, FileText, Laptop, BarChart3, CheckCircle2, ArrowDownRight, ArrowUpRight } from "lucide-react"
import { CustomButton } from "@/components/pages/CustomButton"
import { Highlight } from "@/components/pages/Highlight"
import { useState } from "react"

export default function Page() {
    



    const topics = [
        {
            title: "Exam-Style Quiz Questions",
            description: "Access a wide range of topic-based and mixed quizzes that closely resemble real exam formats. These quizzes help you test your accuracy, identify misconceptions, and continually reinforce core concepts through repetitive practice."
        },
        {
            title: "Full-Length Practice Exams",
            description: "Simulate the actual exam environment with timed, comprehensive practice tests that challenge your knowledge, strategy, and time management. These exams prepare you for real pressure and improve overall performance under exam conditions."
        },
        {
            title: "AI-Powered Study Assistant",
            description: "Receive instant explanations, smart hints, and personalized study suggestions powered by AI. Whether you’re stuck on a concept or seeking a better strategy, the AI assistant is available anytime to guide your learning journey efficiently."
        },
        {
            title: "Interactive Flashcards",
            description: "Master essential definitions, formulas, and key points using interactive flashcards designed for active recall and spaced repetition. Improve memory retention and build a strong foundation through quick, daily revision sessions."
        },
        {
            title: "Detailed Performance Analytics",
            description: "Gain deep insights into your strengths and weaknesses with advanced performance tracking. Analyze your accuracy, speed, topic proficiency, and progress trends to make data-driven improvements and refine your preparation strategy."
        },
        {
            title: "Personal Notes & Highlights",
            description: "Organize your learning effectively by creating custom notes, saving key points, and highlighting important concepts. Build a personalized study hub that helps you revise efficiently and retain information for the long term."
        },
    ];
    
    const [openAccordions, setOpenAccordions] = useState<number[]>([])
    const toggleAccordion = (index: number) => {
        setOpenAccordions((prev) => prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index])
    }
  return (
    <section className="w-full px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Hero */}
        <div className="w-full h-[30vh] flex flex-col justify-center items-center sm:bg-white lg:bg-[#FDFBFB]">
            <h1 className="text-3xl font-bold text-center text-slate-700">
                 How Elevate Exams Works
            </h1>
        </div>

        {/* Video */}
        <div className="mx-auto max-w-5xl">
          <div className="relative w-full overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              className="absolute left-0 top-0 h-full w-full"
              src="https://www.youtube.com/embed/guFLjEsg1kc"
              title="Platform walkthrough"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="py-2 flex gap-3 font-bold text-sm text-slate-700">
            <p>#ElevateExams</p>
            <p>#ElevateYourLearning</p>
          </div>
        </div>

        

        {/* Steps */}
        <section className="flex justify-center mx-auto  py-12 pb-18 items-center px-8 ">
        <div className="flex-1 min-w-[300px] space-y-4">
      <h2 className="text-3xl font-semibold text-slate-700 mb-8">Features We Offer</h2>

      <div className="space-y-6">
        {/* Accordion Topics */}
        {topics.map((topic, index) => (
          <div key={index}>
            <div
              className="flex items-center justify-between pb-3 border-b border-black cursor-pointer"
              onClick={() => toggleAccordion(index)}
            >
              <h3 className="text-sm font-semibold text-gray-800">{topic.title}</h3>
              {openAccordions.includes(index) ? (
                <ArrowDownRight className="h-5 w-5 text-blue-600 transition-transform duration-200 scale-x-[-1]" />
              ) : (
                <ArrowUpRight className="h-5 w-5 text-gray-600 transition-transform duration-200" />
              )}
            </div>
            <div
              className={`my-2 text-gray-500 overflow-hidden transition-all duration-300 ${
                openAccordions.includes(index) ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-sm py-2">{topic.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
        </section>

        {/* What you get */}
     

        {/* CTA */}
        <div className="">
          <CustomButton href="/auth/sign-up" size="lg">
            <span className="text-sm font-semibold">Get Started</span>
          </CustomButton>
        </div>
      </div>
    </section>
  )
}


