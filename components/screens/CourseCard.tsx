import Link from "next/link"
import { Check, X } from "lucide-react"
import { Highlight } from "@/components/pages/Highlight"
type PlanFeature = {
  label: string
  included: boolean
}

type Plan = {
  name: string
  price: number
  accent: "pink" | "blue" | "purple"
  highlighted?: boolean
  features: PlanFeature[]
}

const plans: Plan[] = [
  {
    name: "Beginner",
    price: 99,
    accent: "pink",
    features: [
      { label: "1 day access to the conference", included: true },
      { label: "Music, launch and snack", included: true },
      { label: "Meet Event Speaker", included: true },
      { label: "Live video online access", included: false },
      { label: "Get a certificate", included: false },
    ],
  },
  {
    name: "Premium",
    price: 149,
    accent: "blue",
    highlighted: true,
    features: [
      { label: "2 days access to the conference", included: true },
      { label: "Music, launch and snack", included: true },
      { label: "Meet Event Speaker", included: true },
      { label: "Live video online access", included: true },
      { label: "Get a certificate", included: false },
    ],
  },
  {
    name: "Advanced",
    price: 199,
    accent: "purple",
    features: [
      { label: "Full access to the conference", included: true },
      { label: "Music, launch and snack", included: true },
      { label: "Meet Event Speaker", included: true },
      { label: "Live video online access", included: true },
      { label: "Get a certificate", included: true },
    ],
  },
]

function getAccentClasses(accent: Plan["accent"], highlighted = false) {
  if (highlighted) {
    return {
      badge: "bg-white/20 text-white",
      header: "bg-indigo-400 text-white/95",
      headerPanel: " bg-indigo-700 border border-white/20 rounded-xl",
      body: "bg-indigo-400 text-white/95",
      check: "bg-white/20 text-white",
      close: "bg-white/15 text-white/80",
      button: "bg-white text-indigo-700 hover:bg-indigo-50",
    }
  }

  if (accent === "pink") {
    return {
      badge: "bg-pink-100 text-pink-600",
      header:   "bg-white",
      headerPanel: "bg-slate-100 border border-slate-200 rounded-xl",
      body: "bg-white text-slate-800",
      check: "bg-emerald-100 text-emerald-600",
      close: "bg-rose-100 text-rose-500",
      button: "bg-indigo-700 text-white hover:bg-indigo-800",
    }
  }

  return {
    badge: "bg-violet-100 text-violet-600",
    header: "bg-white",
    headerPanel: "bg-slate-100 border border-slate-200 rounded-xl",
    body: "bg-white text-slate-800",
    check: "bg-emerald-100 text-emerald-600",
    close: "bg-rose-100 text-rose-500",
    button: "bg-indigo-700 text-white hover:bg-indigo-800",
  }
}

function PricingCard({ plan }: { plan: Plan }) {
  const styles = getAccentClasses(plan.accent, plan.highlighted)
  const isCoupon = Boolean(plan.highlighted)

  return (
    <article
      className={`mx-auto flex min-h-[470px] w-full max-w-[290px] flex-col overflow-hidden rounded-xl border ${
        plan.highlighted ? "border-blue-400 shadow-xl" : "border-slate-200 shadow-sm"
      }`}
    >
      <div className={`relative p-4 ${styles.header}`}>
        <div className={`rounded-lg px-3 py-4 ${styles.headerPanel}`}>
          <div className="mb-4 flex justify-center">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}>{plan.name}</span>
          </div>
          <p className="text-center text-4xl font-bold">${plan.price.toFixed(2)}</p>
        </div>
      </div>

      {isCoupon && (
        <div className="relative bg-indigo-400 py-1.5">
          <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white" />
          <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white" />
          <div className="mx-4 border-t-4 border-dotted border-white/80" />
        </div>
      )}

      <div className={`flex flex-1 flex-col p-4 ${styles.body}`}>
        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li key={feature.label} className="flex items-center gap-2.5 text-sm">
              <span
                className={`inline-flex h-4.5 w-4.5 items-center justify-center rounded-full ${
                  feature.included ? styles.check : styles.close
                }`}
              >
                {feature.included ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              </span>
              <span className={feature.included ? "" : "opacity-70"}>{feature.label}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/main/courses"
          className={`mx-auto mt-6 inline-flex items-center rounded-full px-6 py-2 text-xs font-semibold transition-colors ${styles.button}`}
        >
          Choose Plan
        </Link>
      </div>
    </article>
  )
}

export default function CourseShowcase() {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="mx-auto mb-8 max-w-3xl text-center text-3xl font-semibold tracking-tight text-slate-900 lg:text-5xl">
          One Subscription.
          <br />
          All <Highlight >Courses</Highlight>
        </h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  )
}

