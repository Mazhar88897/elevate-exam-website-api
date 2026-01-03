"use client"

import { useState } from "react"
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CustomButton } from "@/components/pages/CustomButton"
import { Highlight } from "@/components/pages/Highlight"
import { HoverCard } from "@/components/pages/HoverCard"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-hot-toast"

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200, "Subject cannot exceed 200 characters"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message cannot exceed 1000 characters"),
  topic: z.string().optional()
})

type ContactFormData = z.infer<typeof contactFormSchema>

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema)
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    
    try {
     
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/help_center/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          topic: 'contact'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      toast.success('Message sent successfully! We\'ll get back to you soon.')
      reset()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try Stable Connection.')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="w-full   px-8 py-12 mt-8">
        <div className="max-w-5xl mx-auto ">
      <div className="flex max-w-6xl flex-col-reverse md:flex-row gap-8 lg:gap-16">
        {/* Left Section - Contact Form */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-black mb-3">Leave A Message</h2>
          <p className="text-slate-500 text-sm mb-6">
          Have a question or need help? Leave us a message and we’ll get back to you as soon as possible.
   </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  {...register("name")}
                  type="text" 
                  placeholder="Your Name" 
                  className={`flex-1 border-[1px] border-black text-sm ${errors.name ? 'border-red-500' : ''}`} 
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>
              <div className="flex-1">
                <Input 
                  {...register("email")}
                  type="email" 
                  placeholder="Your Email" 
                  className={`flex-1 border-[1px] border-black text-sm ${errors.email ? 'border-red-500' : ''}`} 
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Input 
                {...register("subject")}
                type="text" 
                placeholder="Subject" 
                className={`w-full border-[1px] border-black text-sm ${errors.subject ? 'border-red-500' : ''}`} 
              />
              {errors.subject && (
                <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <Textarea 
                {...register("message")}
                placeholder="Message" 
                className={`w-full min-h-[160px] border-[1px] border-black text-sm ${errors.message ? 'border-red-500' : ''}`} 
              />
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
              )}
            </div>

            <CustomButton 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-sm font-medium">Sending...</p>
                </div>
              ) : (
                <p className="text-sm font-medium">Send Message</p>
              )}
            </CustomButton>
           
          </form>
        </div>

        {/* Right Section - Contact Information */}
        <div className="flex-1">
          <h2 className="text-4xl font-bold text-slate-800 mb-3">
            Get In <Highlight>Touch</Highlight>
          </h2>
          <p className="text-slate-500 text-sm mb-8">
          Get in touch with us—we’re happy to help and answer any questions you may have. 
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <HoverCard>
              <div className="flex items-center justify-center w-9 h-9 border border-slate-200 rounded">
                <MapPin className="w-4 h-4 text-slate-700" />
              </div>
                </HoverCard>  
              
              <div>
                <h3 className="text-md font-medium text-slate-800">Location</h3>
                <p className="text-slate-500 text-sm">Virtual location</p>
              </div>
            </div>

            {/* <div className="flex items-start gap-4">
            <HoverCard>
            <div className="flex items-center justify-center w-9 h-9 border border-slate-200 rounded">
                <Phone className="w-4 h-4 text-slate-700" />
              </div>
            </HoverCard>
             
              <div>
                <h3 className="text-md font-medium text-slate-800">Phone</h3>
                <p className="text-slate-500  text-sm">(+61) 8896-2220</p>
              </div>
            </div> */}

            <div className="flex items-start gap-4">
                <HoverCard>
                <div className="flex items-center justify-center w-9 h-9 border border-slate-200 rounded">
                <Mail className="w-4 h-4 text-slate-700" />
              </div>
                </HoverCard>
              
              <div>
                <h3 className="text-md font-medium text-slate-800">Email</h3>
                <p className="text-slate-500  text-sm">info@elvateexams.com</p>
              </div>
            </div>

            {/* <div className="flex items-start gap-4">
                <HoverCard>
                <div className="flex items-center justify-center w-9 h-9 border border-slate-200 rounded">
                <Clock className="w-4 h-4 text-slate-700" />
              </div>
                </HoverCard>
              
              <div>
                <h3 className="text-md font-medium text-slate-800">Opening Hours</h3>
                <p className="text-slate-500  text-sm">Everyday 09 AM - 07 PM</p>
              </div>
            </div> */}
          </div>

          <div className="mt-8 pt-3 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <p className="text-slate-800 font-medium">Social Media :</p>
              <div className="flex gap-2">
                <a href="#" className="flex items-center  justify-center w-8 h-8 bg-slate-800 text-white hover:bg-white hover:text-slate-800 hover:border-2 hover:border-slate-600 rounded">
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-8 h-8 border border-slate-300 text-slate-700 rounded"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-8 h-8 border border-slate-300 text-slate-700 rounded"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-8 h-8 border border-slate-300 text-slate-700 rounded"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

