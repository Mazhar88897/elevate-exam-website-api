"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { MessageSquare } from "lucide-react"
import { toast } from "react-hot-toast"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

// ===== Context =====
interface SupportModalContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const SupportModalContext = createContext<SupportModalContextType | undefined>(undefined)

// ===== Provider Component =====
export const SupportModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <SupportModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
      <SupportModal />
    </SupportModalContext.Provider>
  )
}

// ===== Hook =====
export const useSupportModal = () => {
  const context = useContext(SupportModalContext)
  if (context === undefined) {
    throw new Error("useSupportModal must be used within a SupportModalProvider")
  }
  return {
    openSupportModal: context.openModal,
  }
}

// ===== Modal Component =====
export const SupportModal = () => {
  const { isOpen, closeModal } = useContext(SupportModalContext)!
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: sessionStorage.getItem('name') || "",
    email: sessionStorage.getItem('email') || "",
    subject: "",
    message: "",
    topic: "technical",
  })

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/help_center/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to send message. Please try again.")
      }

      toast.success("Message sent successfully! Our support team will get back to you within 24 hours.")

      setFormData({
        name: sessionStorage.getItem('name') || "",
        email: sessionStorage.getItem('email') || "",
        subject: "",
        message: "",
        topic: "technical",
      })

      closeModal()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div  className="m-4">
        <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className=" sm: max-w-[500px]">
        
        
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-xcolor" strokeWidth={2.5}/>
              Contact Support
            </CardTitle>
            <CardDescription className="text-xs">Fill out the form below to report an issue or get help with your account</CardDescription>
          </CardHeader>
          <CardContent className="px-0 text-xs pb-0">
          
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* <div className="space-y-1 text-xs">
                  <Label className="text-xs" htmlFor="name">Full Name</Label>
                  <Input
                    className="text-xs"
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div> */}

                {/* <div className="space-y-1 text-xs">
                  <Label className="text-xs" htmlFor="email">Your Email</Label>
                  <Input
                    className="text-xs"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div> */}

                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="topic">Topic</Label>
                  <Select
                    value={formData.topic}
                    onValueChange={(value) =>
                      setFormData(prev => ({
                        ...prev,
                        topic: value,
                      }))
                    }
                  >
                    <SelectTrigger id="topic">
                      <SelectValue className="text-xs" placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="text-xs" value="technical">Technical Issue</SelectItem>
                      <SelectItem className="text-xs" value="course">Course Content</SelectItem>
                      <SelectItem className="text-xs" value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="subject">Subject</Label>
                  <Input
                    className="text-xs"
                    id="subject"
                    name="subject"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Please describe your issue in detail"
                    className=" text-xs min-h-[150px]"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full rounded-md bg-xcolor hover:bg-xcolor/90"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </form>
        
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
    </div>
    
  )
}
