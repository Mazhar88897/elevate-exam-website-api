"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const Access = ({ hasAccess }: { hasAccess?: boolean }) => {
  if (hasAccess) return null

  return (
    <div className="mb-10 flex flex-col gap-4 border border-[#F0D4DC] bg-[#FDF2F7] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8">
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-lg font-bold tracking-tight text-black">
          All Access
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-neutral-600">
          Unlock every course on the platform — IT Security, Finance and
          Citizenship — and save £49.94 versus buying individually.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <p className="font-display text-2xl font-bold tracking-tight text-black">
          £79.99
        </p>
        <Link
          href="/payment/plan"
          className="inline-flex items-center gap-1.5 bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Get all access
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

export default Access
