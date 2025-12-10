
"use client"
import Navbar from "@/components/screens/Navbar"
import Hero from "@/components/screens/hero"
import { CustomButton } from "@/components/pages/CustomButton"
import { Highlight } from "@/components/pages/Highlight"
import Footer from "@/components/screens/Footer"
import CourseShowcase from "@/components/screens/CourseCard"
import { HoverCard } from "@/components/pages/HoverCard"
import Accords from "@/components/screens/Accords"
import Qouatation from "@/components/screens/Qouatation"
import Blogs from "@/components/screens/Blogs"
import Owner from "@/components/screens/owner"
import Courses from "@/components/screens/courses"
import CoursesHeading from "@/components/screens/coursesHeading"
import Image from "next/image"
import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/elevateExams.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);

  return (
    <main className="">
      <div className="sticky top-0 z-50"><Navbar /></div>
      <div className="mt-10 lg:mt-44  lg:-translate-y-[150px]   w-full  justify-center items-center">
      
      {animationData && (
        <Lottie
          animationData={animationData}
          className="h-[500px] "
          loop={true}
          autoplay={true}
        />
      )}
                            
      </div>
      <Hero />
     
      
      



      <CoursesHeading />
      <Courses />
      <CourseShowcase />
      <Accords />
      <Qouatation />
      <Owner />
      {/* <Blogs /> */}
      <Footer />

    </main>
  )
}
