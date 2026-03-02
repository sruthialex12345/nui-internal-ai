// Using the components already available in packages/ui/atoms
import { Button, Card } from "@repo/ui/atoms" 
import { Search, X, MessageCircle, Sparkles, Settings, HelpCircle, LogOut, Sliders, Info, Link, UserPlus, Pin, Archive, Flag, Trash2 } from "lucide-react"

interface PopUpProps {
  onClose: () => void;
  type: 'search' | 'profile' | 'share' | 'options';
}

export function PopUp({ onClose, type }: PopUpProps) {
  return (
    <div className={`fixed inset-0 z-50 flex ${
      type === 'profile' ? 'items-end justify-start p-4 pb-20' : 
      type === 'options' ? 'items-start justify-end p-4 pt-16' : 
      'items-start justify-center pt-20 bg-black/20 backdrop-blur-[2px]'
    }`}>
      {/* This Card comes from your packages/ui/atoms/Card.tsx */}
      <Card className={`${
        type === 'search' || type === 'share' ? 'w-full max-w-[640px]' : 'w-[240px]'
      } shadow-2xl border-none p-0 overflow-hidden bg-white rounded-2xl`}>
        
        {/* --- PROFILE CONTENT --- */}
        {type === 'profile' && (
          <div className="p-2 flex flex-col gap-1">
             <div className="flex items-center gap-3 p-3 border-b mb-1">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">RS</div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">RIXCY S</span>
                <span className="text-[10px] text-gray-400">@rixcyreshma</span>
              </div>
            </div>
            <ProfileItem icon={<Sparkles size={16} />} label="Upgrade plan" />
            <ProfileItem icon={<Settings size={16} />} label="Settings" />
            <ProfileItem icon={<LogOut size={16} />} label="Log out" />
          </div>
        )}

        {/* --- OPTIONS CONTENT (The 3 Dots) --- */}
        {type === 'options' && (
          <div className="p-2 flex flex-col gap-1">
            <ProfileItem icon={<Pin size={16} />} label="Pin chat" />
            <ProfileItem icon={<Archive size={16} />} label="Archive" />
            <div className="border-t my-1" />
            <ProfileItem icon={<Trash2 size={16} />} label="Delete" className="text-red-500" />
          </div>
        )}
      </Card>
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  )
}

function ProfileItem({ icon, label, className = "" }: { icon: React.ReactNode, label: string, className?: string }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${className}`}>
      {icon} <span className="text-sm font-medium">{label}</span>
    </div>
  )
}