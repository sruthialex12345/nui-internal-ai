import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Plus, ArrowUp, Globe, X, Paperclip, Check } from "lucide-react";
import { api } from "../lib/api";
import { useTheme } from "./chat";

export const Route = createFileRoute("/chat/")({
  component: ChatPage,
});

function ChatPage() {
  const [text, setText] = useState("");
  const [deepResearch, setDeepResearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/png");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { dark } = useTheme();

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (e) => setImageBase64(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleImageFile(file);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSend = async () => {
    if (!text.trim() && !imageBase64) return;
    const content = text.trim();
    const currentImage = imageBase64;
    const currentMime = imageMime;
    setText("");
    setImageBase64(null);
    try {
      const chatRes = await api.post("/chats");
      const chatId = chatRes.data.id;
      if (currentImage) {
        sessionStorage.setItem("pendingImage", currentImage);
        sessionStorage.setItem("pendingMime", currentMime);
      }
      sessionStorage.setItem("pendingContent", content);
      navigate({
        to: "/chat/$chatId",
        params: { chatId },
        search: { deepResearch },
      });
    } catch (err) {
      console.error("Error starting chat", err);
    }
  };

  return (
    <div
      className={`flex flex-col h-full items-center justify-center font-sans px-4 ${dark ? "bg-[#212121]" : "bg-white"}`}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImageFile(f);
          e.target.value = "";
        }}
      />

      <h1
        className={`text-[28px] font-semibold mb-7 text-center tracking-[-0.3px] ${dark ? "text-[#ececec]" : "text-[#0d0d0d]"}`}
      >
        What can I help with?
      </h1>

      {/* Input wrap */}
      <div
        className={`w-full max-width-[720px] max-w-[720px] border rounded-3xl px-3.5 py-2.5 flex flex-col gap-2 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.08)] ${
          dark
            ? "bg-[#2f2f2f] border-[#3a3a3a] focus-within:border-[#4a4a4a]"
            : "bg-white border-[#e5e5e5] focus-within:border-[#c4c4c4]"
        }`}
      >
        {/* Image preview */}
        {imageBase64 && (
          <div className="relative inline-block ml-1">
            <img
              src={imageBase64}
              alt="preview"
              className={`h-[60px] w-[60px] rounded-lg object-cover block border ${dark ? "border-[#3a3a3a]" : "border-[#e5e5e5]"}`}
            />
            <button
              onClick={() => setImageBase64(null)}
              className="absolute -top-1.5 -right-1.5 bg-[#0d0d0d] border-none rounded-full w-[18px] h-[18px] flex items-center justify-center cursor-pointer text-white"
            >
              <X size={10} />
            </button>
          </div>
        )}

        {/* Textarea row */}
        <div className="flex items-center gap-2.5">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask anything"
            rows={1}
            className={`flex-1 bg-transparent border-none outline-none resize-none text-[15px] font-[inherit] leading-[1.5] min-h-6 max-h-[180px] overflow-y-auto p-0 ${dark ? "text-[#ececec] placeholder:text-[#6b6b6b]" : "text-[#0d0d0d] placeholder:text-[#8e8ea0]"}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Plus button + popup menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((p) => !p)}
                title="Attach / options"
                className={`w-[30px] h-[30px] rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-150 ${
                  menuOpen
                    ? dark
                      ? "bg-[#3a3a3a] text-[#ececec] rotate-45"
                      : "bg-[#f0f0f0] text-[#0d0d0d] rotate-45"
                    : dark
                      ? "text-[#8e8ea0] hover:bg-[#3a3a3a] hover:text-[#ececec]"
                      : "text-[#6b6b6b] hover:bg-[#f0f0f0] hover:text-[#0d0d0d]"
                }`}
                style={{
                  transform: menuOpen ? "rotate(45deg)" : "rotate(0deg)",
                }}
              >
                <Plus size={18} />
              </button>

              {menuOpen && (
                <div
                  className={`absolute bottom-[calc(100%+10px)] left-0 border rounded-[14px] p-1.5 min-w-[220px] z-50 shadow-[0_4px_20px_rgba(0,0,0,0.12)] animate-in ${dark ? "bg-[#2f2f2f] border-[#3a3a3a] shadow-[0_4px_20px_rgba(0,0,0,0.35)]" : "bg-white border-[#e5e5e5]"}`}
                >
                  <button
                    className={`flex items-center justify-between gap-2.5 w-full px-3 py-[9px] rounded-lg border-none cursor-pointer font-[inherit] text-sm text-left transition-colors ${dark ? "text-[#ececec] hover:bg-[#3a3a3a]" : "text-[#0d0d0d] hover:bg-[#f5f5f5]"}`}
                    onClick={() => {
                      setMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Paperclip size={16} className="text-[#6b6b6b]" />
                      Add photos &amp; files
                    </div>
                  </button>

                  <hr
                    className={`border-none border-t my-1 ${dark ? "border-[#3a3a3a]" : "border-[#f0f0f0]"}`}
                    style={{ borderTopWidth: 1 }}
                  />

                  <button
                    className={`flex items-center justify-between gap-2.5 w-full px-3 py-[9px] rounded-lg border-none cursor-pointer font-[inherit] text-sm text-left transition-colors ${
                      deepResearch
                        ? dark
                          ? "text-[#60a5fa] hover:bg-[#1e3a5f]"
                          : "text-[#2563eb] hover:bg-[#eff6ff]"
                        : dark
                          ? "text-[#ececec] hover:bg-[#3a3a3a]"
                          : "text-[#0d0d0d] hover:bg-[#f5f5f5]"
                    }`}
                    onClick={() => {
                      setDeepResearch((p) => !p);
                      setMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe
                        size={16}
                        className={
                          deepResearch
                            ? dark
                              ? "text-[#60a5fa]"
                              : "text-[#2563eb]"
                            : "text-[#6b6b6b]"
                        }
                      />
                      Deep Research
                    </div>
                    {deepResearch && (
                      <Check
                        size={15}
                        className={dark ? "text-[#60a5fa]" : "text-[#2563eb]"}
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Deep research badge */}
            {deepResearch && (
              <button
                onClick={() => setDeepResearch(false)}
                title="Remove deep research"
                className={`flex items-center gap-1.5 border rounded-full px-2 py-[3px] text-[13px] font-medium font-[inherit] cursor-pointer transition-colors h-[26px] whitespace-nowrap ${
                  dark
                    ? "bg-[#1e3a5f] text-[#60a5fa] border-[#3b82f6] hover:bg-[#1a3050]"
                    : "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe] hover:bg-[#dbeafe]"
                }`}
              >
                <Globe size={13} />
                Research
                <span
                  className={`flex items-center justify-center w-4 h-4 rounded-full ml-0.5 flex-shrink-0 ${dark ? "bg-[#2d5a9e] text-[#60a5fa]" : "bg-[#bfdbfe] text-[#2563eb]"}`}
                >
                  <X size={10} strokeWidth={2.5} />
                </span>
              </button>
            )}
          </div>

          <button
            disabled={!text.trim() && !imageBase64}
            onClick={handleSend}
            className={`w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer flex-shrink-0 transition-colors ${
              !text.trim() && !imageBase64
                ? dark
                  ? "bg-[#3a3a3a] text-[#6b6b6b] cursor-default"
                  : "bg-[#e5e5e5] text-[#acacac] cursor-default"
                : dark
                  ? "bg-[#ececec] text-[#0d0d0d] hover:bg-[#d4d4d4]"
                  : "bg-[#0d0d0d] text-white hover:bg-[#2a2a2a]"
            }`}
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <p
        className={`text-xs mt-4 text-center ${dark ? "text-[#6b6b6b]" : "text-[#8e8ea0]"}`}
      >
        NUIGPT can make mistakes. Check important info.
      </p>
    </div>
  );
}
