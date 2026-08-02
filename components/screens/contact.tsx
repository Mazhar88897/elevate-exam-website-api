"use client"

import { useState } from "react"
import {
  Facebook,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  Twitter,
  Youtube,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject cannot exceed 200 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message cannot exceed 1000 characters"),
  topic: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactFormSchema>

const fieldClass =
  "w-full border border-black bg-white px-3 py-2.5 font-display text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-black"

const labelClass =
  "mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400"

const socialLinks = [
  { href: "#", label: "Facebook", icon: Facebook },
  { href: "#", label: "Twitter", icon: Twitter },
  { href: "#", label: "Instagram", icon: Instagram },
  { href: "#", label: "YouTube", icon: Youtube },
]

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/help_center/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            topic: "contact",
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      toast.success("Message sent successfully! We'll get back to you soon.")
      reset()
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white text-black">
      <div className="mx-auto max-w-5xl px-6 py-14 lg:px-10 lg:py-16">
        <header className="border-b border-black pb-8">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Get in touch
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Contact us
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
            Have a question about All Access, teams, or the platform? Leave a
            message and we&apos;ll reply as soon as we can.
          </p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          <section className="border border-black lg:col-span-3">
            <div className="border-b border-black bg-[#FDF2F7] px-5 py-4">
              <h2 className="font-display text-lg font-bold text-black">
                Leave a message
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Tell us how we can help — we typically reply within 24 hours.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 px-5 py-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Your name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className={cn(fieldClass, errors.name && "border-red-500")}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Your email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={cn(fieldClass, errors.email && "border-red-500")}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="subject" className={labelClass}>
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Brief description of your question"
                  className={cn(fieldClass, errors.subject && "border-red-500")}
                  {...register("subject")}
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className={labelClass}>
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="Please describe your question in detail"
                  className={cn(
                    fieldClass,
                    "min-h-[160px] resize-y",
                    errors.message && "border-red-500"
                  )}
                  {...register("message")}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
              >
                {isSubmitting ? (
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
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
                    strokeWidth={1.75}
                  />
                  <div>
                    <p className="font-display text-sm font-semibold text-black">
                      Location
                    </p>
                    <p className="mt-0.5 text-sm text-neutral-600">
                      Virtual — we work remotely
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail
                    className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
                    strokeWidth={1.75}
                  />
                  <div>
                    <p className="font-display text-sm font-semibold text-black">
                      Email
                    </p>
                    <a
                      href="mailto:info@elevateexams.com"
                      className="mt-0.5 text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-2 transition-colors hover:text-black hover:decoration-black"
                    >
                      info@elevateexams.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-black bg-[#FDF2F7] px-5 py-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Social
              </p>
              <p className="mt-2 font-display text-sm font-semibold text-black">
                Follow ElevateExams
              </p>
              <div className="mt-4 flex gap-2">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center border border-black bg-white text-black transition-colors hover:bg-black hover:text-white"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
