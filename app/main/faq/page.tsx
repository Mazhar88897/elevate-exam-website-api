import Faq from '@/components/screens/faq'
import Qouatation from '@/components/screens/Qouatation'
import React from 'react'

const page = () => {
  return (
    <div>
      <div className="w-full h-[30vh] flex flex-col justify-center items-center sm:bg-white lg:bg-[#FDFBFB]">
            <h1 className="text-3xl font-bold text-center text-slate-700">
                 Frequently Asked Questions 
            </h1>
        </div>
      <Faq />
      <Qouatation />
    </div>
  )
}

export default page