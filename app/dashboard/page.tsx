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

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import PaidComponent from "@/components/dashboardItems/paid"
import UnpaidComponent from "@/components/dashboardItems/unpaid"  
interface Course {
    id: number;
    title: string;
    category: string;
    badge: string;
    progress: number;
    total: number;
  }""
// Course data




export default function Dashboard() {

  return (
    <div className="min-h-screen ">

        <main className="px-4 md:px-6 pb-8 max-w-7xl mx-auto">
          <section>

            <Tabs defaultValue="paid" className="w-full">
          <TabsList className="bg-transparent border-b border-zinc-300 dark:border-zinc-800 mb-8 justify-start h-auto p-0">
            <TabsTrigger
              value="paid"
              className="relative px-4 py-3 text-sm font-medium data-[state=active]:font-bold text-gray-600 dark:text-gray-400 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-0.5 data-[state=active]:after:bg-xcolor rounded-none"
            >
                Paid Industries
            </TabsTrigger>
            <TabsTrigger
              value="unpaid"
              className="relative px-4 py-3 text-sm font-medium data-[state=active]:font-bold text-gray-600 dark:text-gray-400 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-0.5 data-[state=active]:after:bg-xcolor rounded-none"
            >
                  Unpaid Industries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paid">
          <PaidComponent /> 
          </TabsContent>
          
          <TabsContent value="unpaid">
          <UnpaidComponent />
          </TabsContent>
        </Tabs>
            {/* <Coponent /> */}
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


