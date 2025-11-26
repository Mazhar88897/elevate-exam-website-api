"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type FormData = {
  title: string
  description: string
}

// Create context for modal state
interface ModalContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      <SimpleModal />
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return context
}

// SimpleModal component
export function SimpleModal() {
  const { isOpen, closeModal } = useModal()
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null) // Clear error when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const token = sessionStorage.getItem('Authorization')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/notes/`, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || `Failed to save note: ${response.status} ${response.statusText}`)
      }

      // Success - show toast, close modal and reset form
      toast.success("Note saved successfully")
      closeModal()
      setFormData({ title: "", description: "" })
    } catch (err) {
      console.error('Error saving note:', err)
      setError(err instanceof Error ? err.message : 'Failed to save note')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Fill in the details below and click save when you&apos;re done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter title"
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                rows={4}
                disabled={isLoading}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Export openModal function
export const openModal = () => {
  const modal = document.querySelector('[role="dialog"]')
  if (modal) {
    const event = new Event('click')
    modal.dispatchEvent(event)
  }
}
