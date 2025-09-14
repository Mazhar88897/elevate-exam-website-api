import React from 'react'
import Contact from '@/components/screens/contact'
const page = () => {
  return (
    <div>
         <div className="w-full h-[30vh] flex flex-col justify-center items-center sm:bg-white lg:bg-[#FDFBFB]">
            <h1 className="text-3xl font-bold text-center text-slate-700">
                 Contact 
            </h1>
        </div>
        <Contact />
    </div>
  )
}

export default page