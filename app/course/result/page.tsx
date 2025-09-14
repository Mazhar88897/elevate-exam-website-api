"use client"

import React from 'react'


import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, ArrowLeft } from "lucide-react"
import  {BarChart2} from "lucide-react"
import Link from "next/link"


export default function MockAssessmentPage() {
  // State to track which view is currently showing
  const [currentView, setCurrentView] = useState("main")
  // State to track which result is being viewed (if any)
  const [resultId, setResultId] = useState<string | null>(null)

  // Function to handle viewing a result
  const handleViewResult = (id: string) => {
    setResultId(id)
    setCurrentView("result")
  }

  // Function to go back to main view
  const handleBack = () => {
    setCurrentView("main")
    setResultId(null)
  }

  // Main view content
 return ( <div className="container max-w-4xl p-6 mx-0  sm:mx-auto py-8 mt-8 sm:mt-0 ">
  <div className="">
  <div className="flex justify-between  items-center mb-12">
    <div className="flex items-center gap-3">
      <BarChart2 className="h-6 font-bold w-6" strokeWidth={3} />
      <div>
        <h1 className="text-md font-black">Stats Of Quiz & Assessment</h1>
        <p className="text-sm text-muted-foreground">Stats summary and 
insight highlights</p>
      </div>
    </div>
   
  </div>

  <div className="space-y-4 mb-8 mt-20 ">
    <div className="flex justify-between items-center">
    < Link href="/course/result/stats" className="w-full border-slate-800 dark:border-slate-300 dark:text-slate-300 max-w-xs md:max-w-md rounded-mid hover:cursor-pointer p-3 border text-center text-slate-800 dark:text-slate-300 text-sm font-bold" onClick={()=>{}}>Quiz Stats</Link>
   
    </div>

    <div className="flex justify-between items-center">
    < Link href="/course/result/stats" className="w-full border-slate-800 dark:border-slate-300 dark:text-slate-300 max-w-xs md:max-w-md rounded-mid hover:cursor-pointer p-3 border text-center text-slate-800 dark:text-slate-300 text-sm font-bold" onClick={()=>{}}>Assessment Stats</Link>
      
    </div>

    
  </div>

  <div className="space-y-4 text-sm font-semibold text-slate-800 dark:text-slate-300">
    <p>Each figure represents an important aspect of our operations, helping you quickly assess outcomes, identify patterns, and stay informed about ongoing progress.</p>
    <p>
    These stats provide valuable insights into how we&apos;re progressing and where opportunities for improvement lie.
    </p>
    <p className="font-medium text-slate-400 dark:text-slate-300">Warning: You will NOT see these stats if exams are not attempted.</p>
  </div>
  </div>
</div>)
  
}
  
