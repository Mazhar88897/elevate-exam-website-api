"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"

interface LeaveReplyProps {
  blogId: number
}

const fieldClass =
  "w-full border border-black bg-white px-3 py-2.5 font-display text-sm text-black outline-none placeholder:text-neutral-400"

const labelClass =
  "mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400"

export default function LeaveReply({ blogId }: LeaveReplyProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.comment.trim()
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/blog_replies/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blog: blogId.toString(),
            name: formData.name,
            email: formData.email,
            comment: formData.comment,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to submit reply")
      }

      toast.success("Reply submitted successfully!")
      setFormData({
        name: "",
        email: "",
        comment: "",
      })
    } catch (error) {
      console.error("Error submitting reply:", error)
      toast.error("Failed to submit reply. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-16 border-t border-black pt-12">
      <h2 className="font-display text-2xl font-bold tracking-tight text-black">
        Leave a reply
      </h2>
      <p className="mt-2 text-sm text-neutral-500">
        Your email address will not be published. Required fields are marked{" "}
        <span className="text-black">*</span>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="comment" className={labelClass}>
            Comment *
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={6}
            required
            value={formData.comment}
            onChange={handleInputChange}
            className={`${fieldClass} resize-y`}
          />
        </div>

        <div>
          <label htmlFor="name" className={labelClass}>
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className={fieldClass}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Send message"
          )}
        </button>
      </form>
    </div>
  )
}
