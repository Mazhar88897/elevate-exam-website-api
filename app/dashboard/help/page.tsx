"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, HelpCircle, Mail, MessageSquare, Phone } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordioncustom"

export default function HelpPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // Simulate form submission
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen ">
      <header className="flex items-center justify-between p-4 md:p-6">
        <h1 className="text-lg px-10  md:px-2  font-bold">Help & Support</h1>
        {/* <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white">J</div>
          <span className="hidden md:inline text-sm text-gray-600">John Drew</span>
        </div> */}
      </header>

      <main className="px-4 md:px-6 pb-8 max-w-4xl mx-auto">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Contact Form */}
          <div className="md:col-span-2">
          <Card className="">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#ffd404]" />
                Contact Support 
              </CardTitle>
              <CardDescription>
                Fill out the form below to report an issue or get help with your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Message Sent!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Thank you for reaching out. Our support team will get back to you within 24 hours.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Your Email</Label>
                    <Input id="email" type="email"  placeholder="mk0906145@gmail.com" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Select defaultValue="technical">
                      <SelectTrigger id="topic">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="account">Account Help</SelectItem>
                        <SelectItem value="course">Course Content</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Brief description of your issue" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your issue in detail"
                      className="min-h-[150px]"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="w-full rounded-midborder-grey-300" disabled={loading}>
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
          </div>
         

          {/* Help Resources */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#185abd] dark:text-[#ffd404]  mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Email Support</p>
                    <a href="mailto:support@.com" className="text-sm text-[#185abd] dark:text-[#ffd404]  hover:underline">
                      support@elevate.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-[#185abd] dark:text-[#ffd404]  mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Phone Support</p>
                    <p className="text-sm">Mon-Fri, 9AM-5PM EST</p>
                    <a href="tel:+18001234567" className="text-sm text-[#185abd] dark:text-[#ffd404]  hover:underline">
                      +1 (800) 123-4567
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>   
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xs   hover:text-[#ffd404]/90 font-medium">How do I reset my password?</AccordionTrigger>
                    <AccordionContent className="text-xs text-gray-600">
                      <p>To reset your password:</p>
                      <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li>Click on the &quot;Forgot Password&quot; link on the login page</li>

                        <li>Enter the email address associated with your account</li>
                        <li>Check your email for a password reset link</li>
                        <li>Click the link and follow the instructions to create a new password</li>
                      </ol>
                      <p className="mt-2">
                      <p>If you don&apos;t receive the email within 5 minutes, check your spam folder or contact support.</p>

                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-xs  hover:text-[#ffd404]/90 font-medium">Where are my certificates?</AccordionTrigger>
                    <AccordionContent className="text-xs text-gray-600">
                      <p>You can find your course completion certificates in your profile section:</p>
                      <ol className="list-decimal pl-5 mt-2 space-y-1">
                        <li>Go to your account dashboard</li>
                        <li>Click on &apos;My Profile&apos; in the navigation menu</li>
                        <li>Select the &apos;Certificates&apos; tab</li>
                        <li>Here you&apos;ll find all certificates for completed courses</li>
                      </ol>
                      <p className="mt-2">
                        Certificates are only issued for fully completed courses with a passing grade of 70% or higher.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-xs  hover:text-[#ffd404]/90 font-medium">
                      How do I update my payment method?
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-gray-600">
                      <p>To update your payment method:</p>
                      <ol className="list-decimal pl-5 mt-2 space-y-1">
                        <li>Go to your account settings</li>
                        <li>Click on the &apos;Billing&apos; tab</li>
                        <li>Under &apos;Payment Methods&apos;,&apos;click&apos; &apos;Edit&apos; next to your current payment method</li>
                        <li>Enter your new payment details and click &quot;Save&quot;</li>

                      </ol>
                      <p className="mt-2">
                        Changes to your payment method will apply to your next billing cycle. If you have any issues,
                        please contact our billing department.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-xs  hover:text-[#ffd404]/90 font-medium">
                      How do I track my course progress?
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-gray-600">
                      <p>Your course progress is automatically tracked as you complete lessons and quizzes:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Progress bars on your dashboard show completion percentage for each course</li>
                        <li>Within each course, you&apos;ll see checkmarks next to completed lessons</li>
                        <li>The &apos;My Learning&apos; section provides detailed progress reports</li>
                      </ul>
                      <p className="mt-2">
                        Your progress is saved automatically, so you can always pick up where you left off, even if you
                        switch devices.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                 
                </Accordion>

                {/* <div className="mt-4">
                  <a href="#" className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:underline">
                    <HelpCircle className="h-4 w-4" />
                    View all FAQs
                  </a>
                </div> */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
