"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Award,
  BarChart3,
  ChevronDown,
  HelpCircle,
  Loader2,
  MessagesSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"

const CONTACT_HREF = "/main/contact"

const PRICING = {
  monthly: 5.99,
  annually: 79.99,
}

const STRIPE_PRICE_IDS = {
  monthly: "price_1SQ9Ac00CDQdww264AvpWJv0",
  yearly: "price_1SQ9CM00CDQdww26Sh4FRNYr",
}

type SelectablePlanId = "monthly" | "yearly"

const SELECTABLE_PLANS: Array<{
  id: SelectablePlanId
  label: string
  total: string
  perMonth: string
  billed: string
  badge: string | null
}> = [
  {
    id: "monthly",
    label: "Monthly",
    total: `$${PRICING.monthly}`,
    perMonth: `$${PRICING.monthly}/month`,
    billed: "Billed monthly",
    badge: null,
  },
  {
    id: "yearly",
    label: "Yearly",
    total: `$${PRICING.annually}`,
    perMonth: `$${(PRICING.annually / 12).toFixed(2)}/month`,
    billed: "Billed annually",
    badge: "Best value",
  },
]

const CUSTOM_PLAN = {
  label: "Custom",
  total: "Contact us",
  perMonth: "Flexible for teams & orgs",
  billed: "We'll tailor a plan with you",
  href: CONTACT_HREF,
}

const BENEFITS = [
  {
    icon: HelpCircle,
    text: "1000+ questions and explanations written by subject matter experts.",
  },
  {
    icon: BarChart3,
    text: "Multiple quiz modes and a mock exam to gauge your exam readiness.",
  },
  {
    icon: Award,
    text: "Pass Guarantee: If you fail your exam, we'll give you three months free.*",
  },
]

function ChoosePlanPageContent() {
  const router = useRouter()
  const [selected, setSelected] = useState<SelectablePlanId>("yearly")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const handleAddPayment = async () => {
    const token = sessionStorage.getItem("Authorization")
    if (!token) {
      toast.error("Please sign in to continue")
      router.push("/auth/sign-in")
      return
    }

    const planInterval = selected === "monthly" ? "monthly" : "yearly"
    const priceId =
      selected === "monthly" ? STRIPE_PRICE_IDS.monthly : STRIPE_PRICE_IDS.yearly

    setIsProcessingPayment(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/create-checkout-session/`,
        {
          method: "POST",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan_interval: planInterval,
            price_id: priceId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || data.detail || data.message || "Failed to create checkout session"
        )
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to proceed with payment"
      )
      setIsProcessingPayment(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="px-6 pb-14 pt-14 sm:px-8 sm:pb-16 sm:pt-16 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <header className="mb-10 border-b border-black pb-8 text-left sm:mb-12">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              All Access
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Choose your plan
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
              Unlock every course domain — practice quizzes, flashcards, mock
              exams, and AI support. Cancel anytime.
            </p>
          </header>

          <div className="grid gap-0 border border-black sm:grid-cols-3">
            {SELECTABLE_PLANS.map((plan, index) => {
              const isSelected = selected === plan.id
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelected(plan.id)}
                  className={cn(
                    "relative flex flex-col px-5 py-6 text-left transition-colors",
                    index < SELECTABLE_PLANS.length - 1 &&
                      "border-b border-black sm:border-b-0 sm:border-r",
                    isSelected ? "bg-black text-white" : "bg-white hover:bg-[#FDF2F7]"
                  )}
                >
                  {plan.badge ? (
                    <span
                      className={cn(
                        "mb-3 inline-flex w-fit border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
                        isSelected
                          ? "border-white/40 text-white"
                          : "border-black bg-[#FDF2F7] text-black"
                      )}
                    >
                      {plan.badge}
                    </span>
                  ) : (
                    <span className="mb-3 h-[22px]" aria-hidden />
                  )}
                  <span
                    className={cn(
                      "font-display text-sm font-semibold",
                      isSelected ? "text-white" : "text-black"
                    )}
                  >
                    {plan.label}
                  </span>
                  <span
                    className={cn(
                      "mt-3 font-display text-4xl font-bold tabular-nums tracking-tight",
                      isSelected ? "text-white" : "text-black"
                    )}
                  >
                    {plan.total}
                  </span>
                  <div
                    className={cn(
                      "my-4 h-px w-full",
                      isSelected ? "bg-white/25" : "bg-neutral-200"
                    )}
                  />
                  <p
                    className={cn(
                      "font-display text-sm font-medium tabular-nums",
                      isSelected ? "text-white" : "text-black"
                    )}
                  >
                    {plan.perMonth}
                  </p>
                  <p
                    className={cn(
                      "mt-1 font-mono text-[11px]",
                      isSelected ? "text-neutral-400" : "text-neutral-500"
                    )}
                  >
                    {plan.billed}
                  </p>
                </button>
              )
            })}

            <Link
              href={CUSTOM_PLAN.href}
              className="group relative flex flex-col border-t border-black bg-[#FDF2F7] px-5 py-6 text-left transition-colors hover:bg-[#F5C6C6]/40 sm:border-l sm:border-t-0"
            >
              <span className="mb-3 inline-flex w-fit border border-black px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-black">
                Teams
              </span>
              <span className="flex items-center gap-2 font-display text-sm font-semibold text-black">
                <MessagesSquare className="h-4 w-4 shrink-0" aria-hidden />
                {CUSTOM_PLAN.label}
              </span>
              <span className="mt-3 font-display text-3xl font-bold tracking-tight text-black">
                {CUSTOM_PLAN.total}
              </span>
              <div className="my-4 h-px w-full bg-black/15" />
              <p className="font-display text-sm font-medium text-black">
                {CUSTOM_PLAN.perMonth}
              </p>
              <p className="mt-1 font-mono text-[11px] text-neutral-500">
                {CUSTOM_PLAN.billed}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-black">
                Go to contact
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[11px] text-neutral-400">
              Selected:{" "}
              <span className="font-semibold uppercase tracking-wider text-black">
                {selected}
              </span>
            </p>
            <button
              type="button"
              onClick={handleAddPayment}
              disabled={isProcessingPayment}
              className="inline-flex min-w-[200px] items-center justify-center gap-2 border border-black bg-black px-6 py-3 font-display text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  Continue to payment
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-black bg-[#FDF2F7] px-6 py-14 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Why All Access
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-black sm:text-3xl">
              Show up confident on test day
            </h2>
            <details className="group mt-5">
              <summary className="cursor-pointer list-none font-display text-sm font-semibold text-black marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-1 underline decoration-[#F5C6C6] underline-offset-4">
                  Premium details
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                Premium includes full access to all questions, explanations,
                quiz modes, and mock exams for your subscription period. Cancel
                anytime from your account settings.
              </p>
            </details>
          </div>

          <ul className="space-y-0 border border-black bg-white">
            {BENEFITS.map((item, i) => {
              const Icon = item.icon
              return (
                <li
                  key={item.text}
                  className={cn(
                    "flex gap-3 px-5 py-4",
                    i < BENEFITS.length - 1 && "border-b border-black"
                  )}
                >
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <p className="text-sm leading-relaxed text-neutral-700">
                    {item.text}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
        <p className="mx-auto mt-10 max-w-4xl font-mono text-[10px] leading-relaxed text-neutral-400">
          *Pass Guarantee applies to paid monthly and annual subscriptions where
          you have attempted all available questions and maintained at least an
          80% average score across practice quizzes. See terms for full
          eligibility.
        </p>
      </section>
    </div>
  )
}

export default function ChoosePlanPage() {
  return <ChoosePlanPageContent />
}
