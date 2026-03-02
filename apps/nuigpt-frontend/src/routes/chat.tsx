import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from "@repo/ui/atoms"
import { PopUp } from "../components/PopUp" 
import { Plus, PanelLeft, Share, MoreHorizontal, ChevronDown, MessageSquare, Search } from "lucide-react"

export const Route = createFileRoute('/chat')({
  component: ChatLayout,
})

function ChatLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activePop, setActivePop] = useState<'search' | 'profile' | 'share' | 'options' | null>(null)

  return (
    <div className="flex h-screen w-full bg-white text-[#0d0d0d] overflow-hidden relative">
      
      {/* SHARED POPUP FRAME */}
      {activePop && <PopUp type={activePop} onClose={() => setActivePop(null)} />}

      {/* SIDEBAR */}
      {isSidebarOpen && (
        <aside className="w-[260px] bg-[#f9f9f9] h-full flex flex-col border-r border-gray-200 shrink-0">
          <div className="p-3 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 px-1">
              <div className="w-6 h-6 bg-black rounded-full" />
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="h-8 w-8 text-gray-500 hover:bg-gray-200">
                <PanelLeft size={18} />
              </Button>
            </div>

            {/* TOP NAV: Only New Chat and Search */}
            <nav className="flex flex-col gap-1">
              <Button variant="ghost" className="justify-start gap-3 h-10 px-2 font-normal hover:bg-gray-200 rounded-lg">
                <Plus size={18} /> <span>New chat</span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setActivePop('search')}
                className="justify-start gap-3 h-10 px-3 font-normal bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl"
              >
                <Search size={18} /> <span>Search chats</span>
              </Button>
            </nav>

            {/* CHAT HISTORY */}
            <div className="mt-8 flex-1 overflow-y-auto px-1">
               <h3 className="text-[12px] text-gray-500 mb-2 px-2 font-medium">Your chats</h3>
               <div className="bg-[#ececec] p-2.5 rounded-xl text-[14px] font-medium flex items-center gap-2 cursor-pointer transition-colors">
                 <MessageSquare size={14} /> <span className="truncate">CRUD patient management</span>
               </div>
            </div>

            {/* PROFILE FOOTER */}
            <div className="mt-auto pt-4 border-t border-gray-100">
              <div 
                onClick={() => setActivePop('profile')}
                className="flex items-center justify-between p-1 hover:bg-gray-200 rounded-xl cursor-pointer"
              >
                <div className="flex items-center gap-2 p-1">
                  <div className="w-8 h-8 bg-[#5436DA] rounded-full flex items-center justify-center text-white text-xs font-bold">RX</div>
                  <span className="text-[13px] font-medium">RIXCY S</span>
                </div>
                <Button variant="outline" className="h-7 text-[11px] px-3 bg-white border-gray-200 rounded-lg shadow-sm">Upgrade</Button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative h-full">
        <header className="flex items-center justify-between p-3">
          <div className="flex items-center gap-1">
            {!isSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="mr-2">
                <PanelLeft size={20} />
              </Button>
            )}
            <div className="flex items-center gap-1 hover:bg-gray-100 p-2 px-3 rounded-xl cursor-pointer transition-colors">
              <span className="text-[18px] font-semibold text-gray-700">nui-bot</span>
              <ChevronDown size={16} className="text-gray-400 mt-1" />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" onClick={() => setActivePop('share')} className="gap-2 px-3 rounded-xl text-gray-600 hover:bg-gray-100">
              <Share size={18} />
              <span className="text-sm font-medium">Share</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActivePop('options')} 
              className="h-9 w-9 text-gray-600 rounded-xl hover:bg-gray-100"
            >
              <MoreHorizontal size={20} />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  )
}