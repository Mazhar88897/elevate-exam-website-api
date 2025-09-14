"use client"

import { useState, useEffect } from "react"
import { Search, MoreHorizontal } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import NoteModal from "@/components/dashboardItems/note-modal"

// Type definitions
export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  isEdited: boolean
}

// Utility functions
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)

  // Format: "13rd, June"
  const day = date.getDate()
  const month = date.toLocaleString("default", { month: "long" })

  // Add ordinal suffix
  let suffix = "th"
  if (day === 1 || day === 21 || day === 31) suffix = "st"
  if (day === 2 || day === 22) suffix = "nd"
  if (day === 3 || day === 23) suffix = "rd"

  return `${day}${suffix}, ${month}`
}

// Main Page Component
export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Initialize with sample data
  useEffect(() => {
    const sampleNotes: Note[] = Array.from({ length: 12 }, (_, i) => ({
      id: i.toString(),
      title: "It and Cyber Keypoints",
      content: "lorem sporem like that ans stuff ande more.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
    }))
    setNotes(sampleNotes)
  }, [])

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddNote = (note: Omit<Note, "id" | "createdAt" | "updatedAt" | "isEdited">) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: note.title,
      content: note.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
    }

    setNotes([newNote, ...notes])
    setIsModalOpen(false)
  }

  const handleEditNote = (note: Omit<Note, "createdAt" | "updatedAt" | "isEdited">) => {
    setNotes(
      notes.map((n) =>
        n.id === note.id
          ? {
              ...n,
              title: note.title,
              content: note.content,
              updatedAt: new Date().toISOString(),
              isEdited: true,
            }
          : n,
      ),
    )
    setIsModalOpen(false)
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const openEditModal = (note: Note) => {
    setCurrentNote(note)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const openAddModal = () => {
    setCurrentNote(null)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  return (
    <main className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-lg font-bold mb-6"></h1>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-[500px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="search "
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffd404]"
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-sm font-bold">
              Total Notes: <span className="font-bold">{notes.length}</span>
            </p>
            <Button variant="default" className="bg-[#ffd404] text-white rounded-mid font-bold hover:bg-[#ffd404]/90" onClick={openAddModal}>
              + Add Note
            </Button>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredNotes.map((note) => (
          <div key={note.id} className="border rounded-mid py-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-sm px-4">{note.title}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full ">
                  <MoreHorizontal size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditModal(note)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-500 focus:text-red-500"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm font-bold text-gray-600 mb-3 px-4">{note.content}</p>
            <div className="text-xs px-4 border-t pt-1 font-semibold text-gray-400">
              {note.isEdited ? "Edited" : "Created"} at {formatDate(note.updatedAt)}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={isEditing ? handleEditNote : handleAddNote}
        note={currentNote}
        isEditing={isEditing}
      />
    </main>
  )
}
