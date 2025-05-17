import React from 'react'
import { Brain } from 'lucide-react'

function Fallback() {
  return (
    <div className="h-svh bg-[#f7f7f7] flex flex-col items-center justify-start pt-20">
      <div className="flex items-center space-x-2">
        <Brain className="h-10 w-10 text-c-zinc animate-pulse" />
        <h1 className="text-2xl font-semibold text-c-zinc tracking-tight">ADHD SYMPTOM TRACKER</h1>
      </div>

      <div className="mt-6 w-8 h-8 border-4 border-gray-300 border-t-c-zinc rounded-full animate-spin" />
      
      <p className="mt-4 text-sm text-gray-500">Loading, please wait...</p>
    </div>
  )
}

export default Fallback
