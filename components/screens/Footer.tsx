"use client"

import Link from "next/link"

const links = [
  { label: "Blog", href: "/#blog" },
  { label: "Privacy", href: "/main/privacy-policy" },
  { label: "Terms", href: "/main/terms" },
  { label: "Contact", href: "/main/contact" },
]

export default function Footer() {
  return (
    <footer className="w-full bg-[#1A1A1A]">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-10 xl:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#F5C6C6] font-display text-[10px] font-bold tracking-tight text-black">
            EE
          </span>
          <span className="font-display text-sm font-bold tracking-tight text-white">
            Elevate Exams
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:ml-auto sm:mr-10">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs text-neutral-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-neutral-400 sm:shrink-0">
          © {new Date().getFullYear()} Elevate Exams
        </p>
      </div>
    </footer>
  )
}
