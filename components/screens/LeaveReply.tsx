"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
// import { Checkbox } from "@/components/ui/checkbox"
import { CustomButton } from "@/components/pages/CustomButton"
import { toast } from "react-hot-toast"

interface LeaveReplyProps {
  blogId: number
}

export default function LeaveReply({ blogId }: LeaveReplyProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.comment.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/blog_replies/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blog: blogId.toString(),
          name: formData.name,
          email: formData.email,
          comment: formData.comment,    
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit reply')
      }

      toast.success("Reply submitted successfully!")
      setFormData({
        name: "",
        email: "",
        comment: "",
      })
    } catch (error) {
      console.error('Error submitting reply:', error)
      toast.error("Failed to submit reply. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 mb-16">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Leave a Reply</h2>
      <p className="text-slate-500 mb-4 text-sm">
        Your email address will not be published. Required fields are marked <span className="text-red-500">*</span>
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="comment" className="block mb-2 text-sm font-medium text-medium text-slate-700">
            Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={6}
            required
            value={formData.comment}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:none"
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-slate-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:none"
            />
        </div>
        
        <div className="mb-6">
          <label htmlFor="email" className="block mb-2 font-medium text-sm text-slate-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:none"
            />
        </div>
        
      
        
        {/* <div className="flex items-start mb-6">
          <div className="flex items-center h-5">
            <Checkbox id="save-info" />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="save-info" className="font-medium text-slate-600">
              Save my name, email, and website in this browser for the next time I comment.
            </label>
          </div>
        </div> */}
        
        <div className={isSubmitting ? "opacity-50 pointer-events-none" : ""}>
          <CustomButton>
              <p className="text-sm text-semibold">
                {isSubmitting ? "Submitting..." : "Send Message"}
              </p>
          </CustomButton>
        </div>
      </form>
    </div>
  )
}
