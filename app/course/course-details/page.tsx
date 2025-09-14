"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Play, Clock, FileStack } from "lucide-react"
import Image from "next/image"
import { Megaphone } from "lucide-react";
import Access from "@/components/dashboardItems/access";
import Link from "next/link";
export default function CoursePage() {
  const [activeTab, setActiveTab] = useState<"about" | "announcement">("about")
  const [expandedChapter, setExpandedChapter] = useState<number | null>(3)

  const toggleChapter = (index: number) => {
    if (expandedChapter === index) {
      setExpandedChapter(null)
    } else {
      setExpandedChapter(index)
    }
  }

  return (
    <div className="px-3">
     <div className="px-5   py-5 md:pt-0">
    {/* <Access /> */}
    </div>
    <div className="flex flex-col md:flex-row  min-h-screen">
   
      <div className="flex-1 px-4">
        <div className="mb-4">
          <h1 className="text-lg font-black ">Explore the Gemini API</h1>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mt-1">
            <span className="flex items-center mr-4 font-bold">
            <Clock className="w-4 h-4 mr-1" strokeWidth={3} />

              Total 20 questions
            </span>
            <span className="flex items-center font-bold">
            <FileStack className="w-4 h-4 mr-1" strokeWidth={3} />
              7 Chapters
            </span>
          </div>
        </div>

        <div className="h-64 rounded-lg overflow-hidden mb-6 border-">
          <div className="aspect-video flex items-center justify-center">
            <Image
              src="/animation.png"
              alt="Course video thumbnail"
              width={500}
              height={260}
              className="w-full h-full object-cover opacity-70"
            />
            {/* <div className="absolute inset-0 flex items-center justify-center">
              <button className="bg-white rounded-full p-3 shadow-lg">
                <Play className="w-8 h-8 text-gray-800 fill-current" />
              </button>
            </div> */}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActiveTab("about")}
              className={`px-4 text-xs py-2 rounded-mid ${
                activeTab === "about" ? "bg-[#ffd404] text-white" : "bg-[#f0f0ff]  text-[#ffd404]"
              }`}
            >
             <p className="font-bold text-xs"> About the Course</p>
            </button>
            <button
              onClick={() => setActiveTab("announcement")}
              className={`px-4 text-xs py-2 rounded-md ${
                activeTab === "announcement" ? "bg-[#ffd404] text-white" : "bg-[#f0f0ff] text-[#ffd404]"
              }`}
            >
              <p className="font-bold text-xs">Announcement</p>
            </button>
          </div>

          {activeTab === "about" && (
            <div className=" border-2 p-6 rounded-mid shadow-sm">
              <h2 className="text-md font-bold mb-4">About the Course</h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                Colab notebooks allow you to combine executable code and rich text in a single document, along with
                images, HTML, LaTeX and more. When you create your own Colab notebooks, they are stored in your Google
                Drive account. You can easily share your Colab notebooks with co-workers or friends, allowing them to
                comment on your notebooks or even edit them.
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                Colab notebooks allow you to combine executable code and rich text in a single document, along with
                images, HTML, LaTeX and more. When you create your own Colab notebooks, they are stored in your Google
                Drive account.
              </p>

              <h3 className="text-md font-bold mt-6 mb-4">What will you learn here</h3>
              <ul className="text-gray-700 dark:text-gray-300 text-sm">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-800 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Go to Google AI Studio and try working with your Google account.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-800 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Go to Google AI Studio and try working with your Google account.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-800 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Go to Google AI Studio and try working with your Google account.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-800 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Go to Google AI Studio and try working with the code and tools.
                  </span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === "announcement" && (
            <div className=" p-6 border-2 rounded-mid shadow-sm">
              <h2 className="text-md font-bold mb-4">Announcement</h2>

              <div className="space-y-4">
                <div className=" p-4 rounded-mid">
             
                    

                    
                    <div className="flex ">
                    <Megaphone className="w-5 h-5 mr-2" strokeWidth={3} />
                      <h3 className="font-bold text-gray-900 dark:text-gray-300">Do you know ?</h3>
                     
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        Colab notebooks with co-workers or friends, allowing them to comment on your notebooks or even
                        edit them.
                      </p>
                
                </div>

                <div className="p-4 rounded-mid">
             
                    

                    
                    <div className="flex ">
                    <Megaphone className="w-5 h-5 mr-2" strokeWidth={3} />
                      <h3 className="font-bold text-gray-900 dark:text-gray-300">Do you know ?</h3>
                     
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        Colab notebooks with co-workers or friends, allowing them to comment on your notebooks or even
                        edit them.
                      </p>
                
                </div><div className=" p-4 rounded-mid">
             
                    

                    
             <div className="flex ">
             <Megaphone className="w-5 h-5 mr-2" strokeWidth={3} />
               <h3 className="font-bold text-gray-900 dark:text-gray-300">Do you know ?</h3>
              
             </div>
             
             <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                 Colab notebooks with co-workers or friends, allowing them to comment on your notebooks or even
                 edit them.
               </p>
         
         </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full   h-full sm:h-[100vh ] mb-10 md:w-96 py-4 border-2 dark:border-gray-800  border-gray-200">
        <div className=" rounded-lg shadow-sm p-4">
          <h2 className="font-bold text-md mb-4">Course Content & Chapters</h2>

          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7].map((chapter, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
                <button
                  onClick={() => toggleChapter(index)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <span className="text-sm font-bold ">
                    {index < 3
                      ? `01 Intro`
                      : index === 3
                        ? `04 Introduction to gemini`
                        : index === 4
                          ? `01 Introduction`
                          : index === 5
                            ? `01 Introduction`
                            : index === 6
                              ? `01 Introduction`
                              : `01 Intro`}
                  </span>
                  {expandedChapter === index ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {expandedChapter === index  && (
                  <div className="p-3 bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-gray-800">
                    <ul className="space-y-2 text-sm font font-semibold text-slate-600 dark:text-slate-100">
                      <li>01 Introduction</li>
                      <li>02 Introduction</li>
                      <li>03 Introduction</li>
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* <Link href="/pages/exam" className="w-full mt-6 bg-[#35821B] text-white py-2 rounded-mid font-semibold text-sm flex items-center justify-center">
            Start Course 
            <svg className="w-4 h-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link> */}
        </div>
      </div>
    </div>
    </div>
  )
}
