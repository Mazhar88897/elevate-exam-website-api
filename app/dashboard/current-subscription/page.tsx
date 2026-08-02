"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Loader2,
  Calendar,
  CreditCard,
  XCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import toast from "react-hot-toast"

interface SubscriptionStatus {
  status: string
  is_active: boolean
  plan_interval: "month" | "year" | string
  cancel_at_period_end: boolean
  current_period_start: string
  current_period_end: string
}

export default function CurrentSubscriptionsPage() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = sessionStorage.getItem("Authorization")
      if (!token) {
        throw new Error("Please log in to view subscriptions")
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/status/`,
        {
          method: "GET",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!res.ok) {
        if (res.status === 404) {
          setSubscription(null)
          return
        }
        throw new Error(
          `Failed to fetch subscription: ${res.status} ${res.statusText}`
        )
      }

      const data: SubscriptionStatus = await res.json()
      setSubscription(data)
    } catch (err) {
      console.error("Error fetching subscription status:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const formatLongDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const handleConfirmCancel = async () => {
    const token = sessionStorage.getItem("Authorization")
    if (!token) {
      toast.error("Please log in again")
      return
    }

    setCancelling(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/cancel/`,
        {
          method: "POST",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          (errorData as { detail?: string; message?: string }).detail ||
            (errorData as { message?: string }).message ||
            "Failed to cancel subscription"
        )
      }

      setSubscription((prev) =>
        prev ? { ...prev, cancel_at_period_end: true } : prev
      )
      toast.success("Subscription will be cancelled at the end of the period")
      setIsCancelDialogOpen(false)
    } catch (err) {
      console.error("Error cancelling subscription:", err)
      toast.error(
        err instanceof Error ? err.message : "An error occurred while cancelling"
      )
    } finally {
      setCancelling(false)
    }
  }

  const showCancelButton =
    subscription &&
    subscription.is_active &&
    subscription.status === "active" &&
    !subscription.cancel_at_period_end

  const daysLeft = subscription
    ? getDaysRemaining(subscription.current_period_end)
    : 0

  const planLabel =
    subscription?.plan_interval === "month"
      ? "Monthly"
      : subscription?.plan_interval === "year"
        ? "Annual"
        : subscription?.plan_interval || "—"

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          Account
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-black sm:text-3xl">
          Current subscription
        </h1>
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          Account
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-black sm:text-3xl">
          Current subscription
        </h1>
        <p className="mt-8 text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-black lg:px-10">
      <header className="border-b border-black pb-8">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          Account
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Current subscription
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
          {subscription ? (
            <>
              Your billing period defines how long access lasts. If you cancel,
              you keep full access through{" "}
              <span className="font-semibold text-black">
                {formatLongDate(subscription.current_period_end)}
              </span>
              .
            </>
          ) : (
            <>
              When you have an active All Access plan, your tenure follows the
              billing period you paid for. Cancelling only stops renewal.
            </>
          )}
        </p>
      </header>

      {!subscription ? (
        <div className="mt-12 border border-black bg-[#FDF2F7] px-6 py-10 text-center">
          <p className="font-display text-lg font-bold text-black">
            No active subscription
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            Unlock every course domain with All Access.
          </p>
          <Link
            href="/payment/plan"
            className="mt-6 inline-flex items-center gap-1.5 border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            View plans
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-8">
          <div className="grid gap-0 border border-black sm:grid-cols-2">
            <div className="border-b border-black px-5 py-6 sm:border-b-0 sm:border-r">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Status
              </p>
              <div className="mt-3">
                {subscription.status === "active" &&
                !subscription.cancel_at_period_end ? (
                  <span className="inline-flex items-center gap-2 border border-black bg-black px-3 py-1.5 font-display text-sm font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4" />
                    Active
                  </span>
                ) : subscription.cancel_at_period_end ? (
                  <span className="inline-flex items-center gap-2 border border-black bg-white px-3 py-1.5 font-display text-sm font-semibold text-black">
                    <AlertCircle className="h-4 w-4" />
                    Cancelling at period end
                  </span>
                ) : (
                  <span className="inline-flex border border-neutral-300 px-3 py-1.5 font-display text-sm font-semibold text-neutral-600">
                    {subscription.status}
                  </span>
                )}
              </div>

              <p className="mt-8 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Plan
              </p>
              <p className="mt-2 flex items-center gap-2 font-display text-lg font-bold text-black">
                <CreditCard className="h-5 w-5" strokeWidth={1.75} />
                All Access · {planLabel}
              </p>
            </div>

            <div className="px-5 py-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Time left this period
              </p>
              <p className="mt-2 font-display text-4xl font-bold tabular-nums text-black">
                {daysLeft > 0 ? `${daysLeft}` : "0"}
                <span className="ml-2 text-base font-semibold text-neutral-400">
                  {daysLeft > 0 ? "days" : "Period ended"}
                </span>
              </p>

              <div className="mt-8 space-y-4 border-t border-neutral-200 pt-5">
                <div className="flex gap-3">
                  <Calendar
                    className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
                    strokeWidth={1.75}
                  />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                      Period start
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-black">
                      {formatLongDate(subscription.current_period_start)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Calendar
                    className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
                    strokeWidth={1.75}
                  />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                      Period end
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-black">
                      {formatLongDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {subscription.cancel_at_period_end && (
            <div className="border border-black bg-neutral-50 px-5 py-4">
              <p className="text-sm leading-relaxed text-neutral-700">
                Auto-renewal is off. Your paid access continues until{" "}
                <span className="font-semibold text-black">
                  {formatLongDate(subscription.current_period_end)}
                </span>
                . After that date, the subscription will not renew.
              </p>
            </div>
          )}

          <footer className="border-t border-black pt-8">
            {showCancelButton ? (
              <button
                type="button"
                onClick={() => setIsCancelDialogOpen(true)}
                className="inline-flex items-center gap-2 border border-black bg-white px-5 py-2.5 font-display text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white"
              >
                <XCircle className="h-4 w-4" />
                Cancel subscription
              </button>
            ) : (
              <p className="text-sm text-neutral-500">
                {subscription.cancel_at_period_end
                  ? "Auto-renewal is off. You still have access for the remainder of this billing period."
                  : "This subscription is not active for cancellation from here."}
              </p>
            )}
          </footer>
        </div>
      )}

      <Dialog
        open={isCancelDialogOpen}
        onOpenChange={(open) => {
          setIsCancelDialogOpen(open)
          if (!open) setCancelling(false)
        }}
      >
        <DialogContent className="max-w-md gap-0 overflow-hidden border-2 border-black bg-white p-0 shadow-none sm:rounded-none [&>button]:hidden">
          <DialogHeader className="flex flex-row items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5 text-left">
            <DialogTitle className="font-display text-xl font-bold tracking-tight text-black">
              Cancel subscription
            </DialogTitle>
            <button
              type="button"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={cancelling}
              className="shrink-0 rounded-full border border-neutral-300 p-1 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-black disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          <div className="px-6 py-5">
            <p className="text-sm text-neutral-500">
              Do you really want to cancel? You&apos;ll keep access until the
              end of your current billing period.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4">
            <button
              type="button"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={cancelling}
              className="border border-black bg-white px-5 py-2.5 font-display text-sm font-semibold text-black transition-colors hover:bg-neutral-50 disabled:opacity-50"
            >
              Keep plan
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="inline-flex items-center gap-2 border border-black bg-black px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling…
                </>
              ) : (
                "Yes, cancel"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
