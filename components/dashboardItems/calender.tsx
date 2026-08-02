"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExamDate {
  id: number
  day: number
  title: string
  description?: string
  eventMonth: number
  eventYear: number
  eventDate: string
}

function formatYmd(year: number, zeroIndexedMonth: number, day: number) {
  const m = zeroIndexedMonth + 1
  const mm = m < 10 ? `0${m}` : `${m}`
  const dd = day < 10 ? `0${day}` : `${day}`
  return `${year}-${mm}-${dd}`
}

function generateCalendarDays(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDow = new Date(year, month, 1).getDay()
  // Convert Sunday=0 → Monday-first index
  const mondayFirst = (firstDow + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarArray: Array<Array<number | null>> = []
  let week: Array<number | null> = []

  for (let i = 0; i < mondayFirst; i++) week.push(null)

  for (let day = 1; day <= daysInMonth; day++) {
    if (week.length === 7) {
      calendarArray.push(week)
      week = []
    }
    week.push(day)
  }

  while (week.length < 7) week.push(null)
  calendarArray.push(week)

  while (calendarArray.length < 6) {
    calendarArray.push([null, null, null, null, null, null, null])
  }

  return calendarArray
}

export default function CalendarSchedule() {
  const today = useMemo(() => new Date(), [])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate())
  const [note, setNote] = useState("")
  const [events, setEvents] = useState<ExamDate[]>([])
  const [saving, setSaving] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  const calendarDays = generateCalendarDays(currentDate)

  useEffect(() => {
    let cancelled = false
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/events/`, {
          method: "GET",
          headers: {
            Authorization: `${sessionStorage.getItem("Authorization")}`,
            "Content-Type": "application/json",
          },
        })
        if (!res.ok || cancelled) return
        const data: Array<{
          id: number
          title: string
          description?: string
          event_date: string
        }> = await res.json()

        const mapped: ExamDate[] = data.map((item, index) => {
          const dateObj = new Date(item.event_date)
          return {
            id: item.id ?? index + 1,
            day: dateObj.getDate(),
            title: item.title,
            description: item.description,
            eventMonth: dateObj.getMonth(),
            eventYear: dateObj.getFullYear(),
            eventDate: item.event_date,
          }
        })
        setEvents(mapped)
      } catch {
        // silent
      }
    }
    fetchEvents()
    return () => {
      cancelled = true
    }
  }, [])

  // Sync note when selecting a day that already has an event
  useEffect(() => {
    const existing = events.find(
      (ev) =>
        ev.day === selectedDay &&
        ev.eventMonth === month &&
        ev.eventYear === year
    )
    setNote(existing?.title || existing?.description || "")
  }, [selectedDay, month, year, events])

  const selectedDateObj = new Date(year, month, selectedDay)
  const selectedLabel = selectedDateObj
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toUpperCase()

  const datesSetCount = events.length

  const handlePrevMonth = () => {
    const next = new Date(currentDate)
    next.setMonth(next.getMonth() - 1)
    setCurrentDate(next)
    setSelectedDay(1)
  }

  const handleNextMonth = () => {
    const next = new Date(currentDate)
    next.setMonth(next.getMonth() + 1)
    setCurrentDate(next)
    setSelectedDay(1)
  }

  const isPastDay = (day: number) => {
    const d = new Date(year, month, day)
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return d < t
  }

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()

  const hasEvent = (day: number) =>
    events.some(
      (ev) =>
        ev.day === day && ev.eventMonth === month && ev.eventYear === year
    )

  const handleSave = async () => {
    if (!note.trim()) {
      toast.error("Please add a note for this exam date")
      return
    }
    if (isPastDay(selectedDay)) {
      toast.error("Cannot set exam dates in the past")
      return
    }

    setSaving(true)
    const eventDate = formatYmd(year, month, selectedDay)
    const existing = events.find(
      (ev) =>
        ev.day === selectedDay &&
        ev.eventMonth === month &&
        ev.eventYear === year
    )

    try {
      if (existing) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/events/${existing.id}/`,
          {
            method: "PUT",
            headers: {
              Authorization: `${sessionStorage.getItem("Authorization")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: note.trim(),
              description: note.trim(),
              event_date: eventDate,
            }),
          }
        )
        if (!res.ok) {
          toast.error("Failed to update date")
          return
        }
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === existing.id
              ? { ...ev, title: note.trim(), description: note.trim() }
              : ev
          )
        )
        toast.success("Exam date updated")
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/events/`, {
          method: "POST",
          headers: {
            Authorization: `${sessionStorage.getItem("Authorization")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: note.trim(),
            event_date: eventDate,
            description: note.trim(),
          }),
        })
        if (!res.ok) {
          toast.error("Failed to save date")
          return
        }
        const created: {
          id: number
          title: string
          description?: string
          event_date: string
        } = await res.json()
        const createdDate = new Date(created.event_date)
        setEvents((prev) => [
          ...prev,
          {
            id: created.id,
            day: createdDate.getDate(),
            title: created.title,
            description: created.description,
            eventMonth: createdDate.getMonth(),
            eventYear: createdDate.getFullYear(),
            eventDate: created.event_date,
          },
        ])
        toast.success("Exam date saved")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/events/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `${sessionStorage.getItem("Authorization")}`,
          },
        }
      )
      if (!res.ok) {
        toast.error("Failed to delete date")
        return
      }
      setEvents((prev) => prev.filter((ev) => ev.id !== id))
      toast.success("Exam date removed")
    } catch {
      toast.error("Something went wrong")
    }
  }

  const upcoming = [...events].sort(
    (a, b) =>
      new Date(a.eventYear, a.eventMonth, a.day).getTime() -
      new Date(b.eventYear, b.eventMonth, b.day).getTime()
  )

  return (
    <section className="border border-neutral-200 bg-white">
      <div className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4">
        <CalendarDays className="h-5 w-5 text-neutral-700" strokeWidth={1.75} />
        <h2 className="font-display text-lg font-bold tracking-tight text-black">
          Exam Calendar
        </h2>
        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500">
          {datesSetCount} date{datesSetCount === 1 ? "" : "s"} set
        </span>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
        {/* Calendar */}
        <div className="border-b border-neutral-200 p-5 lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center border border-neutral-300 text-neutral-600 transition-colors hover:bg-neutral-50"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="font-display text-sm font-bold text-black">
              {monthLabel}
            </p>
            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center border border-neutral-300 text-neutral-600 transition-colors hover:bg-neutral-50"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-neutral-400"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {calendarDays.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((day, di) => {
                  if (day === null) {
                    return <div key={`${wi}-${di}`} className="h-10" />
                  }
                  const selected = day === selectedDay
                  const event = hasEvent(day)
                  const todayMark = isToday(day)
                  const past = isPastDay(day)

                  return (
                    <button
                      key={`${wi}-${di}`}
                      type="button"
                      disabled={past}
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "relative flex h-10 flex-col items-center justify-center text-sm transition-colors",
                        past && "cursor-not-allowed text-neutral-300",
                        !past && !selected && "text-neutral-800 hover:bg-neutral-50",
                        selected && "bg-black text-white",
                        todayMark && !selected && "underline decoration-2 underline-offset-4"
                      )}
                    >
                      {day}
                      {event && (
                        <span
                          className={cn(
                            "absolute bottom-1.5 h-1 w-1 rounded-full",
                            selected ? "bg-white" : "bg-black"
                          )}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex flex-col p-5">
          <p className="font-mono text-xs tracking-wide text-neutral-400">
            {selectedLabel}
          </p>

          <label className="mt-6 mb-1.5 block text-sm font-bold text-black">
            Note
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. CISSP exam day"
            disabled={isPastDay(selectedDay)}
            className="w-full border border-black bg-white px-3 py-2.5 text-sm text-black outline-none placeholder:text-neutral-400 focus:ring-1 focus:ring-black disabled:border-neutral-200 disabled:bg-neutral-50"
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || isPastDay(selectedDay)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save date"}
            {!saving && <ArrowRight className="h-3.5 w-3.5" />}
          </button>

          <div className="mt-6 flex-1 border-t border-neutral-100 pt-4">
            {upcoming.length === 0 ? (
              <p className="text-sm text-neutral-400">
                No exam dates scheduled yet.
              </p>
            ) : (
              <ul className="max-h-40 space-y-2 overflow-y-auto">
                {upcoming.map((ev) => {
                  const label = new Date(
                    ev.eventYear,
                    ev.eventMonth,
                    ev.day
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                  return (
                    <li
                      key={ev.id}
                      className="flex items-start justify-between gap-2 border border-neutral-200 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-black">
                          {label}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          {ev.title}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(ev.id)}
                        className="shrink-0 text-neutral-400 transition-colors hover:text-black"
                        aria-label="Delete exam date"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
