"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-hot-toast"

import { CustomButton } from "@/components/pages/CustomButton"
// import { Highlight } from "@/components/pages/Highlight"
// Logo Component

// import type React from "react"
import { cn } from "@/lib/utils"

// Newsletter form validation schema
const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address")
})

type NewsletterFormData = z.infer<typeof newsletterSchema>

interface HighlightProps {
  children: React.ReactNode
  className?: string
  color?: string
}

export function Highlight({ children, className, color = "bg-yellow-300" }: HighlightProps) {
  return (
    <span className={cn("relative inline-block", className)}>
      {/* The text content */}
      <span className="relative z-10">{children}</span>

      {/* The highlight background */}
      <span
        className={cn("absolute inset-0 -z-0 rounded-lg", color)}
        style={{
            bottom: "-0.05em", // Moves it slightly lower
            top: "0.5em", // Reduces the height from the top
            left: "-0.1em", // Brings highlight closer to text
            right: "-0.1em", // Same as left for balance
        }}
      ></span>
    </span>
  )
}


function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 text-black text-4xl font-bold">
     
      <Highlight> Elevate Exams</Highlight>
    </Link>
  )
}

// Social Icons Component
interface SocialIconProps {
  href: string
  icon: React.ReactNode
  label: string
}

function SocialIcon({ href, icon, label }: SocialIconProps) {
  return (
    <Link href={href} aria-label={label} className="text-xcolor hover:text-white transition-colors">
      {icon}
    </Link>
  )
}

function SocialIcons() {
  return (
    <div className="flex space-x-4 mt-4">
      <SocialIcon href="https://facebook.com" icon={<Facebook size={20} />} label="Facebook" />
      <SocialIcon href="https://twitter.com" icon={<Twitter size={20} />} label="Twitter" />
      <SocialIcon href="https://instagram.com" icon={<Instagram size={20} />} label="Instagram" />
      <SocialIcon href="https://youtube.com" icon={<Youtube size={20} />} label="YouTube" />
    </div>
  )
}

// Footer Links Component
interface FooterLinksProps {
  title: string
  links: {
    label: string
    href: string
  }[]
}

function FooterLinks({ title, links }: FooterLinksProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Newsletter Form Component
function NewsletterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema)
  })

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/newsletter_subscriptions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          toast.error('This email is already subscribed to our newsletter!')
        } else {
          throw new Error(result.error || 'Failed to subscribe')
        }
        return
      }

      toast.success('Successfully subscribed to our newsletter!')
      reset()
    } catch (error) {
      console.error('Error subscribing to newsletter:', error)
      toast.success('Newsletter Already Subscribed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <input
          {...register("email")}
          type="email"
          placeholder="Your Email"
          className={`px-4 py-3 rounded-md text-sm w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500 ring-red-500' : ''}`}
        />
        {errors.email && (
          <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>
      <CustomButton 
        type="submit" 
        variant="primary" 
        className="whitespace-nowrap" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Subscribing...</span>
          </div>
        ) : (
          'Subscribe'
        )}
      </CustomButton>
    </form>
  )
}

// Data for footer links
const languagesLinks = [
  
  { label: "IT & Cybersecurity", href: "/main/courses" },
  { label: "Project Management", href: "/" },
  { label: "Finance", href: "/main/courses" },
  { label: "Risk", href: "/main/courses" },
  { label: "Data Protection", href: "/main/courses" },
  { label: "Citizenship", href: "/main/courses" },
  { label: "Marketing", href: "/main/courses" },
  { label: "HR", href: "/main/courses" },
 
]


const aboutLinks = [
  { label: "About Us", href: "/main/about" },
  { label: "How It Works", href: "/main/platform" },



]

const supportLinks = [
  { label: "FAQs", href: "/main/faq" },
  { label: "Privacy Policy", href: "/main/privacy-policy" },
  { label: "Terms & Conditions", href: "/main/terms" },
  { label: "Pricing", href: "/main/pricing" },
  { label: "Contact Us", href: "/main/contact" },
]

// Main Footer Component
export default function Footer() {
  return (
    <footer className="bg-[#0e1525] px-3 lg:px-8  text-slate-700">
      {/* Newsletter Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">Join Our Newsletter</h2>
            <p className="text-gray-400 max-w-md">
            Join our newsletter for updates, tips, and the latest news.
            </p>
          </div>
          <div className="flex sm:justify-start lg:justify-end w-full ">
            <NewsletterForm />
          </div>
        </div>

        <hr className="border-gray-800 my-12" />

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Logo />
            <p className="text-gray-400 mt-4">
            Join our community and follow us on social media.
            </p>
            <SocialIcons />
          </div>

          {/* Links Sections */}
          <FooterLinks title="Exam Prep Categorieses" links={languagesLinks} />
          {/* <FooterLinks title="Featured Programs" links={programsLinks} /> */}
          <FooterLinks title="About Us" links={aboutLinks} />
          <FooterLinks title="Support" links={supportLinks} />
        </div>

        <hr className="border-gray-800 my-12" />

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mt-2 text-gray-500">Elevate Exams</p>
          <p className="text-sm text-gray-500 mt-2 md:mt-0">Copyright © {new Date().getFullYear()}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

