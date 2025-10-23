"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, LucideArrowRight } from "lucide-react"
import { useWindowSize } from "@/hooks/use-window-size"
import CalendarSchedule from "@/components/dashboardItems/calender"
import Access from "@/components/dashboardItems/access"
import Link from "next/link"
import React from "react"
import Component from "@/components/dashboardItems/coursestabs"
interface Course {
    id: number;
    title: string;
    category: string;
    badge: string;
    progress: number;
    total: number;
  }
// Course data




export default function Dashboard() {

  return (
    <div className="min-h-screen ">

        <main className="px-4 md:px-6 pb-8 max-w-7xl mx-auto">
          <section>
            <Component />
          </section>
          
          <section>
            <div className="flex flex-col justify-between mb-4">
              <h2 className="text-lg font-bold mb-6">Calendar</h2>
              <CalendarSchedule />
            </div>
          </section>
        </main>
    </div>
  )
}


