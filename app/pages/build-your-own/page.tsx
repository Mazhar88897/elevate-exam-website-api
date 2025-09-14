"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Flag } from "lucide-react"

interface QuestionSection {
  id: string
  title: string
  description: string
  enabled: boolean
}

export default function BuildQuiz() {
  const [flaggedQuestions, setFlaggedQuestions] = useState<QuestionSection[]>([
    {
      id: "flagged-1",
      title: "Flagged Questions",
      description:
        "But make this panel take up the entire length of the dashboard. But make this panel take up the entire length of the dashboard.But make this panel take up the entire length of the dashboard.",
      enabled: false,
    },
    {
      id: "flagged-2",
      title: "Flagged Questions",
      description:
        "But make this panel take up the entire length of the dashboard. But make this panel take up the entire length of the dashboard.But make this panel take up the entire length of the dashboard.",
      enabled: false,
    },
    {
      id: "flagged-3",
      title: "Flagged Questions",
      description:
        "But make this panel take up the entire length of the dashboard. But make this panel take up the entire length of the dashboard.But make this panel take up the entire length of the dashboard.",
      enabled: false,
    },
  ])

  const [quantitySection, setQuantitySection] = useState({
    enabled: false,
    value: "50",
  })

  const toggleFlaggedQuestion = (id: string) => {
    setFlaggedQuestions(
      flaggedQuestions.map((question) => (question.id === id ? { ...question, enabled: !question.enabled } : question)),
    )
  }

  const toggleQuantitySection = () => {
    setQuantitySection({
      ...quantitySection,
      enabled: !quantitySection.enabled,
    })
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantitySection({
      ...quantitySection,
      value: e.target.value,
    })
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Build your own quiz</h2>
          <Button className="bg-indigo-600 hover:bg-indigo-700">Start Quiz</Button>
        </div>

        <div className="mb-6">
          <h3 className="text-base font-medium mb-3">Questions</h3>
          <div className="space-y-3">
            {flaggedQuestions.map((question) => (
              <div
                key={question.id}
                className={`border rounded-md p-4 bg-white ${
                  question.enabled ? "border-2 border-black" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div className="flex items-center justify-center w-6 h-6 border border-gray-300 rounded">
                        <Flag className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{question.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 pr-8">{question.description}</p>
                    </div>
                  </div>
                  <Switch checked={question.enabled} onCheckedChange={() => toggleFlaggedQuestion(question.id)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium mb-3">Quantity</h3>
          <div
            className={`border rounded-md p-4 bg-white ${
              quantitySection.enabled ? "border-2 border-amber-500" : "border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div className="flex items-center justify-center w-6 h-6 border border-gray-300 rounded">
                    <Flag className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Quantity of questions</h3>
                  <p className="text-xs text-gray-500 mt-1 pr-8">
                    But make this panel take up the entire length of the dashboard. But make this panel take up the
                    entire length of the dashboard.But make this panel take up the entire length of the dashboard.
                  </p>
                </div>
              </div>
              <Switch checked={quantitySection.enabled} onCheckedChange={toggleQuantitySection} />
            </div>

            <div className="pl-9">
              <div className="mb-1 text-sm">Value</div>
              <Input
                type="text"
                value={quantitySection.value}
                onChange={handleQuantityChange}
                className="max-w-[200px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
