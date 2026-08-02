"use client"

const sliderNames = [
  "Instant Feedback",
  "No Auto-Renewal",
  "CISSP",
  "CISM",
  "CRISC",
  "ACCA",
  "CFA",
  "CIM",
  "Life in the UK",
  "IT Security",
]

export default function StripSlider() {
  const loopItems = [...sliderNames, ...sliderNames]

  return (
    <section className="w-full overflow-hidden bg-[#1A1A1A]">
      <div className="strip-track flex w-max items-stretch whitespace-nowrap">
        {loopItems.map((name, index) => (
          <span
            key={`${name}-${index}`}
            className="inline-flex items-center gap-3 border-r border-white/15 px-8 py-4 text-[15px] font-medium text-neutral-300"
          >
            {name}
            <span
              aria-hidden
              className="h-[7px] w-[7px] shrink-0 bg-neutral-300"
            />
          </span>
        ))}
      </div>

      <style jsx>{`
        .strip-track {
          animation: strip-loop 28s linear infinite;
          will-change: transform;
        }

        @keyframes strip-loop {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  )
}
