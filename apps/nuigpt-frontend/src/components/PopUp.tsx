import React from "react";
import {
  Search,
  X,
  Sparkles,
  Settings,
  HelpCircle,
  LogOut,
  Sliders,
  Info,
  Link,
  UserPlus,
  Pin,
  Archive,
  Flag,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { Button, Card } from "@repo/ui/atoms";

interface PopUpProps {
  onClose: () => void;
  type: "search" | "profile" | "share" | "options";
  data?: string;
}

export function PopUp({ onClose, type, data }: PopUpProps) {
  // Define positioning based on type
  const containerClasses = {
    profile: "bottom-[72px] left-2.5",
    options: "top-14 right-4",
    search:
      "inset-0 items-start justify-center pt-20 bg-black/20 backdrop-blur-[2px]",
    share:
      "inset-0 items-start justify-center pt-20 bg-black/20 backdrop-blur-[2px]",
  };

  return (
    <div className={`absolute z-50 flex ${containerClasses[type]}`}>
            
      <Card
        className={`${
          type === "search" || type === "share"
            ? "w-full max-w-[640px]"
            : "w-[240px]"
        } shadow-2xl border border-gray-100 p-0 overflow-hidden bg-white rounded-2xl animate-in`}
      >
                {/* OPTIONS CONTENT */}
                
        {type === "options" && (
          <div className="p-1.5 flex flex-col gap-0.5">
                        
            <OptionItem
              icon={<UserPlus size={16} />}
              label="Start a group chat"
            />
                        
            <OptionItem icon={<Pin size={16} />} label="Pin chat" />
                        
            <OptionItem icon={<Archive size={16} />} label="Archive" />
                        
            <div className="border-t border-gray-50 my-1" />
                        
            <OptionItem
              icon={<Trash2 size={16} />}
              label="Delete"
              className="text-red-500 hover:bg-red-50"
            />
                      
          </div>
        )}
                {/* PROFILE CONTENT */}
                
        {type === "profile" && (
          <div className="p-1.5 flex flex-col gap-0.5">
                        
            <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-50 mb-1">
                            
              <div className="w-8 h-8 bg-[#5436DA] rounded-full flex items-center justify-center text-white text-[10px] shrink-0">
                RX
              </div>
                            
              <div className="flex flex-col min-w-0">
                                
                <span className="text-[13px] font-semibold truncate leading-none">
                  SRUTHI ALEX
                </span>
                                
                <span className="text-[11px] text-gray-400 truncate mt-1">
                  @rixcyreshma
                </span>
                              
              </div>
                          
            </div>
                        
            <OptionItem icon={<Sparkles size={15} />} label="Upgrade plan" />
                        
            <OptionItem icon={<Settings size={15} />} label="Settings" />
                        
            <div className="border-t border-gray-50 my-1" />
                        
            <OptionItem icon={<LogOut size={15} />} label="Log out" />
                      
          </div>
        )}
                {/* SEARCH CONTENT */}
                
        {type === "search" && (
          <div className="flex items-center p-4 gap-3">
                        
            <Search size={20} className="text-gray-400" />
                        
            <input
              autoFocus
              placeholder="Search chats..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
                        
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X size={16} />
            </Button>
                      
          </div>
        )}
                {/* SHARE CONTENT */}
                
        {type === "share" && (
          <div className="flex flex-col">
                        
            <div className="flex items-center justify-between px-6 py-5 border-b">
                            
              <h2 className="text-xl font-semibold text-gray-900">
                {data || "Share Chat"}
              </h2>
                            
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={20} />
              </Button>
                          
            </div>
                        
            <div className="p-6 space-y-6">
                            
              <div className="flex gap-3 p-4 bg-[#F4F4F4] rounded-2xl items-start text-sm text-gray-600">
                                
                <Info size={18} className="shrink-0 mt-0.5" />
                                
                <p>
                  Check content before sharing. It may include personal info.
                </p>
                              
              </div>
                            
              <Button className="w-full bg-black text-white rounded-xl py-6 flex gap-2 hover:bg-gray-800 transition-colors">
                                
                <Link size={18} /> Copy link               
              </Button>
                          
            </div>
                      
          </div>
        )}
              
      </Card>
            {/* Background overlay to close */}
            
      <div className="fixed inset-0 -z-10" onClick={onClose} />
          
    </div>
  );
}

function OptionItem({
  icon,
  label,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer group ${className}`}
    >
            
      <div className="text-gray-500 group-hover:text-current shrink-0">
        {icon}
      </div>
            
      <span className="text-[13px] font-medium text-gray-700 group-hover:text-current truncate">
        {label}
      </span>
          
    </div>
  );
}
