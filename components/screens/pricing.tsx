import { Check } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { CustomButton } from "@/components/pages/CustomButton"
import { Highlight } from "@/components/pages/Highlight"
import { HoverCard } from "../pages/HoverCard"
export default function PricingPlans() {
  const plans = [
    {
      name: "Monthly",
      price: "$5.99",
      features: [
        "Access to all courses",
        "Access to all quizzes",
        "Access to all practice exams",
        "Access to all flashcards",
        "Access to all notes",
      ],
      highlighted: false,
    },
    {
      name: "Annual (save ~30%)",
      price: "$42",
      features: [
        "Access to all courses",
        "Access to all quizzes",
        "Access to all practice exams",
        "Access to all flashcards",
        "Access to all notes",
      ],
      highlighted: true,
    },
   
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl mb-9 text-slate-700 font-semibold text-center">
        Choose Your <Highlight>Best Plan</Highlight>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {plans.map((plan, index) => (
            <HoverCard key={index}>
          <div  className="relative">
            {/* {plan.highlighted && <div className="absolute inset-0 -m-1.5 bg-slate-900 rounded-lg -z-10"></div>} */}
            <Card className={`h-full flex flex-col ${plan.highlighted ? "z-10" : ""}`}>
              <CardHeader className="pb-0">
                <h3 className="text-lg font-medium">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-blue-600">/Industry</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-4  w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col pt-0">
                <Link href="/main/courses">
                <CustomButton className="w-full "><p className="text-sm font-semibold">Explore Now</p></CustomButton>
                </Link>
                <p className="text-xs text-muted-foreground mt-4 text-center">* Tax & other services included.</p>
              </CardFooter>
            </Card>
          </div>
          </HoverCard>
        ))}
      </div>
    </div>
  )
}

