"use client"
import Navbar from "@/components/screens/Navbar"
import Hero from "@/components/screens/hero"
import Footer from "@/components/screens/Footer"
import Courses from "@/components/screens/courses"
import StripSlider from "@/components/screens/StripSlider"
import Features from "@/components/screens/Features"
import HowItWorks from "@/components/screens/HowItWorks"
import Testimonials from "@/components/screens/Testimonials"
import BlogSection from "@/components/screens/BlogSection"

export default function Home() {
  return (
    <main className="bg-white">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      <Hero />

      <div className="mt-[80px]">
        <StripSlider />
      </div>

      <div id="courses">
        <Courses />
      </div>

      <div id="features" className="scroll-mt-24">
        <Features />
      </div>

      <HowItWorks />

      <Testimonials />

      <div id="blog">
        <BlogSection />
      </div>

      <Footer />
    </main>
  )
}
