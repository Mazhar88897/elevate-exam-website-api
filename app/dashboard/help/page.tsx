"use client"

import { useState } from "react"
import { Loader2, Mail, MessageSquare, Phone } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordioncustom"
import toast from "react-hot-toast"

const TOPIC_OPTIONS = [
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing Question" },
  { value: "account", label: "Account Help" },
  { value: "course", label: "Course Content" },
  { value: "other", label: "Other" },
] as const

const fieldClass =
  "w-full border border-black bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-black focus:ring-0"

const labelClass =
  "font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400"

export default function HelpPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    subject: "",
    topic: "technical",
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/help_center/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to send message. Please try again.")
      }

      toast.success(
        "Message sent successfully! Our support team will get back to you within 24 hours."
      )

      setFormData({
        name: "",
        email: "",
        message: "",
        subject: "",
        topic: "technical",
      })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "An error occurred. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 text-black lg:px-10">
      <header className="border-b border-black pb-8">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          Account
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Help & Support
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
          Report an issue, ask about billing, or get help with your account.
          We typically reply within 24 hours.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <section className="border border-black lg:col-span-3">
          <div className="border-b border-black bg-[#FDF2F7] px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-black">
              <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
              Contact support
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Fill out the form below and we&apos;ll get back to you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-5 py-6">
            <div className="space-y-2">
              <label htmlFor="name" className={labelClass}>
                Your name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className={labelClass}>
                Your email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="topic" className={labelClass}>
                Topic
              </label>
              <select
                id="topic"
                value={formData.topic}
                onChange={handleInputChange}
                className={`${fieldClass} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%23000%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
              >
                {TOPIC_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className={labelClass}>
                Subject
              </label>
              <input
                id="subject"
                type="text"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className={labelClass}>
                Message
              </label>
              <textarea
                id="message"
                placeholder="Please describe your issue in detail"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className={`${fieldClass} min-h-[150px] resize-y`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send message"
              )}
            </button>
          </form>
        </section>

        <aside className="space-y-8 lg:col-span-2">
          <div className="border border-black">
            <div className="border-b border-black px-5 py-4">
              <h2 className="font-display text-base font-bold text-black">
                Contact information
              </h2>
            </div>
            <div className="space-y-5 px-5 py-5">
              <div className="flex items-start gap-3">
                <Mail
                  className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
                  strokeWidth={1.75}
                />
                <div>
                  <p className="font-display text-sm font-semibold text-black">
                    Email support
                  </p>
                  <a
                    href="mailto:support@elevate.com"
                    className="mt-0.5 text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-2 transition-colors hover:text-black hover:decoration-black"
                  >
                    support@elevate.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone
                  className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
                  strokeWidth={1.75}
                />
                <div>
                  <p className="font-display text-sm font-semibold text-black">
                    Phone support
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-neutral-400">
                    Mon–Fri, 9AM–5PM EST
                  </p>
                  <a
                    href="tel:+18001234567"
                    className="mt-0.5 block text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-2 transition-colors hover:text-black hover:decoration-black"
                  >
                    +1 (800) 123-4567
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-black">
            <div className="border-b border-black px-5 py-4">
              <h2 className="font-display text-base font-bold text-black">
                Frequently asked questions
              </h2>
            </div>
            <div className="px-2 py-1">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-neutral-200">
                  <AccordionTrigger className="px-3 py-3 text-left font-display text-sm font-semibold text-black hover:no-underline hover:text-black">
                    How do I reset my password?
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-4 text-sm leading-relaxed text-neutral-600">
                    <p>To reset your password:</p>
                    <ol className="mt-2 list-decimal space-y-1 pl-5">
                      <li>
                        Click on the &quot;Forgot Password&quot; link on the
                        login page
                      </li>
                      <li>
                        Enter the email address associated with your account
                      </li>
                      <li>Check your email for a password reset link</li>
                      <li>
                        Click the link and follow the instructions to create a
                        new password
                      </li>
                    </ol>
                    <p className="mt-2">
                      If you don&apos;t receive the email within 5 minutes,
                      check your spam folder or contact support.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-neutral-200">
                  <AccordionTrigger className="px-3 py-3 text-left font-display text-sm font-semibold text-black hover:no-underline hover:text-black">
                    Where are my certificates?
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-4 text-sm leading-relaxed text-neutral-600">
                    <p>
                      You can find your course completion certificates in your
                      profile section:
                    </p>
                    <ol className="mt-2 list-decimal space-y-1 pl-5">
                      <li>Go to your account dashboard</li>
                      <li>
                        Click on &apos;My Profile&apos; in the navigation menu
                      </li>
                      <li>Select the &apos;Certificates&apos; tab</li>
                      <li>
                        Here you&apos;ll find all certificates for completed
                        courses
                      </li>
                    </ol>
                    <p className="mt-2">
                      Certificates are only issued for fully completed courses
                      with a passing grade of 70% or higher.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border-neutral-200">
                  <AccordionTrigger className="px-3 py-3 text-left font-display text-sm font-semibold text-black hover:no-underline hover:text-black">
                    How do I update my payment method?
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-4 text-sm leading-relaxed text-neutral-600">
                    <p>To update your payment method:</p>
                    <ol className="mt-2 list-decimal space-y-1 pl-5">
                      <li>Go to your account settings</li>
                      <li>Click on the &apos;Billing&apos; tab</li>
                      <li>
                        Under &apos;Payment Methods&apos;, click &apos;Edit&apos;
                        next to your current payment method
                      </li>
                      <li>
                        Enter your new payment details and click &quot;Save&quot;
                      </li>
                    </ol>
                    <p className="mt-2">
                      Changes to your payment method will apply to your next
                      billing cycle. If you have any issues, please contact our
                      billing department.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-4"
                  className="border-b-0 border-neutral-200"
                >
                  <AccordionTrigger className="px-3 py-3 text-left font-display text-sm font-semibold text-black hover:no-underline hover:text-black">
                    How do I track my course progress?
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-4 text-sm leading-relaxed text-neutral-600">
                    <p>
                      Your course progress is automatically tracked as you
                      complete lessons and quizzes:
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>
                        Progress bars on your dashboard show completion
                        percentage for each course
                      </li>
                      <li>
                        Within each course, you&apos;ll see checkmarks next to
                        completed lessons
                      </li>
                      <li>
                        The &apos;My Learning&apos; section provides detailed
                        progress reports
                      </li>
                    </ul>
                    <p className="mt-2">
                      Your progress is saved automatically, so you can always
                      pick up where you left off, even if you switch devices.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
