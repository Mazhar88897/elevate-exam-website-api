"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MoreHorizontal, AlertTriangle } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import NoteModal from "@/components/dashboardItems/note-modal"
import toast from "react-hot-toast"

// Type definitions
export interface Note {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

// NoteModal compatible interface
interface NoteModalNote {
  id: string
  title: string
  content: string
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentNote, setCurrentNote] = useState<NoteModalNote | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [operationLoading, setOperationLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [noteToView, setNoteToView] = useState<Note | null>(null)
  
  // Ref to track if fetch has been initiated (prevents duplicate fetches in Strict Mode)
  const hasFetchedRef = useRef(false)

  // Fetch notes from API (client-only)
  useEffect(() => {
    // Ensure this runs only in the browser
    if (typeof window === "undefined") return

    // Prevent duplicate fetches (especially in React Strict Mode)
    if (hasFetchedRef.current) {
      return
    }
    
    hasFetchedRef.current = true
    
    const fetchNotes = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = typeof window !== "undefined" ? sessionStorage.getItem("Authorization") : null
        if (!token) {
          throw new Error("Missing authorization token")
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/notes/`, {
          method: "GET",
          headers: {
            "Authorization": token,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch notes")
        }

        const data = await response.json()
        setNotes(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching notes"
        setError(errorMessage)
        console.error("Error fetching notes:", err)
        // Reset ref on error so it can retry if needed
        hasFetchedRef.current = false
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [])

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddNote = async (note: Omit<NoteModalNote, "id">) => {
    try {
      setOperationLoading(true)
      const token = typeof window !== "undefined" ? sessionStorage.getItem("Authorization") : null
      if (!token) {
        throw new Error("Missing authorization token")
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/notes/`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create note')
      }

      const newNote = await response.json()
      setNotes([newNote, ...notes])
      setIsModalOpen(false)
      toast.success('Note created successfully!')
    } catch (err) {
      console.error('Error creating note:', err)
      toast.error('Failed to create note. Please try again.')
    } finally {
      setOperationLoading(false)
    }
  }

  const handleEditNote = async (note: NoteModalNote) => {
    try {
      setOperationLoading(true)
      const token = typeof window !== "undefined" ? sessionStorage.getItem("Authorization") : null
      if (!token) {
        throw new Error("Missing authorization token")
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/notes/${note.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update note')
      }

      const updatedNote = await response.json()
      setNotes(
        notes.map((n) =>
          n.id === updatedNote.id ? updatedNote : n
        )
      )
      setIsModalOpen(false)
      toast.success('Note updated successfully!')
    } catch (err) {
      console.error('Error updating note:', err)
      toast.error('Failed to update note. Please try again.')
    } finally {
      setOperationLoading(false)
    }
  }

  const openDeleteModal = (note: Note) => {
    setNoteToDelete(note)
    setDeleteModalOpen(true)
  }

  const handleDeleteNote = async () => {
    if (!noteToDelete) return

    try {
      setOperationLoading(true)
      const token = typeof window !== "undefined" ? sessionStorage.getItem("Authorization") : null
      if (!token) {
        throw new Error("Missing authorization token")
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/notes/${noteToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      setNotes(notes.filter((note) => note.id !== noteToDelete.id))
      toast.success('Note deleted successfully!')
      setDeleteModalOpen(false)
      setNoteToDelete(null)
    } catch (err) {
      console.error('Error deleting note:', err)
      toast.error('Failed to delete note. Please try again.')
    } finally {
      setOperationLoading(false)
    }
  }

  // Check if note was updated (updated_at > created_at)
  const isNoteUpdated = (note: Note) => {
    return new Date(note.updated_at) > new Date(note.created_at)
  }

  const openEditModal = (note: Note) => {
    setCurrentNote({
      id: note.id.toString(),
      title: note.title,
      content: note.content
    })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const openAddModal = () => {
    setCurrentNote(null)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const openViewModal = (note: Note) => {
    setNoteToView(note)
    setViewModalOpen(true)
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
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-xcolor"
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-sm font-bold">
              Total Notes: <span className="font-bold">{notes.length}</span>
            </p>
            <Button variant="default" className="bg-xcolor hover:bg-xcolor/90 text-white rounded-mid font-bold " onClick={openAddModal}>
              + Add Note
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-xcolor border-t-transparent"></div>
            <span className="text-gray-600">Loading notes...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Failed to load notes
          </h3>
          <p className="text-gray-500 text-sm dark:text-gray-400 mb-4">
            {error}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNotes.map((note) => (
            <div 
              key={note.id} 
              className="border rounded-mid py-4 h-40 flex flex-col cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => openViewModal(note)}
            >
              <div className="flex justify-between items-start ">
                <h3 className="font-bold text-sm px-4">{note.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger 
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal size={16} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openViewModal(note); }}>View</DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(note); }}>Edit</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); openDeleteModal(note); }}
                      className="text-red-500 focus:text-red-500"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm font-bold text-gray-600 mb-3 px-4 line-clamp-3 overflow-hidden flex-1">{note.content}</p>
              <div className="text-xs px-4 border-t pt-1 font-semibold text-gray-400 mt-auto">
                {isNoteUpdated(note) ? "Updated" : "Created"} at {formatDate(isNoteUpdated(note) ? note.updated_at : note.created_at)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Image
            src="/nothing.png"
            alt="No notes found"
            width={200}
            height={200}
            className="mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold   text-gray-900 dark:text-gray-100 ">
            {searchQuery ? "No notes found" : "No notes yet"}
          </h3>
          <p className="text-gray-500 text-sm dark:text-gray-400 mb-4">
            {searchQuery 
              ? `No notes match your search for "${searchQuery}"`
              : "Create your first note to get started"
            }
          </p>
          
        </div>
      )}

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => !operationLoading && setIsModalOpen(false)}
        onSave={isEditing ? handleEditNote : handleAddNote}
        note={currentNote as any}
        isEditing={isEditing}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {/* <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center"> */}
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              {/* </div> */}
              <div>
                <DialogTitle className="text-lg font-semibold">Delete Note</DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete the note <strong>&quot;{noteToDelete?.title}&quot;</strong>? 
              This will permanently remove the note from your collection.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={operationLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNote}
              disabled={operationLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {operationLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Deleting...
                </div>
              ) : (
                'Delete Note'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Note Modal */}
      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center  rounded-mid justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] mx-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {noteToView?.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {noteToView && (
                    <>
                      {isNoteUpdated(noteToView) ? "Updated" : "Created"} on{' '}
                      {formatDate(isNoteUpdated(noteToView) ? noteToView.updated_at : noteToView.created_at)}
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {noteToView?.content}
                </p>
              </div>
            </div>

            {/* Footer */}
            {/* <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setViewModalOpen(false)
                  if (noteToView) {
                    openEditModal(noteToView)
                  }
                }}
                className="bg-xcolor text-white hover:bg-xcolor/90"
              >
                Edit Note
              </Button>
            </div> */}
          </div>
        </div>
      )}
    </main>
  )
}
