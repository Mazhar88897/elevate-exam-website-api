"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { hasPaidAccessFromSession } from "@/lib/payment-access"

const QUESTION_COUNT_KEY = "QuestionCountFree"
const LIMIT = 10
const DISMISS_KEY = "free_limit_pay_modal_dismissed"

/** Dispatch after updating session `QuestionCountFree`; modal opens only if count >= {@link LIMIT}. */
export const FREE_LIMIT_PAY_MODAL_OPEN_EVENT = "free-limit-pay-modal:open"

function readCount(): number {
  if (typeof window === "undefined") return 0
  const raw = sessionStorage.getItem(QUESTION_COUNT_KEY)
  const n = parseInt(raw ?? "0", 10)
  return Number.isFinite(n) ? n : 0
}

function isDismissed(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(DISMISS_KEY) === "1"
}

export default function FreeLimitPayModal() {
  const [open, setOpen] = useState(false)

  const syncOpen = useCallback(() => {
    if (hasPaidAccessFromSession()) {
      setOpen(false)
      return
    }
    const count = readCount()
    if (count < LIMIT) {
      sessionStorage.removeItem(DISMISS_KEY)
    }
    const dismissed = isDismissed()
    setOpen(count >= LIMIT && !dismissed)
  }, [])

  const handleOpenRequestEvent = useCallback(() => {
    if (hasPaidAccessFromSession()) return
    if (readCount() < LIMIT) return
    sessionStorage.removeItem(DISMISS_KEY)
    setOpen(true)
  }, [])

  useEffect(() => {
    syncOpen()
    const id = window.setInterval(syncOpen, 800)
    const onFocus = () => syncOpen()
    const onVis = () => {
      if (document.visibilityState === "visible") syncOpen()
    }
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVis)
    window.addEventListener("storage", syncOpen)
    window.addEventListener(FREE_LIMIT_PAY_MODAL_OPEN_EVENT, handleOpenRequestEvent)
    return () => {
      window.clearInterval(id)
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVis)
      window.removeEventListener("storage", syncOpen)
      window.removeEventListener(FREE_LIMIT_PAY_MODAL_OPEN_EVENT, handleOpenRequestEvent)
    }
  }, [syncOpen, handleOpenRequestEvent])

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleDismiss()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Free limit reached</DialogTitle>
          <DialogDescription className="space-y-3 pt-1 text-base leading-relaxed text-foreground/90">
            <span className="block">
              You have used the free tour ({LIMIT} questions). To keep practicing,
              please choose a plan and subscribe.
            </span>
            <span className="block text-sm text-muted-foreground">
              Your progress is saved; upgrading unlocks full access.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleDismiss}>
            Not now
          </Button>
          <Button type="button" asChild className="bg-xcolor hover:bg-xcolor/90">
            <Link href="/payment/plan">View plans &amp; pay</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
