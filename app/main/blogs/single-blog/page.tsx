import { HoverCard } from "@/components/pages/HoverCard"
import LeaveReply from "@/components/screens/LeaveReply"
import { Heart, Star, Share2, Clock } from "lucide-react"
import Link from "next/link"

export default function BlogPostHeader() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex border-b border-black flex-col">
        <div className="flex gap-6">
          {/* Left sidebar with action buttons */}
          <div className="flex flex-col gap-4">
            <HoverCard><button className="w-12 h-12 flex items-center justify-center bg-slate-900 text-white rounded">
              <Heart className="w-5 h-5" />
            </button></HoverCard>
            <HoverCard>
            <button className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded">
              <Star className="w-5 h-5 text-slate-900" />
            </button>
            </HoverCard>
            <HoverCard>
            <button className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded">
              <Share2 className="w-5 h-5 text-slate-900" />
            </button>
            </HoverCard>
          
          </div>

          {/* Main content */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900 mb-6">
              How To Become A WordPress Plugin & Theme Developer
            </h1>

            <div className="flex items-center gap-6 mb-8 text-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-blue-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <Link href="#" className=" ">
                  John Doe
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>April 18, 2022</span>
              </div>
            </div>

            <div className="text-slate-600 leading-relaxed">
              <p className="mb-4 text-sm">
                Proin ullamcorper pretium orci. Donec nec scelerisque leo. Nam massa dolor, imperdiet nec consequat a,
                congue id sem. Maecenas male suada faucibus finibus. Donec vitae libero porttitor, laoreet sapien a,
                ultrices leo. Duis dictum vestibulum ante vitae ullamcorper.
              </p>
              <p className="text-sm">
                Phasellus ullam corper, odio vitae eleifend ultricies, lectus orci congue magna, in egestas nulla libero
                non nisl. Etiam efficitur in arcuut odio vitae eleifend ultricies, lectus orci congue magna in egestas
                nulla.
              </p>
            </div>
          </div>
        </div>

        {/* Additional content */}
        <div className="mt-8 flex gap-6">
          <div className="flex-1">
            <div className="text-slate-600 leading-relaxed mb-10">
              <p className="mb-4 text-sm">
                Proin ullamcorper pretium orci. Donec nec scelerisque leo. Nam massa dolor, imperdiet nec consequat a,
                congue id sem. Maecenas malesuada faucibus finibus. Donec vitae libero porttitor, laoreet sapien a,
                ultrices leo. Duis dictum vestibulum ante vitae ullamcorper. Phasellus ullamcorper, odio vitae eleifend
                ultricies, lectus orci congue magna, in egestas nulla libero non nisl. Etiam efficitur in arcu ut
                lacinia eleifend ultricies.
              </p>
              <p className="mb-4 text-sm">
                Donec scelerisque enim non dictum aliquet. Sed ec nunc. Suspendisse volutpat elit nec nisi congue
                tristique eu at velit. Curabitur pharetra ex non ullamcorper condimentum. Suspendisse volutpat elit nec
                nisi congue tristique eu at velit.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">5 Programming Languages That Are Popular Today</h2>
            <p className="text-slate-600 leading-relaxed text-sm mb-10">
              Proin ullamcorper pretium orci. Donec nec scelerisque leo. Nam massa dolor, imperdiet nec consequat a,
              congue id sem. Maecenas malesuada faucibus finibus. Donec vitae libero porttitor, laoreet sapien a,
              ultrices leo. Duis dictum vestibulum ante vitae ullamcorper. Phasellus ullamcorper, odio vitae eleifend
              ultricies, lectus orci congue magna, in egestas nulla libero non nisl. Etiam efficitur in arcu ut lacinia.
            </p>

            <div className="flex flex-col md:flex-row gap-8 mb-10">
              <div className="md:w-1/2">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Everything About Courses</h2>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                    <span className="text-slate-600">Animated Learning Videos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                    <span className="text-slate-600">Practice Questions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                    <span className="text-slate-600">Infographic Summary</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                    <span className="text-slate-600">Lifetime Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                    <span className="text-slate-600">Study With A Live Tutor</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <img
                  src="/placeholder.svg?height=200&width=350"
                  alt="Person coding on computer"
                  className="w-full h-auto rounded border border-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-6  ">
              <span className="mr-2">
                <Share2 className="w-5 h-5 text-slate-600" />
              </span>
              <HoverCard>
              <a href="#" className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-700"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              </HoverCard>
              <HoverCard>
              <a href="#" className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-700"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              </HoverCard>
              <HoverCard>
              <a href="#" className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-700"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </a>
              </HoverCard>
              <HoverCard>
              <a href="#" className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-700"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              </HoverCard>
            </div>
          </div>

          <div className="hidden md:block w-64 shrink-0">
            <div className="p-6 bg-gray-50 rounded">
              <p className="text-slate-500 text-sm italic">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam quis nostrud.
              </p>
            </div>
          </div>
        </div>
      </div>
      <LeaveReply />
    </div>
  )
}

  