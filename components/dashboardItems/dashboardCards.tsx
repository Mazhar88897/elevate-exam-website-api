"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Lock, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const API_PATH = "/api/courses-with-details"

export interface SubscriptionStatusPayload {
  status: string
  is_active: boolean
  plan_interval: string
  cancel_at_period_end: boolean
  current_period_start: string
  current_period_end: string
}

export interface CourseItem {
  id: number
  name: string
  type: string
  level: string
  provider: string
  section: string
  about_primary: string
  total_questions: number
  total_chapters: number
  created_at: string
  updated_at: string
}

interface DomainGroup {
  id: number
  name: string
  courses: CourseItem[]
}

function shortCode(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9\s]/g, " ").trim()
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 6).toUpperCase()
  return parts
    .slice(0, 3)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}

function CourseCard({
  course,
  hasAccess,
}: {
  course: CourseItem
  hasAccess: boolean
}) {
  const router = useRouter()
  const code = shortCode(course.name)

  const openCourse = () => {
    sessionStorage.setItem("course_id", course.id.toString())
    sessionStorage.setItem("course_name", course.name)
    router.push("/dashboard/single-course")
  }

  return (
    <article
      className={cn(
        "flex h-full flex-col border border-neutral-300 bg-white",
        !hasAccess && "overflow-hidden"
      )}
    >
      <div
        className={cn(
          "relative border-b border-neutral-200 px-4 py-5",
          !hasAccess && "bg-[#F7F5F5]"
        )}
        style={
          !hasAccess
            ? {
                backgroundImage:
                  "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(0,0,0,0.04) 8px, rgba(0,0,0,0.04) 9px)",
              }
            : undefined
        }
      >
        <span className="inline-block bg-[#F5C6C6] px-2 py-0.5 text-[10px] font-bold tracking-wide text-black">
          {code}
        </span>
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border border-neutral-300 bg-white">
          {hasAccess ? (
            <Shield className="h-3.5 w-3.5 text-neutral-600" />
          ) : (
            <Lock className="h-3.5 w-3.5 text-[#E8A0A0]" />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-4">
        <h3 className="font-display text-base font-bold tracking-tight text-black">
          {course.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500">
          {course.about_primary || course.provider || "Certification prep"}
        </p>
        <p className="mt-3 text-[11px] text-neutral-500">
          {course.total_questions}+ questions · {course.total_chapters} domains
        </p>

        <div className="mt-auto pt-4">
          {hasAccess ? (
            <button
              type="button"
              onClick={openCourse}
              className="inline-flex w-full items-center justify-center gap-1.5 border border-black bg-white px-3 py-2 text-xs font-medium text-black transition-colors hover:bg-neutral-50"
            >
              Continue learning
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <Link
              href="/payment/plan"
              className="inline-flex w-full items-center justify-center gap-1.5 bg-black px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Unlock with All Access
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

export default function DashboardCards({
  hasAccess = false,
}: {
  hasAccess?: boolean
}) {
  const [domains, setDomains] = useState<DomainGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_PATH)
      if (!res.ok) throw new Error("Could not load courses")
      const data: DomainGroup[] = await res.json()
      setDomains(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
      setDomains([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    let cancelled = false
    const fetchSubscriptionStatus = async () => {
      if (typeof window === "undefined") return
      const auth = sessionStorage.getItem("Authorization")
      if (!auth) return
      const base = process.env.NEXT_PUBLIC_BASE_URL
      if (!base) return
      try {
        const res = await fetch(`${base}/api/subscription/status/`, {
          method: "GET",
          headers: {
            Authorization: auth,
            "Content-Type": "application/json",
          },
        })
        if (cancelled || !res.ok) return
        const data: SubscriptionStatusPayload = await res.json()
        sessionStorage.setItem("subscription_data", JSON.stringify(data))
        sessionStorage.setItem("subscription_status", data.status)
      } catch {
        // non-blocking
      }
    }
    void fetchSubscriptionStatus()
    return () => {
      cancelled = true
    }
  }, [])

  const visibleDomains = useMemo(
    () => domains.filter((d) => (d.courses ?? []).length > 0),
    [domains]
  )

  if (loading) {
    return (
      <div className="space-y-10">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            <div className="mb-4 h-6 w-40 animate-pulse bg-neutral-100" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((__, j) => (
                <div
                  key={j}
                  className="h-[240px] animate-pulse border border-neutral-200 bg-neutral-50"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {error}
      </p>
    )
  }

  if (visibleDomains.length === 0) {
    return (
      <p className="text-sm text-neutral-500">No courses available yet.</p>
    )
  }

  return (
    <div className="space-y-12">
      {visibleDomains.map((domain) => (
        <section key={domain.id}>
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4 text-neutral-500" />
            <h2 className="font-display text-lg font-bold tracking-tight text-black">
              {domain.name}{" "}
              <span className="font-medium text-neutral-400">
                {domain.courses.length} course
                {domain.courses.length === 1 ? "" : "s"}
              </span>
            </h2>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {domain.courses.map((course) => (
              <li key={course.id}>
                <CourseCard course={course} hasAccess={hasAccess} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
