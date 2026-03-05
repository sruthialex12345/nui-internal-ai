// import { createFileRoute } from "@tanstack/react-router";
// import { useState, useRef, useEffect } from "react";
// import { Button, Card } from "@repo/ui/atoms";
// import { ArrowUp, Paperclip } from "lucide-react";

// export const Route = createFileRoute("/chat/")({
//   component: ChatPage,
// });

// function ChatPage() {
//   const [text, setText] = useState("");
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
//     }
//   }, [text]);

//   return (
//     <div className="flex flex-col h-full items-center max-w-3xl mx-auto w-full px-4 relative pt-20">

//       <div className="flex-1 flex flex-col items-center justify-center opacity-10">

//         <div className="w-16 h-16 border border-gray-400 rounded-full flex items-center justify-center mb-4">
//           <div className="w-8 h-8 bg-black rounded-sm rotate-45" />
//         </div>
//         <h1 className="text-3xl font-semibold">How can I help you today?</h1>

//       </div>

//       <div className="w-full pb-8">

//         <Card className="bg-[#F4F4F4] border-none rounded-[28px] p-3 shadow-none focus-within:ring-1 ring-gray-200 transition-all">

//           <textarea
//             ref={textareaRef}
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//             placeholder="Message nui-bot"
//             rows={1}
//             className="w-full bg-transparent border-none outline-none text-black resize-none min-h-[44px] px-3 py-1 text-[16px] overflow-hidden"
//           />

//           <div className="flex justify-between items-center mt-2 px-1">

//             <Button
//               variant="ghost"
//               size="icon"
//               className="rounded-full h-9 w-9 text-gray-500"
//             >

//               <Paperclip size={20} />

//             </Button>

//             <Button
//               className={`rounded-full h-8 w-8 p-0 flex items-center justify-center ${text ? "bg-black" : "bg-[#E5E5E5]"}`}
//               disabled={!text}
//             >

//               <ArrowUp size={20} strokeWidth={3} />

//             </Button>

//           </div>

//         </Card>

//       </div>

//     </div>
//   );
// }


import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Plus, ArrowUp, X } from "lucide-react"; import { api } from "../lib/api";
import { useTheme } from "./chat";

export const Route = createFileRoute("/chat/")({
  component: ChatPage,
});

function ChatPage() {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { dark } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageMime, setImageMime] = useState<string>("image/png")

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    setImageMime(file.type)
    const reader = new FileReader()
    reader.onload = (e) => setImageBase64(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) handleImageFile(file)
        }
      }
    }
    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSend = async () => {
    if (!text.trim() && !imageBase64) return;
    const content = text.trim();
    const currentImage = imageBase64
    const currentMime = imageMime
    setText("");
    setImageBase64(null)
    try {
const chatRes = await api.post("/chats");
const chatId = chatRes.data.id;
if (currentImage) {
  sessionStorage.setItem("pendingImage", currentImage)
  sessionStorage.setItem("pendingMime", currentMime)
}
sessionStorage.setItem("pendingContent", content)
navigate({ to: "/chat/$chatId", params: { chatId } });
    } catch (err) {
      console.error("Error starting chat", err);
    }
  };

  return (
    <>
      <style>{`
        .ci-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-family: ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif;
  background: #ffffff;
  padding: 0 16px;
}
.ci-root.dark { background: #212121; }
.ci-root.dark .ci-greeting { color: #ececec; }
.ci-root.dark .ci-input-wrap { background: #2f2f2f; border-color: #3a3a3a; }
.ci-root.dark .ci-textarea { color: #ececec; }
.ci-root.dark .ci-textarea::placeholder { color: #6b6b6b; }
.ci-root.dark .ci-plus-btn { color: #8e8ea0; }
.ci-root.dark .ci-plus-btn:hover { background: #3a3a3a; color: #ececec; }
.ci-root.dark .ci-send-btn { background: #ececec; color: #0d0d0d; }
.ci-root.dark .ci-send-btn:disabled { background: #3a3a3a; color: #6b6b6b; }
.ci-root.dark .ci-disclaimer { color: #6b6b6b; }

        .ci-greeting {
          font-size: 28px;
          font-weight: 600;
          color: #0d0d0d;
          margin-bottom: 28px;
          text-align: center;
          letter-spacing: -0.3px;
        }

       .ci-input-wrap {
  width: 100%;
  max-width: 720px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 24px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: box-shadow 0.15s, border-color 0.15s;
}
.ci-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ci-img-preview {
  position: relative;
  display: inline-block;
  margin-left: 4px;
}
.ci-img-preview img {
  height: 60px;
  width: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e5e5e5;
  display: block;
}
.ci-img-preview-remove {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #0d0d0d;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
}
        .ci-input-wrap:focus-within {
          border-color: #c4c4c4;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .ci-plus-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b6b6b;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.12s;
        }
        .ci-plus-btn:hover { background: #f0f0f0; color: #0d0d0d; }

        .ci-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          font-size: 15px;
          font-family: inherit;
          color: #0d0d0d;
          line-height: 1.5;
          min-height: 24px;
          max-height: 180px;
          overflow-y: auto;
          padding: 0;
        }
        .ci-textarea::placeholder { color: #8e8ea0; }

        .ci-send-btn {
          background: #0d0d0d;
          border: none;
          cursor: pointer;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.12s;
        }
        .ci-send-btn:disabled {
          background: #e5e5e5;
          color: #acacac;
          cursor: default;
        }
        .ci-send-btn:not(:disabled):hover { background: #2a2a2a; }

        .ci-disclaimer {
          font-size: 12px;
          color: #8e8ea0;
          margin-top: 16px;
          text-align: center;
        }
      `}</style>

      <div className={`ci-root${dark ? " dark" : ""}`}>

        <h1 className="ci-greeting">What can I help with?</h1>


        <div className="ci-input-wrap">
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = "" }} />
          {imageBase64 && (
            <div className="ci-img-preview">
              <img src={imageBase64} alt="preview" />
              <button className="ci-img-preview-remove" onClick={() => setImageBase64(null)}>
                <X size={10} />
              </button>
            </div>
          )}
          <div className="ci-input-row">
            <button className="ci-plus-btn" onClick={() => fileInputRef.current?.click()}>
              <Plus size={18} />
            </button>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask anything"
              rows={1}
              className="ci-textarea"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              className="ci-send-btn"
              disabled={!text.trim() && !imageBase64}
              onClick={handleSend}
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <p className="ci-disclaimer">NUIGPT can make mistakes. Check important info.</p>
      </div>
    </>
  );
}
