"use client"

import React, { useEffect, useState } from "react"
import Access from "@/components/dashboardItems/access"
import DashboardCards from "@/components/dashboardItems/dashboardCards"
import CalendarSchedule from "@/components/dashboardItems/calender"
import {
  hasPaidAccessFromSession,
  storeSubscriptionStatus,
} from "@/lib/payment-access"

interface ApiCourse {
  total_questions?: number
}

interface ApiDomain {
  id: number
  name: string
  courses?: ApiCourse[]
}

function computeCatalogStats(domains: ApiDomain[]) {
  const totalDomains = domains.length
  let totalCourses = 0
  let totalQuestions = 0
  for (const d of domains) {
    const courses = d.courses ?? []
    totalCourses += courses.length
    for (const c of courses) {
      totalQuestions += c.total_questions ?? 0
    }
  }
  return { totalDomains, totalCourses, totalQuestions }
}

export default function Dashboard() {
  const [firstName, setFirstName] = useState("there")
  const [hasAccess, setHasAccess] = useState(false)
  const [stats, setStats] = useState({
    totalDomains: 0,
    totalCourses: 0,
    totalQuestions: 0,
  })

  useEffect(() => {
    if (sessionStorage.getItem("QuestionCountFree") === null) {
      sessionStorage.setItem("QuestionCountFree", "0")
    }

    const name = sessionStorage.getItem("name") || ""
    setFirstName(name.split(" ")[0] || "there")
    setHasAccess(hasPaidAccessFromSession())

    const auth = sessionStorage.getItem("Authorization")
    const base = process.env.NEXT_PUBLIC_BASE_URL

    const loadCatalogStats = () =>
      fetch("/api/courses-with-details")
        .then((res) => (res.ok ? res.json() : []))
        .then((domains) => {
          if (!Array.isArray(domains)) return
          setStats(computeCatalogStats(domains))
        })
        .catch(() => {})

    loadCatalogStats()

    if (!auth || !base) return

    fetch(`${base}/api/subscription/status/`, {
      method: "GET",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          sessionStorage.setItem("subscription_data", JSON.stringify(data))
          storeSubscriptionStatus(data.status || "")
        }
        setHasAccess(hasPaidAccessFromSession())
      })
      .catch(() => {
        setHasAccess(hasPaidAccessFromSession())
      })
  }, [])

  const statItems = [
    { label: "Total domains", value: String(stats.totalDomains) },
    { label: "Total courses", value: String(stats.totalCourses) },
    { label: "Total questions", value: String(stats.totalQuestions) },
  ]

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-10">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-block border border-neutral-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-600">
              Dashboard
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              Your courses and progress are below.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="min-w-[120px] border border-neutral-200 bg-white px-4 py-3 text-center"
              >
                <p className="font-display text-xl font-bold tabular-nums text-black">
                  {item.value}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Access hasAccess={hasAccess} />

        <DashboardCards hasAccess={hasAccess} />

        <div className="mt-14">
          <CalendarSchedule />
        </div>
      </main>
    </div>
  )
}
