"use client"

import { useState } from "react"
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { HoverCard } from "@/components/pages/hoverCardstill"

export default function Faq() {
  // State to track which accordions are open
  const [openAccordions, setOpenAccordions] = useState<number[]>([0]) // First one open by default
  const [openAccordionsright, setOpenAccordionsright] = useState<number[]>([0]) 
  
  // Left column FAQ items (General Questions + Study Tools & Features)
  const leftColumnFaqs = [
    {
      title: "What is Elevate Exams?",
      description:
        "Elevate Exams is an online exam preparation platform designed to help you study efficiently and confidently. We provide practice quizzes, flashcards, full-length practice exams, performance analytics, and an AI-powered chatbot to support your learning journey.",
    },
    {
      title: "Who is Elevate Exams for?",
      description:
        "Elevate Exams is for students and professionals preparing for certifications, standardized tests, and academic exams. Whether you're just beginning or reviewing before exam day, our tools adapt to your progress and study style.",
    },
    {
      title: "Which exams and courses does Elevate Exams support?",
      description:
        "Elevate Exams supports a growing selection of exams and courses. Available courses can be viewed and selected from your profile dashboard. New content is added regularly.",
    },
    {
      title: "Do I need an account to use Elevate Exams?",
      description:
        "Yes. You must create an account to access quizzes, flashcards, practice exams, progress tracking, and personalized study features.",
    },
    {
      title: "Can I use Elevate Exams on multiple devices?",
      description:
        "Yes. You can access your account on desktop, tablet, and mobile devices. Your progress syncs automatically across all devices.",
    },
    {
      title: "What study tools are included with Elevate Exams?",
      description:
        "Elevate Exams includes practice quizzes, flashcards, full-length practice exams, an AI-powered learning chatbot, detailed performance statistics, and personalized study insights.",
    },
    {
      title: "How do practice quizzes work?",
      description:
        "Practice quizzes present exam-style questions with detailed explanations after each answer. You can review correct and incorrect responses to better understand key concepts.",
    },
    {
      title: "What are practice exams?",
      description:
        "Practice exams simulate the real testing experience with timed sessions and comprehensive coverage of exam topics. They help measure readiness and identify areas for improvement.",
    },
    {
      title: "How do flashcards work?",
      description:
        "Flashcards allow for quick review and memorization of important concepts. You can study all cards or focus on ones you've marked as difficult.",
    },
    {
      title: "What is the AI chatbot used for?",
      description:
        "The AI chatbot acts as a personal study assistant. It can explain concepts, clarify questions, break down explanations, and help guide your learning whenever you need support.",
    },
    {
      title: "Does Elevate Exams track my progress?",
      description:
        "Yes. We track quiz scores, exam results, topic mastery, and study trends to help you monitor improvement and focus on weaker areas.",
    },
  ]

  // Right column FAQ items (Account & Subscription + Technical & Support)
  const rightColumnFaqs = [
    {
      title: "Is Elevate Exams free?",
      description:
        "Creating an Elevate Exams account is free. A paid subscription is required to access full content and premium features.",
    },
    {
      title: "What subscription plans are available?",
      description:
        "We offer flexible subscription plans with both monthly and annual billing options. Annual subscriptions include a discounted rate compared to monthly billing. Current pricing is displayed on the subscription page before purchase.",
    },
    {
      title: "Can I cancel my subscription at any time?",
      description:
        "Yes. You can cancel your subscription at any time from your account settings. Your access will continue until the end of your billing period.",
    },
    {
      title: "Will I be charged after canceling?",
      description:
        "No. Once canceled, you will not be charged again unless you choose to reactivate your subscription.",
    },
    {
      title: "Do you offer refunds?",
      description:
        "Refund eligibility depends on your plan and billing provider. Please review our Refund Policy or contact support if you believe you were charged incorrectly.",
    },
    {
      title: "Can I switch or add courses?",
      description:
        "Yes. You can select, switch, or add courses from your profile at any time, depending on your subscription.",
    },
    {
      title: "I forgot my password. What should I do?",
      description:
        "Click \"Forgot Password\" on the login page and follow the instructions sent to your email to reset your password.",
    },
    {
      title: "My progress isn't showing correctly. What should I do?",
      description:
        "Try refreshing the page or logging out and back in. If the issue continues, please contact our support team for assistance.",
    },
    {
      title: "How can I contact Elevate Exams support?",
      description:
        "You can reach our support team through the Help or Contact Us section on the website. We aim to respond within 24–48 hours.",
    },
    {
      title: "Is Elevate Exams content updated regularly?",
      description:
        "Yes. We continuously review and update questions and explanations to keep content accurate and aligned with current exam standards.",
    },
  ]

  // Toggle accordion open/close
  const toggleAccordion = (index: number) => {
    setOpenAccordions((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }
  const toggleAccordionright = (index: number) => {
    setOpenAccordionsright((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <div className="flex flex-col justify-center mx-auto py-12 pb-18 items-center px-8">
      
      <div className="max-w-6xl w-full flex flex-wrap gap-8">
        {/* Left Column - General Questions & Study Tools */}
        <div className="flex-1 min-w-[300px] space-y-4">
          <h2 className="text-3xl font-semibold text-slate-700 mb-8">General Questions & Study Tools</h2>

          <div className="space-y-1">
            {leftColumnFaqs.map((faq, index) => (
              <div key={index}>
                <HoverCard isActive={index === 0 ? true : false}>
                  <div
                    className="flex items-center justify-between p-3 border border-gray-800 cursor-pointer"
                    onClick={() => toggleAccordion(index)}
                  >
                    <h3 className="text-sm font-semibold text-gray-800">{faq.title}</h3>
                    {openAccordions.includes(index) ? (
                      <ArrowDownRight className="h-5 w-5 text-blue-600 transition-transform duration-200 scale-x-[-1]" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-gray-600 transition-transform duration-200" />
                    )}
                  </div>
                </HoverCard>
                <div
                  className={`my-3 text-gray-500 overflow-hidden transition-all duration-300 ${
                    openAccordions.includes(index) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-xs py-3 pl-5">{faq.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Account, Subscription & Support */}
        <div className="flex-1 min-w-[300px] space-y-4">
          <h2 className="text-3xl font-semibold text-slate-700 mb-8">Account, Subscription & Support</h2>

          <div className="space-y-1">
            {rightColumnFaqs.map((faq, index) => (
              <div key={index}>
                <HoverCard isActive={index === 0 ? true : false}>
                  <div
                    className="flex items-center justify-between p-3 border border-gray-800 cursor-pointer"
                    onClick={() => toggleAccordionright(index)}
                  >
                    <h3 className="text-sm font-semibold text-gray-800">{faq.title}</h3>
                    {openAccordionsright.includes(index) ? (
                      <ArrowDownRight className="h-5 w-5 text-blue-600 transition-transform duration-200 scale-x-[-1]" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-gray-600 transition-transform duration-200" />
                    )}
                  </div>
                </HoverCard>
                <div
                  className={`my-3 text-gray-500 overflow-hidden transition-all duration-300 ${
                    openAccordionsright.includes(index) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-xs py-3 pl-5">{faq.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

