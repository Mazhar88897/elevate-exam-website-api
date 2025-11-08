"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { ChevronLeft, ChevronRight, Edit,   Paperclip, Plus, Trash } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Event {
  id: number
  day: number
  title: string
  description?: string
  time: string
  color: string
  hasAttachment?: boolean
  eventMonth: number // 0-indexed month from event_date
  eventYear: number
}

export default function CalendarSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const currentMonth = currentDate.toLocaleString("default", { month: "long" })
  const currentYear = currentDate.getFullYear().toString()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [newEventTitle, setNewEventTitle] = useState("")
  const [newEventDescription, setNewEventDescription] = useState("")
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

  // Events fetched from API + locally added via modal
  const [events, setEvents] = useState<Event[]>([])

  // Fetch events once and keep them; highlight only those in the current month
  useEffect(() => {
    const EVENTS_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/events/`

    let isCancelled = false
    const fetchEvents = async () => {
      try { 
        const res = await fetch(EVENTS_URL, {
          method: 'GET',
            headers: {
            'Authorization': `${sessionStorage.getItem('Authorization')}`,
            'Content-Type': 'application/json',
          },
        })
        if (!res.ok) return
        const data: Array<{ id: number; title: string; description?: string; event_date: string }> = await res.json()
        if (isCancelled) return

        // Map API events to our Event structure
        const mapped: Event[] = data.map((item, index) => {
          const dateObj = new Date(item.event_date)
          return {
            id: item.id ?? index + 1,
            day: dateObj.getDate(),
            title: item.title,
            description: item.description,
            time: "",
            color: getRandomColor(),
            eventMonth: dateObj.getMonth(),
            eventYear: dateObj.getFullYear(),
          }
        })
        setEvents(mapped)
      } catch (e) {
        // fail silent
      }
    }
    fetchEvents()
    return () => {
      isCancelled = true
    }
  }, [])

  // Calendar data for March 2023
  const calendarDays = generateCalendarDays(currentDate)

  // Compute which days are in the current visible month from fetched events
  const highlightedDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const days = new Set<number>()
    for (const ev of events) {
      if (ev.eventYear === year && ev.eventMonth === month) {
        days.add(ev.day)
      }
    }
    return Array.from(days)
  }, [events, currentDate])

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  const handleDayClick = (day: number) => {
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    // Only allow clicking on days in the current month
    if (day >= 1 && day <= lastDayOfMonth) {
      const today = new Date()
      const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) <
        new Date(today.getFullYear(), today.getMonth(), today.getDate())
      if (isPast) {
        toast.error("Cannot add events in the past")
        return
      }
      setSelectedDay(day)
      setIsModalOpen(true)
    }
  }

  const handleSubmitEvent = async () => {
    if (!selectedDay || !newEventTitle.trim()) {
      toast.error("Please provide a title")
      return
    }

    const EVENTS_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/events/`
    const eventDate = formatYmd(currentDate.getFullYear(), currentDate.getMonth(), selectedDay)

    // Double-check block if user navigated back in time between select and submit
    const today = new Date()
    const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay) <
      new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (isPast) {
      toast.error("Cannot add events in the past")
      return
    }

    try {
      const res = await fetch(EVENTS_URL, {
        method: 'POST',
        headers: {
          'Authorization': `${sessionStorage.getItem('Authorization')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newEventTitle,
          event_date: eventDate,
          description: newEventDescription || undefined,
        }),
      })

      if (!res.ok) {
        toast.error("Failed to add event")
        return
      }

      const created: { id: number; title: string; description?: string; event_date: string } = await res.json()
      const createdDate = new Date(created.event_date)

      const newEvent: Event = {
        id: created.id,
        day: createdDate.getDate(),
        title: created.title,
        description: created.description,
        time: getCurrentTime(),
        color: getRandomColor(),
        eventMonth: createdDate.getMonth(),
        eventYear: createdDate.getFullYear(),
      }

      setEvents([...events, newEvent])
      setNewEventTitle("")
      setNewEventDescription("")
      setIsModalOpen(false)
      toast.success("Event added successfully")
    } catch (e) {
      toast.error("Something went wrong")
    }
  }

  // Helper function to get current time in format like "3:30 PM"
  const getCurrentTime = () => {
    const now = new Date()
    let hours = now.getHours()
    const minutes = now.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"

    hours = hours % 12
    hours = hours ? hours : 12 // the hour '0' should be '12'

    return `${hours}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`
  }

  // Helper function to get a random color for new events
  const getRandomColor = () => {
    const colors = ["bg-emerald-600", "bg-orange-600", "bg-sky-600", "bg-purple-600", "bg-pink-600"]
    return colors[Math.floor(Math.random() * colors.length)]
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

    const firstDayOfWeek = new Date(year, month, 1).getDay() // 0..6
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const calendarArray: Array<Array<number | null>> = []
    let week: Array<number | null> = []

    // Leading blanks
    for (let i = 0; i < firstDayOfWeek; i++) {
      week.push(null)
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      if (week.length === 7) {
        calendarArray.push(week)
        week = []
      }
      week.push(day)
    }

    // Trailing blanks
    while (week.length < 7) {
      week.push(null)
    }
    calendarArray.push(week)

    // Ensure a consistent 6-row grid by filling remaining weeks with blanks
    while (calendarArray.length < 6) {
      calendarArray.push([null, null, null, null, null, null, null])
    }

    return calendarArray
  }



  return (
    <div className="bg-card rounded-lg shadow-sm border border-border max-w-full w-full mx-auto">
      <div className="p-4 px-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-medium text-card-foreground"></h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-accent">
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="text-sm text-foreground">{currentMonth}</span>
              <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-accent">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <span className="text-sm text-foreground">{currentYear}</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-7 mb-2 gap-x-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-medium py-1 bg-muted text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {calendarDays.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-x-1">
              {week.map((day, dayIndex) => {
                const isBlank = day === null
                const isCurrentMonth = !isBlank
                const hasEventInCurrentMonthYear = !isBlank && events.some(
                  (event) =>
                    event.day === day &&
                    event.eventMonth === currentDate.getMonth() &&
                    event.eventYear === currentDate.getFullYear(),
                )
                const isHighlighted = !isBlank && hasEventInCurrentMonthYear && isCurrentMonth

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      "h-8 flex items-center justify-center text-xs border-t border-border",
                      isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                      isHighlighted && "bg-blue-500 text-white hover:bg-primary/90",
                      hasEventInCurrentMonthYear && !isHighlighted && "font-medium",
                      isBlank
                        ? ""
                        : new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
                        ? "cursor-not-allowed"
                        : "cursor-pointer hover:bg-accent",
                    )}
                    onClick={() => !isBlank && handleDayClick(day as number)}
                  >
                    {!isBlank ? day : ""}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Events Section */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">EVENTS</h3>
          <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
            {events.map((event) => (
              <div key={event.id} className="flex items-start justify-between">
                <div className="flex items-start gap-2 min-w-0">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-primary-foreground text-xs shrink-0",
                      event.color,
                    )}
                  >
                    {event.day}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground whitespace-normal break-words leading-snug">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground whitespace-normal break-words leading-snug">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {/* <span className="text-xs text-muted-foreground">{daysLeft(event.eventDate)}</span> */}
                
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center bg-primary text-primary-foreground cursor-pointer"
                    onClick={() => {
                      setEditingEvent(event)
                      setEditTitle(event.title)
                      setEditDescription(event.description || "")
                      setIsEditOpen(true)
                    }}
                  >
                    <Edit className="h-2.5 w-2.5" />
                  </div>
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center bg-primary text-primary-foreground cursor-pointer"
                    onClick={() => {
                      setDeletingEvent(event)
                      setIsDeleteOpen(true)
                    }}
                  >
                    <Trash className="h-2.5 w-2.5" />
                  </div>    
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Add Event for {currentMonth} {selectedDay}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Event Title
              </label>
              <Input
                id="title"
                placeholder="Enter event title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Enter event description"
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-title" className="text-sm font-medium text-foreground">
                Event Title
              </label>
              <Input
                id="edit-title"
                placeholder="Enter event title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                id="edit-description"
                placeholder="Enter event description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!editingEvent) return
                if (!editTitle.trim()) {
                  toast.error("Please provide a title")
                  return
                }
                const EVENTS_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/events/${editingEvent.id}/`
                const eventDate = formatYmd(currentDate.getFullYear(), currentDate.getMonth(), editingEvent.day)
                try {
                  const res = await fetch(EVENTS_URL, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `${sessionStorage.getItem('Authorization')}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title: editTitle, description: editDescription || undefined, event_date: eventDate }),
                  })
                  if (!res.ok) {
                    toast.error("Failed to update event")
                    return
                  }
                  // Reflect the update locally
                  setEvents(
                    events.map((ev) =>
                      ev.id === editingEvent.id
                        ? { ...ev, title: editTitle, description: editDescription }
                        : ev,
                    ),
                  )
                  setIsEditOpen(false)
                  setEditingEvent(null)
                  toast.success("Event updated successfully")
                } catch (e) {
                  toast.error("Something went wrong")
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] bg-background">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Event</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Are you sure you want to delete <span className="text-foreground font-medium">{deletingEvent?.title}</span>?
            This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deletingEvent) return
                const url = `${process.env.NEXT_PUBLIC_BASE_URL}/events/${deletingEvent.id}/`
                try {
                  const res = await fetch(url, {
                    method: 'DELETE',
                    headers: { 'Authorization': `${sessionStorage.getItem('Authorization')}` },
                  })
                  if (!res.ok) { toast.error('Failed to delete event'); return }
                  setEvents(events.filter((ev) => ev.id !== deletingEvent.id))
                  setIsDeleteOpen(false)
                  setDeletingEvent(null)
                  toast.success('Event deleted')
                } catch (e) {
                  toast.error('Something went wrong')
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
