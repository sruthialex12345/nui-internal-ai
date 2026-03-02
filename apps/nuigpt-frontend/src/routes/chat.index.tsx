import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { Button, Card } from "@repo/ui/atoms";
import { ArrowUp, Paperclip } from "lucide-react";

export const Route = createFileRoute('/chat/')({
  component: ChatPage,
});

function ChatPage() {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="flex flex-col h-full items-center max-w-3xl mx-auto w-full px-4 relative pt-20">
      <div className="flex-1 flex flex-col items-center justify-center opacity-10">
         <div className="w-16 h-16 border border-gray-400 rounded-full flex items-center justify-center mb-4">
           <div className="w-8 h-8 bg-black rounded-sm rotate-45" />
         </div>
         <h1 className="text-3xl font-semibold">How can I help you today?</h1>
      </div>

      <div className="w-full pb-8">
        <Card className="bg-[#f4f4f4] border-none rounded-[28px] p-3 shadow-none focus-within:ring-1 ring-gray-200 transition-all">
          <textarea 
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message nui-bot"
            rows={1}
            className="w-full bg-transparent border-none outline-none text-black resize-none min-h-[44px] px-3 py-1 text-[16px] overflow-hidden"
          />
          <div className="flex justify-between items-center mt-2 px-1">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-gray-500">
              <Paperclip size={20} />
            </Button>
            <Button 
              className={`rounded-full h-8 w-8 p-0 flex items-center justify-center ${text ? 'bg-black' : 'bg-[#e5e5e5]'}`}
              disabled={!text}
            >
              <ArrowUp size={20} strokeWidth={3} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}