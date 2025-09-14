"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Flag } from "lucide-react"
import { ChevronRight } from "lucide-react"
interface Chapter {
  id: number
  title: string
  description: string
  enabled: boolean
}

export default function ChaptersSelection() {
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: 1,
      title: "Chapter 1",
      description:
        "But make this panel take up the entire length of the dashboard. But make this panel take up the entire length of the dashboard. But make this panel take up the entire length of the dashboard.",
      enabled: true,
    },
    {
      id: 2,
      title: "Chapter 2",
      description:
        "But make this panel take up the entire length of the dashboard. But make this panel take up the entire length of the dashboard. But make this panel take up the entire length of the dashboard.",
      enabled: false,
    },
    {
      id: 3,
      title: "Chapter 3",
      description:
        "But make this panel take up the entire length of the dashboard. But make this panel take up the entire length of the dashboard. But make this panel take up the entire length of the dashboard.",
      enabled: false,
    },
    {
      id: 5,
      title: "Chapter 5",
      description:
        "But make this panel take up the entire length of the dashboard. But make this panel take up the entire length of the dashboard. But make this panel take up the entire length of the dashboard.",
      enabled: false,
    },
  ])

  const toggleChapter = (id: number) => {
    setChapters(chapters.map((chapter) => (chapter.id === id ? { ...chapter, enabled: !chapter.enabled } : chapter)))
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black">Chapters</h2>
          <div className="bg-[#5834BD] flex items-center justify-center  py-[0.45rem] text-center font-bold text-xs text-white rounded-mid w-28 hover:bg-purple-700" onClick={() => {}}>
          <p>Next</p> <ChevronRight className="h-4 w-4 font-black text-white" />
        </div>   </div>

        <div className="mb-4">
          <p className="text-sm text-slate-800 font-bold mb-2">select</p>
        </div>

        <div className="space-y-3">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className={`rounded-mid p-4 bg-white ${
                chapter.enabled ? "border-2 border-[#D45CBA]" : "border border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div className="flex items-center justify-center w-6 h-6  rounded">
                      <Flag className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{chapter.title}</h3>
                    <p className="text-xs text-gray-500 font-semibold mt-1 pr-8">{chapter.description}</p>
                  </div>
                </div>
                <Switch checked={chapter.enabled} onCheckedChange={() => toggleChapter(chapter.id)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
