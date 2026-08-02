"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpDown,
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Lock,
  Shield,
  Star,
} from "lucide-react"

interface CourseItem {
  id: number
  name: string
  type: string
  level: string
  provider: string
  section: string
  about_primary: string
  total_questions: number
  total_chapters: number
}

interface DomainGroup {
  id: number
  name: string
  courses: CourseItem[]
}

type CourseWithDomain = CourseItem & {
  domainName: string
  domainId: number
}

function ratingFor(id: number): number {
  return Math.round((4.6 + ((id * 17) % 40) / 100) * 10) / 10
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

function domainTags(course: CourseItem): { visible: string[]; more: number } {
  const candidates = [course.section, course.level, course.type, course.provider]
    .map((s) => s?.trim())
    .filter((s): s is string => Boolean(s) && s.toLowerCase() !== "n/a")

  const unique = Array.from(new Set(candidates))
  const visible = unique.slice(0, 2)
  const remainder = Math.max(0, course.total_chapters - visible.length)
  return { visible, more: remainder }
}

function DomainIcon({ name }: { name: string }) {
  const n = name.toLowerCase()
  if (n.includes("security") || n.includes("it ")) {
    return <Shield className="h-5 w-5 text-neutral-700" strokeWidth={2} />
  }
  if (n.includes("finance") || n.includes("account")) {
    return <Landmark className="h-5 w-5 text-neutral-700" strokeWidth={2} />
  }
  if (n.includes("citizen") || n.includes("uk")) {
    return <Briefcase className="h-5 w-5 text-neutral-700" strokeWidth={2} />
  }
  return <BookOpen className="h-5 w-5 text-neutral-700" strokeWidth={2} />
}

function CourseCard({ course }: { course: CourseWithDomain }) {
  const rating = ratingFor(course.id)
  const code = shortCode(course.name)
  const tags = domainTags(course)

  return (
    <article className="group flex h-full flex-col border border-black bg-white shadow-[3px_3px_0_0_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.16)]">
      <div className="relative h-[120px] border-b-[3px] border-black [perspective:1000px]">
        <div className="relative h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.4,0.2,0.2,1)] [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
          <div
            className="absolute inset-0 bg-[#F7F5F5] [backface-visibility:hidden]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(245,198,198,0.45) 8px, rgba(245,198,198,0.45) 9px)",
            }}
          >
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 bg-[#F5C6C6] px-2 py-0.5 text-[10px] font-bold tracking-wide text-black">
              {code}
            </span>
            <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border border-black bg-white">
              <Lock className="h-3.5 w-3.5 text-[#E8A0A0]" strokeWidth={2} />
            </div>
          </div>

          <div className="absolute inset-0 flex flex-col justify-center bg-black px-4 py-3 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <ul className="space-y-1.5 text-xs text-white">
              <li className="flex items-center gap-1.5">
                <Star className="h-3 w-3 fill-white" />
                {rating.toFixed(1)} average rating
              </li>
              <li className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 border border-white/80" />
                {course.total_questions}+ practice questions
              </li>
              <li className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 bg-white" />
                {course.total_chapters} domains covered
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3.5 py-3">
        <h3 className="font-display text-base font-bold tracking-tight text-black">
          {course.name}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-neutral-500">
          {course.about_primary || course.provider || course.domainName}
        </p>

        <div className="mt-2 flex items-center gap-1 text-[11px] text-neutral-600">
          <div className="flex items-center gap-0.5 text-black">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-2.5 w-2.5 ${
                  i < Math.round(rating) ? "fill-black text-black" : "text-neutral-300"
                }`}
              />
            ))}
          </div>
          <span className="tabular-nums">{rating.toFixed(1)}</span>
          <span className="text-neutral-400">·</span>
          <span>{course.total_questions}+ questions</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {tags.visible.map((tag) => (
            <span
              key={tag}
              className="border border-black px-1.5 py-0.5 text-[10px] font-medium text-neutral-800"
            >
              {tag}
            </span>
          ))}
          {tags.more > 0 && (
            <span className="border border-black px-1.5 py-0.5 text-[10px] font-medium text-neutral-800">
              +{tags.more} more
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="text-xs text-neutral-700">
            <span className="text-sm font-bold text-black">£19.99</span>
            <span className="text-neutral-500"> / yr</span>
          </p>
          <Link
            href="/payment/plan"
            className="inline-flex items-center gap-1 bg-black px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Buy
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </article>
  )
}

function AllAccessStrip({
  courseCount,
  domainNames,
  courseNames,
}: {
  courseCount: number
  domainNames: string[]
  courseNames: string[]
}) {
  const individual = (courseCount * 19.99).toFixed(2)
  const bundle = 79.99
  const save = (Number(individual) - bundle).toFixed(2)
  const domainsLabel = domainNames.slice(0, 3).join(", ")
  const listLabel =
    (courseNames.length
      ? courseNames.join(" · ")
      : "CISSP · CISM · CRISC · ACCA · CFA · CIM · Life in the UK") + " · One year access"

  return (
    <div className="flex flex-col gap-8 border border-[#F0D4DC] bg-[#FDF2F7] px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-10 lg:py-8">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A3D5C]">
          All access
        </p>
        <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-black sm:text-[1.35rem]">
          All Access — every course on the platform
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600">
          One purchase unlocks all {courseCount || 7} courses
          {domainsLabel ? ` across ${domainsLabel}` : ""}. Save £{save} versus buying
          individually.
        </p>
        <p className="mt-4 text-xs leading-relaxed text-neutral-400">{listLabel}</p>
      </div>

      <div className="flex shrink-0 flex-col items-start lg:items-end">
        <p className="text-sm text-neutral-400 line-through">
          £{individual} individually
        </p>
        <p className="mt-0.5 font-display text-4xl font-bold tracking-tight text-black sm:text-[2.75rem]">
          £{bundle.toFixed(2)}
        </p>
        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-neutral-500">
          Save £{save}
        </p>
        <Link
          href="/payment/plan"
          className="mt-4 inline-flex items-center gap-2 bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Get all access
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

export default function Courses() {
  const [domains, setDomains] = useState<DomainGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeDomain, setActiveDomain] = useState<"all" | number>("all")
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [scrollMetrics, setScrollMetrics] = useState({
    thumbWidth: 100,
    thumbLeft: 0,
  })
  const tabsRef = useRef<HTMLDivElement>(null)

  const updateScrollState = useCallback(() => {
    const el = tabsRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const overflow = scrollWidth > clientWidth + 2
    setCanScrollLeft(scrollLeft > 2)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2)
    if (!overflow) {
      setScrollMetrics({ thumbWidth: 100, thumbLeft: 0 })
      return
    }
    const thumbWidth = (clientWidth / scrollWidth) * 100
    const maxScroll = scrollWidth - clientWidth
    const thumbLeft = maxScroll > 0 ? (scrollLeft / maxScroll) * (100 - thumbWidth) : 0
    setScrollMetrics({ thumbWidth, thumbLeft })
  }, [])

  const scrollTabs = (dir: "left" | "right") => {
    const el = tabsRef.current
    if (!el) return
    el.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" })
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/courses-with-details")
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
    updateScrollState()
    const el = tabsRef.current
    if (!el) return
    const onScroll = () => updateScrollState()
    el.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", updateScrollState)
    return () => {
      el.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", updateScrollState)
    }
  }, [domains, updateScrollState])

  const visibleDomains = useMemo(() => {
    if (activeDomain === "all") return domains
    return domains.filter((d) => d.id === activeDomain)
  }, [domains, activeDomain])

  const allCourses = useMemo(
    () => domains.flatMap((d) => d.courses ?? []),
    [domains]
  )

  const courseNames = useMemo(
    () => allCourses.map((c) => c.name),
    [allCourses]
  )

  const domainNames = useMemo(
    () => domains.map((d) => d.name),
    [domains]
  )

  const showScrollControls = canScrollLeft || canScrollRight

  return (
    <section className="w-full bg-white py-10">
      {/* Full-width domain filter */}
      <div className="w-full border-b border-neutral-200 px-10">
        <div className="flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <div
              ref={tabsRef}
              className="domain-tabs flex items-center gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <button
                type="button"
                onClick={() => setActiveDomain("all")}
                className={`relative shrink-0 px-1 pb-3 pt-1 text-sm transition-colors ${
                  activeDomain === "all"
                    ? "font-bold text-black"
                    : "font-medium text-neutral-500 hover:text-black"
                }`}
              >
                All courses
                {activeDomain === "all" && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#F5C6C6]" />
                )}
              </button>

              {domains.map((domain) => (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => setActiveDomain(domain.id)}
                  className={`relative shrink-0 px-3 pb-3 pt-1 text-sm transition-colors sm:px-4 ${
                    activeDomain === domain.id
                      ? "font-bold text-black"
                      : "font-medium text-neutral-500 hover:text-black"
                  }`}
                >
                  {domain.name}
                  {activeDomain === domain.id && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#F5C6C6] sm:left-4 sm:right-4" />
                  )}
                </button>
              ))}
            </div>

            {showScrollControls && (
              <div className="mb-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollTabs("left")}
                  disabled={!canScrollLeft}
                  className="shrink-0 text-neutral-400 transition-colors hover:text-neutral-600 disabled:opacity-30"
                  aria-label="Scroll categories left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div
                  className="relative h-1.5 flex-1 cursor-pointer overflow-hidden rounded-sm bg-neutral-200"
                  onClick={(e) => {
                    const el = tabsRef.current
                    if (!el) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    const ratio = (e.clientX - rect.left) / rect.width
                    el.scrollTo({
                      left: ratio * (el.scrollWidth - el.clientWidth),
                      behavior: "smooth",
                    })
                  }}
                >
                  <div
                    className="absolute top-0 h-full rounded-sm bg-neutral-400 transition-[left] duration-75"
                    style={{
                      width: `${scrollMetrics.thumbWidth}%`,
                      left: `${scrollMetrics.thumbLeft}%`,
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => scrollTabs("right")}
                  disabled={!canScrollRight}
                  className="shrink-0 text-neutral-400 transition-colors hover:text-neutral-600 disabled:opacity-30"
                  aria-label="Scroll categories right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="mb-3 shrink-0 text-neutral-400 transition-colors hover:text-black"
            aria-label="Sort courses"
            title="Sort"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-2 lg:px-10">
        {loading && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[320px] animate-pulse border border-neutral-200 bg-neutral-50"
              />
            ))}
          </div>
        )}

        {error && (
          <p className="mt-10 text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && visibleDomains.length === 0 && (
          <p className="mt-10 text-center text-sm text-neutral-500">
            No courses available yet.
          </p>
        )}

        {!loading &&
          !error &&
          visibleDomains.map((domain, domainIndex) => {
            const courses = domain.courses ?? []
            const firstRow = courses.slice(0, 3)
            const rest = courses.slice(3)
            const insertStrip = domainIndex === 0 && firstRow.length > 0

            return (
              <div key={domain.id} className="mt-10">
                <div className="mb-6 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center border border-neutral-200 bg-[#FBF6F0]">
                    <DomainIcon name={domain.name} />
                  </span>
                  <h2 className="font-display text-xl font-bold tracking-tight text-black">
                    {domain.name}
                  </h2>
                </div>

                {courses.length ? (
                  <>
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {firstRow.map((course) => (
                        <li key={course.id}>
                          <CourseCard
                            course={{
                              ...course,
                              domainName: domain.name,
                              domainId: domain.id,
                            }}
                          />
                        </li>
                      ))}
                    </ul>

                    {insertStrip && (
                      <div className="mt-6">
                        <AllAccessStrip
                          courseCount={allCourses.length || 7}
                          domainNames={domainNames}
                          courseNames={courseNames}
                        />
                      </div>
                    )}

                    {rest.length > 0 && (
                      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {rest.map((course) => (
                          <li key={course.id}>
                            <CourseCard
                              course={{
                                ...course,
                                domainName: domain.name,
                                domainId: domain.id,
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-neutral-500">
                    No courses in this domain yet.
                  </p>
                )}
              </div>
            )
          })}
      </div>
    </section>
  )
}
