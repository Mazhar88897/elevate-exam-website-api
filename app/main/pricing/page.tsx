import PricingPlans from '@/components/screens/pricing'
import React from 'react'

const page = () => {
  return (
    <div>
        <div className="w-full h-[30vh] flex flex-col justify-center items-center sm:bg-white lg:bg-[#FDFBFB]">
            <h1 className="text-4xl font-bold text-center text-slate-700">
                 Pricing 
            </h1>
        </div>
        <PricingPlans />
    </div>
  )
}

export default page
