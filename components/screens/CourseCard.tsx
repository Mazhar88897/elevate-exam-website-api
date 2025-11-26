import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Highlight } from "@/components/pages/Highlight"
import { CustomButton } from "@/components/pages/CustomButton"
import { HoverCard } from "../pages/hoverCardHard"

interface CourseCardProps {
  title: string
  price: number
  image: string
  rating: number
  mentor: string
  tag: string
  tagColor: string
}

function CourseCard({ title, price, image, rating, mentor, tag, tagColor }: CourseCardProps) {
  return (
    <div className=" rounded-lg overflow-hidden flex flex-col h-full">
      
      <h3 className="p-2 text-lg font-bold mb-3">{title}</h3>
      
     

      <div className="p-2 flex flex-col flex-grow">
        {/* <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${i < rating ? "text-xcolor" : "text-gray-300"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div> */}

        <div className="flex justify-between items-start mb-3">
          
          <span className="text-xl font-bold">£{price.toFixed(2)}</span>
        </div>


        <div className="flex items-center text-sm text-gray-600 mb-4">
          <span className="mr-1">Domain :</span>
          <span>{mentor}</span>
        </div>
         <div className="mt-auto ">
         <Link href="#" className="mt-auto py-1  inline-flex items-center hover:border-blue-500  text-slate-700 text-sm font-medium border-b border-black">
         Learn More <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
    </div> 
       
      </div>
    </div>
  )
}

function StatItem({ number, text }: { number: string; text: string }) {
  return (
    <div className="border-b border-black py-3">
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-slate-700 ">{number}</span>
        <span className="text-slate-500 ml-2 text-sm lg:text-lg">{text}</span>
      </div>
    </div>
  )
}

export default function CourseShowcase() {
  return (
    <section className="py-16 px-8 ">
      <div className="container mx-auto max-w-6xl">
        <h2 className="font-semibold tracking-tight text-3xl text-slate-700 lg:text-5xl sm:text-4xl  mb-12 max-w-3xl ">
        Subscription <Highlight>Pricing Plans</Highlight>
        </h2>
        {/* Responsive Flex Layout */}
        <div className="flex flex-col lg:flex-row gap-8 py-3">
          {/* Pricing Cards Section */}
          <div className="flex-1 lg:flex-[2]">
            <div className="flex flex-col sm:flex-row gap-6 sm:justify-center lg:justify-start">
              <HoverCard width={250} height={300} className="p-4">
                <CourseCard
                  title="Monthly "
                  price={5.99}
                  image="/placeholder.svg?height=250&width=400"
                  rating={0}
                  mentor="IT & Cybersecurity"
                  tag="Java"
                  tagColor="bg-xcolor"
                />
              </HoverCard> 
              <HoverCard width={250} height={300} className="p-4">
                <CourseCard
                  title="Annual (save ~30%)"
                  price={79.0}
                  image="/placeholder.svg?height=250&width=400"
                  rating={4.5}
                  mentor="IT & Cybersecurity"
                  tag="Java"
                  tagColor="bg-xcolor"
                />
              </HoverCard>
            </div>
          </div>
          

          {/* Features and Info Section */}
          <div className="flex-1 lg:flex-[2] space-y-8">
            <div>
              <StatItem number="Cancel anytime" text="access continues until the end of your billing" />
              <StatItem number="Access to" text=" entire subscribed exam category" />
              <StatItem number="Exam-style" text=" interface" />
            </div>

            <div className="mt-5">
              <h3 className="text-lg text-slate-700 mb-2">Register for a login to start a <span className="font-bold">7-day limited-access trial</span></h3>
              <h3 className="text-lg text-slate-700 mb-2">Organisation bulk plans available—message us through
               <span className="font-bold"> Contact </span> to learn more. </h3>
           
              {/* <p className="text-slate-700 font-bold text-sm mb-4">Learn More</p> */}
              <CustomButton href="/courses" size="md">
                <p className="text-sm font-semibold">Try it now!</p>
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

