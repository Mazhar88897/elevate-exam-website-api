// import React from 'react'
// import { CustomButton } from "@/components/pages/CustomButton"
// import { Highlight } from "@/components/pages/Highlight"
// const hero = () => {
//   return (
//     <div  className="w-full sm:h-full lg:h-[70vh] justify-center  p-8 sm:bg-white lg:bg-[#FDFBFB]">
//       <div className=" h-full  lg:pt-3 sm:pt-3 max-w-6xl  mx-auto flex flex-col-reverse md:flex-row gap-8 items-center">
//   <div className=" lg:mt-5 sm:mt-0 space-y-6">
//     <p className="Stext-sm text-muted-foreground leading-relaxed">
//       Lorem ipsum dolor sit ametis consectetur adipiscing elit sedao eiusmod tempor.
//     </p>

//     <CustomButton href="/get-started">
//       <p className='text-sm font-semibold'>Get Started</p>
//     </CustomButton>
//   </div>

//   <div className=' w-full mx-0 lg:mx-10'>
//     <h1 className="text-3xl md:text-4xl lg:text-6xl  font-semibold tracking-tight text-slate-700">
//       Learn <Highlight>Coding Online</Highlight> With Professional Instructors
//     </h1>
//   </div>
// </div></div>
//   )
// }

// export default hero

import React from 'react'
import { CustomButton } from "@/components/pages/CustomButton"
import { Highlight } from "@/components/pages/Highlight"

const hero = () => {
  return (
    <div className="w-full min-h-[70vh] flex items-center justify-start p-8 bg-white lg:bg-[#FDFBFB]">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-start text-left space-y-8">
          {/* Main heading */}
          <div className="w-full max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-semibold tracking-tight text-slate-700 leading-tight">
            Elevate <Highlight> Your Learning </Highlight>
            </h1>
          </div>
          
          {/* Description and CTA */}
          <div className="flex flex-col items-start space-y-6 max-w-2xl">
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor.
            </p>
            
            <CustomButton href="/auth/sign-up" size="lg">
              <span className="text-sm font-semibold">Get Started</span>
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default hero