import Courses from '@/components/screens/courses'
import React from 'react'
import { Highlight } from '@/components/pages/Highlight'
export default function page()   {
  return (
      <div className="container mx-auto  py-16 max-w-7xl">
         <div className="mb-12 px-4 text-center">
           <h2 className="text-4xl font-bold text-[#111827] inline-block relative">
             
             Courses & <Highlight>Domains</Highlight> 
             
           </h2>
           <p></p>
         </div>
        <Courses />
    </div>
  )
}

