"use client"

const steps = [
  {
    step: "01",
    label: "Register",
    title: "Create your account",
    description:
      "Free to register. Browse courses and find the certification you’re targeting first. No card needed.",
  },
  {
    step: "02",
    label: "Purchase",
    title: "Buy a course or bundle",
    description:
      "Individual courses or category bundles. One payment. No subscription.",
  },
  {
    step: "03",
    label: "Practice",
    title: "Work by domain",
    description:
      "Questions organised by exam domain. Instant feedback and explanations after every answer.",
  },
  {
    step: "04",
    label: "Track",
    title: "Follow your progress",
    description:
      "Domain-by-domain scoring shows exactly where you’re strong and where to focus next.",
  },
]

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-t border-black bg-[#F7F7F7] px-6 py-10 lg:px-10 lg:py-12 xl:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400">
            — How it works
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight text-black sm:text-3xl">
            Simple.{" "}
            <span className="inline-block bg-black px-2 py-0.5 text-white">
              No surprises.
            </span>
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <article
              key={item.step}
              className="border border-neutral-200 bg-white p-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#C97878]">
                {item.step} / {item.label}
              </p>
              <h3 className="mt-2.5 font-display text-[15px] font-bold tracking-tight text-black">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
