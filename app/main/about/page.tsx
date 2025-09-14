import About from '@/components/screens/about'
import Semibottombar from '@/components/screens/semibottombar'
import React from 'react'

const page = () => {
  return (
    <div>
        <div className="w-full h-[30vh] flex flex-col justify-center items-center sm:bg-white lg:bg-[#FDFBFB]">
            <h1 className="text-3xl font-bold text-center text-slate-700">
                 About 
            </h1>
        </div>
        <About />
        <Semibottombar />
    </div>
  )
}

export default page