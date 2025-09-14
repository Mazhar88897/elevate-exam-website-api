"use client"

import { Card } from "@/components/ui/card"

export default function TutorialPage() {
  return (
    <div className="container mx-auto px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Getting Started with Elevate Exams</h1>
          <p className="text-muted-foreground">Learn how to make the most of your learning experience</p>
        </div>

        {/* Video Container */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative pb-[56.25%] h-0">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/25cpx_ThZhg"
              title="Tutorial Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </Card>

        {/* Content */}
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Welcome to Elevate Exams</h2>
            <p className="text-muted-foreground leading-relaxed">
              Elevate Exams is your comprehensive platform for exam preparation and learning. Our platform combines
              interactive flashcards, practice tests, and detailed analytics to help you achieve your learning goals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Key Features</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">Interactive Flashcards</h3>
                <p className="text-muted-foreground">
                  Create and study with interactive flashcards that adapt to your learning pace.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">Practice Tests</h3>
                <p className="text-muted-foreground">
                  Take practice tests to assess your knowledge and identify areas for improvement.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">Progress Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor your progress with detailed analytics and performance metrics.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">AI-Powered Learning</h3>
                <p className="text-muted-foreground">
                  Get personalized recommendations and assistance from our AI learning assistant.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Getting Started</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                To begin your learning journey:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Browse and select your course from the available options</li>
                <li>Start with the flashcards to build your foundation</li>
                <li>Take practice tests to assess your understanding</li>
                <li>Review your performance and focus on areas that need improvement</li>
                <li>Use the AI assistant for personalized help and guidance</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
