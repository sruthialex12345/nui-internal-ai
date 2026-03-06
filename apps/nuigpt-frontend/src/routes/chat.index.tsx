

// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import { useState, useRef, useEffect } from "react";
// import { Plus, ArrowUp, X } from "lucide-react"; import { api } from "../lib/api";
// import { useTheme } from "./chat";

// export const Route = createFileRoute("/chat/")({
//   component: ChatPage,
// });

// function ChatPage() {
//   const [text, setText] = useState("");
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const navigate = useNavigate();
//   const { dark } = useTheme()
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const [imageBase64, setImageBase64] = useState<string | null>(null)
//   const [imageMime, setImageMime] = useState<string>("image/png")

//   const handleImageFile = (file: File) => {
//     if (!file.type.startsWith("image/")) return
//     setImageMime(file.type)
//     const reader = new FileReader()
//     reader.onload = (e) => setImageBase64(e.target?.result as string)
//     reader.readAsDataURL(file)
//   }

//   useEffect(() => {
//     const handlePaste = (e: ClipboardEvent) => {
//       const items = e.clipboardData?.items
//       if (!items) return
//       for (const item of Array.from(items)) {
//         if (item.type.startsWith("image/")) {
//           const file = item.getAsFile()
//           if (file) handleImageFile(file)
//         }
//       }
//     }
//     window.addEventListener("paste", handlePaste)
//     return () => window.removeEventListener("paste", handlePaste)
//   }, [])

//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
//     }
//   }, [text]);

//   const handleSend = async () => {
//     if (!text.trim() && !imageBase64) return;
//     const content = text.trim();
//     const currentImage = imageBase64
//     const currentMime = imageMime
//     setText("");
//     setImageBase64(null)
//     try {
// const chatRes = await api.post("/chats");
// const chatId = chatRes.data.id;
// if (currentImage) {
//   sessionStorage.setItem("pendingImage", currentImage)
//   sessionStorage.setItem("pendingMime", currentMime)
// }
// sessionStorage.setItem("pendingContent", content)
// navigate({ to: "/chat/$chatId", params: { chatId } });
//     } catch (err) {
//       console.error("Error starting chat", err);
//     }
//   };

//   return (
//     <>
//       <style>{`
//         .ci-root {
//   display: flex;
//   flex-direction: column;
//   height: 100%;
//   align-items: center;
//   justify-content: center;
//   font-family: ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif;
//   background: #ffffff;
//   padding: 0 16px;
// }
// .ci-root.dark { background: #212121; }
// .ci-root.dark .ci-greeting { color: #ececec; }
// .ci-root.dark .ci-input-wrap { background: #2f2f2f; border-color: #3a3a3a; }
// .ci-root.dark .ci-textarea { color: #ececec; }
// .ci-root.dark .ci-textarea::placeholder { color: #6b6b6b; }
// .ci-root.dark .ci-plus-btn { color: #8e8ea0; }
// .ci-root.dark .ci-plus-btn:hover { background: #3a3a3a; color: #ececec; }
// .ci-root.dark .ci-send-btn { background: #ececec; color: #0d0d0d; }
// .ci-root.dark .ci-send-btn:disabled { background: #3a3a3a; color: #6b6b6b; }
// .ci-root.dark .ci-disclaimer { color: #6b6b6b; }

//         .ci-greeting {
//           font-size: 28px;
//           font-weight: 600;
//           color: #0d0d0d;
//           margin-bottom: 28px;
//           text-align: center;
//           letter-spacing: -0.3px;
//         }

//        .ci-input-wrap {
//   width: 100%;
//   max-width: 720px;
//   background: #ffffff;
//   border: 1px solid #e5e5e5;
//   border-radius: 24px;
//   padding: 10px 14px;
//   display: flex;
//   flex-direction: column;
//   gap: 8px;
//   box-shadow: 0 1px 4px rgba(0,0,0,0.06);
//   transition: box-shadow 0.15s, border-color 0.15s;
// }
// .ci-input-row {
//   display: flex;
//   align-items: center;
//   gap: 10px;
// }
// .ci-img-preview {
//   position: relative;
//   display: inline-block;
//   margin-left: 4px;
// }
// .ci-img-preview img {
//   height: 60px;
//   width: 60px;
//   border-radius: 8px;
//   object-fit: cover;
//   border: 1px solid #e5e5e5;
//   display: block;
// }
// .ci-img-preview-remove {
//   position: absolute;
//   top: -5px;
//   right: -5px;
//   background: #0d0d0d;
//   border: none;
//   border-radius: 50%;
//   width: 18px;
//   height: 18px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   cursor: pointer;
//   color: white;
// }
//         .ci-input-wrap:focus-within {
//           border-color: #c4c4c4;
//           box-shadow: 0 2px 8px rgba(0,0,0,0.08);
//         }

//         .ci-plus-btn {
//           background: none;
//           border: none;
//           cursor: pointer;
//           color: #6b6b6b;
//           width: 28px;
//           height: 28px;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//           transition: background 0.12s;
//         }
//         .ci-plus-btn:hover { background: #f0f0f0; color: #0d0d0d; }

//         .ci-textarea {
//           flex: 1;
//           background: transparent;
//           border: none;
//           outline: none;
//           resize: none;
//           font-size: 15px;
//           font-family: inherit;
//           color: #0d0d0d;
//           line-height: 1.5;
//           min-height: 24px;
//           max-height: 180px;
//           overflow-y: auto;
//           padding: 0;
//         }
//         .ci-textarea::placeholder { color: #8e8ea0; }

//         .ci-send-btn {
//           background: #0d0d0d;
//           border: none;
//           cursor: pointer;
//           color: white;
//           width: 36px;
//           height: 36px;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//           transition: background 0.12s;
//         }
//         .ci-send-btn:disabled {
//           background: #e5e5e5;
//           color: #acacac;
//           cursor: default;
//         }
//         .ci-send-btn:not(:disabled):hover { background: #2a2a2a; }

//         .ci-disclaimer {
//           font-size: 12px;
//           color: #8e8ea0;
//           margin-top: 16px;
//           text-align: center;
//         }
//       `}</style>

//       <div className={`ci-root${dark ? " dark" : ""}`}>

//         <h1 className="ci-greeting">What can I help with?</h1>


//         <div className="ci-input-wrap">
//           <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = "" }} />
//           {imageBase64 && (
//             <div className="ci-img-preview">
//               <img src={imageBase64} alt="preview" />
//               <button className="ci-img-preview-remove" onClick={() => setImageBase64(null)}>
//                 <X size={10} />
//               </button>
//             </div>
//           )}
//           <div className="ci-input-row">
//             <button className="ci-plus-btn" onClick={() => fileInputRef.current?.click()}>
//               <Plus size={18} />
//             </button>
//             <textarea
//               ref={textareaRef}
//               value={text}
//               onChange={(e) => setText(e.target.value)}
//               placeholder="Ask anything"
//               rows={1}
//               className="ci-textarea"
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && !e.shiftKey) {
//                   e.preventDefault();
//                   handleSend();
//                 }
//               }}
//             />
//             <button
//               className="ci-send-btn"
//               disabled={!text.trim() && !imageBase64}
//               onClick={handleSend}
//             >
//               <ArrowUp size={18} strokeWidth={2.5} />
//             </button>
//           </div>
//         </div>

//         <p className="ci-disclaimer">NUIGPT can make mistakes. Check important info.</p>
//       </div>
//     </>
//   );
// }





// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import { useState, useRef, useEffect } from "react";
// import { Plus, ArrowUp, Globe, X, Paperclip, Check } from "lucide-react";
// import { api } from "../lib/api";
// import { useTheme } from "./chat";

// export const Route = createFileRoute("/chat/")({
//   component: ChatPage,
// });

// function ChatPage() {
//   const [text, setText] = useState("");
//   const [deepResearch, setDeepResearch] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [imageBase64, setImageBase64] = useState<string | null>(null);
//   const [imageMime, setImageMime] = useState<string>("image/png");

//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const menuRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const navigate = useNavigate();
//   const { dark } = useTheme();

//   // ── Handle image file ────────────────────────────────────────────────────
//   const handleImageFile = (file: File) => {
//     if (!file.type.startsWith("image/")) return;
//     setImageMime(file.type);
//     const reader = new FileReader();
//     reader.onload = (e) => setImageBase64(e.target?.result as string);
//     reader.readAsDataURL(file);
//   };

//   // ── Paste image support ──────────────────────────────────────────────────
//   useEffect(() => {
//     const handlePaste = (e: ClipboardEvent) => {
//       const items = e.clipboardData?.items;
//       if (!items) return;
//       for (const item of Array.from(items)) {
//         if (item.type.startsWith("image/")) {
//           const file = item.getAsFile();
//           if (file) handleImageFile(file);
//         }
//       }
//     };
//     window.addEventListener("paste", handlePaste);
//     return () => window.removeEventListener("paste", handlePaste);
//   }, []);

//   // ── Auto-resize textarea ─────────────────────────────────────────────────
//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
//     }
//   }, [text]);

//   // ── Close menu on outside click ──────────────────────────────────────────
//   useEffect(() => {
//     const handleClick = (e: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
//         setMenuOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
//   }, []);

//   // ── Send ─────────────────────────────────────────────────────────────────
//   const handleSend = async () => {
//     if (!text.trim() && !imageBase64) return;
//     const content = text.trim();
//     const currentImage = imageBase64;
//     const currentMime = imageMime;
//     setText("");
//     setImageBase64(null);
//     try {
//       const chatRes = await api.post("/chats");
//       const chatId = chatRes.data.id;
//       // Pass image via sessionStorage (picked up by chat.$chatId init)
//       if (currentImage) {
//         sessionStorage.setItem("pendingImage", currentImage);
//         sessionStorage.setItem("pendingMime", currentMime);
//       }
//       sessionStorage.setItem("pendingContent", content);
//       // Pass deepResearch flag via navigate search params
//       navigate({ to: "/chat/$chatId", params: { chatId }, search: { deepResearch } });
//     } catch (err) {
//       console.error("Error starting chat", err);
//     }
//   };

//   return (
//     <>
//       <style>{`
//         .ci-root {
//           display: flex;
//           flex-direction: column;
//           height: 100%;
//           align-items: center;
//           justify-content: center;
//           font-family: ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif;
//           background: #ffffff;
//           padding: 0 16px;
//         }
//         .ci-root.dark { background: #212121; }
//         .ci-root.dark .ci-greeting { color: #ececec; }
//         .ci-root.dark .ci-input-wrap { background: #2f2f2f; border-color: #3a3a3a; }
//         .ci-root.dark .ci-textarea { color: #ececec; }
//         .ci-root.dark .ci-textarea::placeholder { color: #6b6b6b; }
//         .ci-root.dark .ci-plus-btn { color: #8e8ea0; }
//         .ci-root.dark .ci-plus-btn:hover,
//         .ci-root.dark .ci-plus-btn.open { background: #3a3a3a; color: #ececec; }
//         .ci-root.dark .ci-send-btn { background: #ececec; color: #0d0d0d; }
//         .ci-root.dark .ci-send-btn:disabled { background: #3a3a3a; color: #6b6b6b; }
//         .ci-root.dark .ci-disclaimer { color: #6b6b6b; }
//         .ci-root.dark .ci-menu { background: #2f2f2f; border-color: #3a3a3a; box-shadow: 0 4px 20px rgba(0,0,0,0.35); }
//         .ci-root.dark .ci-menu-item { color: #ececec; }
//         .ci-root.dark .ci-menu-item:hover { background: #3a3a3a; }
//         .ci-root.dark .ci-menu-item.selected { color: #60a5fa; }
//         .ci-root.dark .ci-menu-item.selected:hover { background: #1e3a5f; }
//         .ci-root.dark .ci-menu-divider { border-color: #3a3a3a; }
//         .ci-root.dark .ci-badge { background: #1e3a5f; color: #60a5fa; border-color: #3b82f6; }
//         .ci-root.dark .ci-badge:hover { background: #1a3050; }
//         .ci-root.dark .ci-badge-x { background: #2d5a9e; color: #60a5fa; }
//         .ci-root.dark .ci-img-preview img { border-color: #3a3a3a; }

//         .ci-greeting {
//           font-size: 28px;
//           font-weight: 600;
//           color: #0d0d0d;
//           margin-bottom: 28px;
//           text-align: center;
//           letter-spacing: -0.3px;
//         }

//         .ci-input-wrap {
//           width: 100%;
//           max-width: 720px;
//           background: #ffffff;
//           border: 1px solid #e5e5e5;
//           border-radius: 24px;
//           padding: 10px 14px;
//           display: flex;
//           flex-direction: column;
//           gap: 8px;
//           box-shadow: 0 1px 4px rgba(0,0,0,0.06);
//           transition: box-shadow 0.15s, border-color 0.15s;
//         }
//         .ci-input-wrap:focus-within { border-color: #c4c4c4; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

//         /* Image preview */
//         .ci-img-preview {
//           position: relative;
//           display: inline-block;
//           margin-left: 4px;
//         }
//         .ci-img-preview img {
//           height: 60px;
//           width: 60px;
//           border-radius: 8px;
//           object-fit: cover;
//           border: 1px solid #e5e5e5;
//           display: block;
//         }
//         .ci-img-preview-remove {
//           position: absolute;
//           top: -5px;
//           right: -5px;
//           background: #0d0d0d;
//           border: none;
//           border-radius: 50%;
//           width: 18px;
//           height: 18px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           cursor: pointer;
//           color: white;
//         }

//         .ci-textarea-row { display: flex; align-items: center; gap: 10px; }

//         .ci-textarea {
//           flex: 1;
//           background: transparent;
//           border: none;
//           outline: none;
//           resize: none;
//           font-size: 15px;
//           font-family: inherit;
//           color: #0d0d0d;
//           line-height: 1.5;
//           min-height: 24px;
//           max-height: 180px;
//           overflow-y: auto;
//           padding: 0;
//         }
//         .ci-textarea::placeholder { color: #8e8ea0; }

//         .ci-bottom-row { display: flex; align-items: center; justify-content: space-between; }
//         .ci-left-tools { display: flex; align-items: center; gap: 6px; }

//         /* Plus button */
//         .ci-plus-btn {
//           background: none;
//           border: none;
//           cursor: pointer;
//           color: #6b6b6b;
//           width: 30px;
//           height: 30px;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//           transition: background 0.12s, color 0.12s, transform 0.15s;
//         }
//         .ci-plus-btn:hover { background: #f0f0f0; color: #0d0d0d; }
//         .ci-plus-btn.open { background: #f0f0f0; color: #0d0d0d; transform: rotate(45deg); }

//         /* Popup menu */
//         .ci-menu-wrap { position: relative; }
//         .ci-menu {
//           position: absolute;
//           bottom: calc(100% + 10px);
//           left: 0;
//           background: #ffffff;
//           border: 1px solid #e5e5e5;
//           border-radius: 14px;
//           padding: 6px;
//           min-width: 220px;
//           box-shadow: 0 4px 20px rgba(0,0,0,0.12);
//           z-index: 50;
//           animation: ci-pop 0.13s ease;
//         }
//         @keyframes ci-pop {
//           from { opacity: 0; transform: translateY(6px) scale(0.97); }
//           to   { opacity: 1; transform: translateY(0) scale(1); }
//         }
//         .ci-menu-item {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 10px;
//           width: 100%;
//           padding: 9px 12px;
//           border-radius: 8px;
//           border: none;
//           background: none;
//           cursor: pointer;
//           font-family: inherit;
//           font-size: 14px;
//           text-align: left;
//           color: #0d0d0d;
//           transition: background 0.1s;
//         }
//         .ci-menu-item:hover { background: #f5f5f5; }
//         .ci-menu-item.selected { color: #2563eb; }
//         .ci-menu-item.selected:hover { background: #eff6ff; }
//         .ci-menu-item-left { display: flex; align-items: center; gap: 10px; }
//         .ci-menu-divider { border: none; border-top: 1px solid #f0f0f0; margin: 4px 0; }

//         /* Active badge */
//         .ci-badge {
//           display: flex;
//           align-items: center;
//           gap: 5px;
//           background: #eff6ff;
//           color: #2563eb;
//           border: 1px solid #bfdbfe;
//           border-radius: 20px;
//           padding: 3px 8px;
//           font-size: 13px;
//           font-weight: 500;
//           font-family: inherit;
//           cursor: pointer;
//           transition: background 0.12s;
//           height: 26px;
//           white-space: nowrap;
//         }
//         .ci-badge:hover { background: #dbeafe; }
//         .ci-badge-x {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 16px;
//           height: 16px;
//           border-radius: 50%;
//           background: #bfdbfe;
//           color: #2563eb;
//           margin-left: 2px;
//           flex-shrink: 0;
//           transition: background 0.1s;
//         }
//         .ci-badge:hover .ci-badge-x { background: #93c5fd; }

//         /* Send button */
//         .ci-send-btn {
//           background: #0d0d0d;
//           border: none;
//           cursor: pointer;
//           color: white;
//           width: 36px;
//           height: 36px;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//           transition: background 0.12s;
//         }
//         .ci-send-btn:disabled { background: #e5e5e5; color: #acacac; cursor: default; }
//         .ci-send-btn:not(:disabled):hover { background: #2a2a2a; }

//         .ci-disclaimer { font-size: 12px; color: #8e8ea0; margin-top: 16px; text-align: center; }
//       `}</style>

//       {/* Hidden image file input */}
//       <input
//         ref={fileInputRef}
//         type="file"
//         accept="image/*"
//         style={{ display: "none" }}
//         onChange={(e) => {
//           const f = e.target.files?.[0];
//           if (f) handleImageFile(f);
//           e.target.value = "";
//         }}
//       />

//       <div className={`ci-root${dark ? " dark" : ""}`}>
//         <h1 className="ci-greeting">What can I help with?</h1>

//         <div className="ci-input-wrap">

//           {/* Image preview */}
//           {imageBase64 && (
//             <div className="ci-img-preview">
//               <img src={imageBase64} alt="preview" />
//               <button className="ci-img-preview-remove" onClick={() => setImageBase64(null)}>
//                 <X size={10} />
//               </button>
//             </div>
//           )}

//           {/* Textarea row */}
//           <div className="ci-textarea-row">
//             <textarea
//               ref={textareaRef}
//               value={text}
//               onChange={(e) => setText(e.target.value)}
//               placeholder="Ask anything"
//               rows={1}
//               className="ci-textarea"
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && !e.shiftKey) {
//                   e.preventDefault();
//                   handleSend();
//                 }
//               }}
//             />
//           </div>

//           {/* Bottom toolbar */}
//           <div className="ci-bottom-row">
//             <div className="ci-left-tools">

//               {/* Plus button + popup menu */}
//               <div className="ci-menu-wrap" ref={menuRef}>
//                 <button
//                   className={`ci-plus-btn${menuOpen ? " open" : ""}`}
//                   onClick={() => setMenuOpen((p) => !p)}
//                   title="Attach / options"
//                 >
//                   <Plus size={18} />
//                 </button>

//                 {menuOpen && (
//                   <div className="ci-menu">
//                     {/* Add photos & files → opens image picker */}
//                     <button
//                       className="ci-menu-item"
//                       onClick={() => { setMenuOpen(false); fileInputRef.current?.click(); }}
//                     >
//                       <div className="ci-menu-item-left">
//                         <Paperclip size={16} color="#6b6b6b" />
//                         Add photos &amp; files
//                       </div>
//                     </button>

//                     <hr className="ci-menu-divider" />

//                     {/* Deep Research toggle */}
//                     <button
//                       className={`ci-menu-item${deepResearch ? " selected" : ""}`}
//                       onClick={() => { setDeepResearch((p) => !p); setMenuOpen(false); }}
//                     >
//                       <div className="ci-menu-item-left">
//                         <Globe size={16} color={deepResearch ? "#2563eb" : "#6b6b6b"} />
//                         Deep Research
//                       </div>
//                       {deepResearch && <Check size={15} color="#2563eb" strokeWidth={2.5} />}
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Blue badge when deep research is active */}
//               {deepResearch && (
//                 <button
//                   className="ci-badge"
//                   onClick={() => setDeepResearch(false)}
//                   title="Remove deep research"
//                 >
//                   <Globe size={13} />
//                   Research
//                   <span className="ci-badge-x">
//                     <X size={10} strokeWidth={2.5} />
//                   </span>
//                 </button>
//               )}

//             </div>

//             <button
//               className="ci-send-btn"
//               disabled={!text.trim() && !imageBase64}
//               onClick={handleSend}
//             >
//               <ArrowUp size={18} strokeWidth={2.5} />
//             </button>
//           </div>
//         </div>

//         <p className="ci-disclaimer">NUIGPT can make mistakes. Check important info.</p>
//       </div>
//     </>
//   );
// }






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