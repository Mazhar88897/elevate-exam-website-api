"use client"

import { Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "Passed CISSP first attempt. The domain breakdown after each practice quiz told me exactly where I was weak — I focused my last two weeks entirely on Security Architecture and it paid off.",
    initials: "JM",
    name: "James M.",
    title: "CISSP, IT Security Manager",
  },
  {
    quote:
      "The mock exam mode is genuinely close to the real thing. Timed, no hints, full length. By the time I sat CRISC I'd already felt that pressure twice and knew exactly how to pace myself.",
    initials: "AK",
    name: "Aisha K.",
    title: "CRISC, Risk Analyst",
  },
  {
    quote:
      "I revise on my commute. Flashcards on the train, full quizzes at the weekend. Being able to pick up exactly where I left off made it actually fit into a busy schedule.",
    initials: "DT",
    name: "Daniel T.",
    title: "CISM, Security Consultant",
  },
]

export default function Testimonials() {
  return (
    <section className="w-full bg-white px-6 py-14 lg:px-10 lg:py-16 xl:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-[#C97878]" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97878]">
              What students say
            </p>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Real results,
            <br />
            real feedback.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="flex flex-col border border-black p-6"
            >
              <div className="flex items-center gap-0.5 text-black">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-black" />
                ))}
              </div>

              <p className="mt-4 flex-1 text-sm italic leading-relaxed text-neutral-700">
                “{item.quote}”
              </p>

              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                  {item.initials}
                </span>
                <div>
                  <p className="text-sm font-bold text-black">{item.name}</p>
                  <p className="text-xs text-neutral-400">{item.title}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
