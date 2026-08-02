"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const exams = [
  { code: "CISSP", label: "CISSP", href: "/free-questions/cissp" },
  { code: "CISM", label: "CISM", href: "/free-questions/cism" },
  { code: "CRISC", label: "CRISC", href: "/free-questions/crisc" },
]

const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#FAFAFA]">
      {/* Soft atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_15%_20%,rgba(245,198,198,0.35),transparent_55%),radial-gradient(ellipse_70%_50%_at_90%_70%,rgba(245,198,198,0.18),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col items-center gap-12 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-10 lg:py-16 xl:px-12">
        {/* Left copy */}
        <motion.div
          className="w-full max-w-xl shrink-0"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display text-[2.75rem] font-bold leading-[0.95] tracking-[-0.03em] text-black sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            PASS EVERY
            <br />
            EXAM YOU
            <br />
            <span className="relative inline-block">
              ATTEMPT.
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#F5C6C6] sm:-bottom-2 sm:h-1"
              />
            </span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-relaxed text-neutral-500 sm:text-[1.05rem]">
            Professional exam preparation across IT security, finance and
            citizenship certifications. Domain tracking, instant feedback,
            explanations by certified professionals.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/#courses"
              className="inline-flex items-center gap-2 bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Browse courses
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center border border-black bg-white px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-50"
            >
              Register free
            </Link>
          </div>
        </motion.div>

        {/* Right product visual */}
        <motion.div
          className="relative w-full max-w-md lg:max-w-lg"
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -1 }}
          transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="overflow-hidden border-2 border-black bg-white shadow-[0_24px_64px_-16px_rgba(0,0,0,0.18)]"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-3 bg-[#2A2A2A] px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              </div>
              <p className="flex-1 text-center font-mono text-[11px] tracking-wide text-neutral-400 sm:text-xs">
                Try a free 10-question demo
              </p>
              <div className="w-10" aria-hidden />
            </div>

            {/* Window body */}
            <div className="bg-white px-4 py-5 sm:px-5 sm:py-6">
              <div className="mb-4 flex items-center gap-3 font-mono text-[11px] tracking-widest sm:text-xs">
                <span className="inline-flex items-center gap-1.5 border-2 border-black px-2 py-1 font-semibold text-black">
                  ← BACK
                </span>
                <span className="font-semibold text-neutral-400">IT SECURITY</span>
              </div>

              <ul className="space-y-2">
                {exams.map((exam, i) => (
                  <motion.li
                    key={exam.code}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.45 + i * 0.1,
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      href={exam.href}
                      className="group flex items-center gap-2.5 border-2 border-black bg-white px-2.5 py-2 transition-colors hover:bg-neutral-50"
                    >
                      <span className="inline-flex shrink-0 items-center justify-center border-2 border-black px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight text-black">
                        {exam.code}
                      </span>
                      <span className="flex-1 font-mono text-xs font-bold tracking-wide text-black sm:text-[13px]">
                        {exam.label}
                      </span>
                      <span className="font-mono text-sm text-black transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
