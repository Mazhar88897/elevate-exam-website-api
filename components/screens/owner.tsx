"use client"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { HoverCard } from "../pages/HoverCardBorder"
import { CustomButton } from "../pages/CustomButton"
import Lottie from 'lottie-react'
import { useEffect, useState } from 'react'

export default function Owner() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/Student transparent.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);
  return (
    <div className="max-w-7xl mx-auto py-3 my-6 ">
      <div className="flex flex-col md:flex-row items-center gap-8 rounded-lg overflow-hidden">
        <div className="flex-1 p-8">
          <div className="max-w-xl space-y-6">
            <h1 className="text-3xl md:text-3xl  font-semibold text-slate-800 leading-tight">
            Trusted by thousands of learners, Elevate Exams is designed to help you study smarter,
            practice better, and succeed. 
             
            </h1>
           
           <div className="py-3">
            <Link
              href="#"
              className="text-3xl md:text-3xl font-semibold text-blue-500 hover:text-blue-600 transition-colors"
            >
            Succeed with confidence
            </Link>
           </div>
            
            <h2 className="text-3xl md:text-3xl  font-semibold text-slate-800 leading-tight ">
            With focused tools like quizzes, flashcards, and exam prep resources, we make it simple
to master your subjects and approach every exam with confidence.

            </h2>
            
           
          </div>
        </div>
        <div className="flex-1  py-4 w-full flex text-center justify-center items-center ">
          {animationData && (
            <Lottie
              animationData={animationData}
              className="w-full h-full max-w-md"
              loop={true}
              autoplay={true}
            />
          )}
        </div> 
      </div>
    </div>
  )
}

