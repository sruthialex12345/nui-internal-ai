import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Search, Share, MoreHorizontal } from "lucide-react"
import { Button } from "@repo/ui/atoms" 
import { PopUp } from "../components/PopUp"

export const Route = createFileRoute('/chat')({
  component: ChatPage,
})

function ChatPage() {
  const [activePopUp, setActivePopUp] = useState<any>(null)

  return (
    <div className="flex h-screen w-full relative">
      {activePopUp && <PopUp type={activePopUp} onClose={() => setActivePopUp(null)} />}
      {/* ... rest of your UI code from App.tsx ... */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl text-gray-400">Chat Interface Ready</h1>
      </div>
    </div>
  )
}