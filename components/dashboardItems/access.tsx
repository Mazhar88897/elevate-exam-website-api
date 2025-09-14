import React from 'react'
import { ChevronLeft, ChevronRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
const Access = () => {
  return (
    <div>
       <div className="bg-[#f0f0ff]   rounded-mid px-3 py-2 mb-8 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center gap-3  sm:mb-0">
            <Lock className="h-5 w-5 text-[#ffd404]  " />
            <p className="text-xs dark:text-black md:text-sm font-bold">Unlock access to all the material and the AI Chatbot</p>
          </div>
          <Button className="bg-[#ffd404] hidden sm:block hover:bg-[#ffd404] w-full text-sm font-bold dark:text-white sm:w-auto rounded-mid">Unlock Access</Button>
        </div>
    </div>
  )
}

export default Access
