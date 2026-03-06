// import { createFileRoute } from '@tanstack/react-router'
// import { useEffect, useState, useRef } from 'react'
// import { api } from '../lib/api'
// import { useTheme } from './chat'
// import { Plus, ArrowUp, Copy, Check, Code2, Square, RotateCcw, Pencil, Globe, X, Paperclip } from 'lucide-react'
// import ReactMarkdown from 'react-markdown'
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

// export const Route = createFileRoute('/chat/$chatId')({
//   component: ChatPage,
//   validateSearch: (search: Record<string, unknown>) => ({
//     deepResearch: search.deepResearch === true || search.deepResearch === 'true',
//   }),
// })

// function ChatPage() {
//   const { chatId } = Route.useParams()
//   const { deepResearch: initialDeepResearch } = Route.useSearch()
//   const [messages, setMessages] = useState<any[]>([])
//   const [input, setInput] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [deepResearch, setDeepResearch] = useState(initialDeepResearch)
//   const [menuOpen, setMenuOpen] = useState(false)
//   const [imageBase64, setImageBase64] = useState<string | null>(null)
//   const [imageMime, setImageMime] = useState<string>("image/png")
//   const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({})
//   const [editingId, setEditingId] = useState<string | null>(null)
//   const [editText, setEditText] = useState("")
  

//   const bottomRef = useRef<HTMLDivElement>(null)
//   const textareaRef = useRef<HTMLTextAreaElement>(null)
//   const menuRef = useRef<HTMLDivElement>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const abortControllerRef = useRef<AbortController | null>(null)
//   const initFiredRef = useRef(false)
//   const sessionImageRef = useRef<{ base64: string; mime: string } | null>(null)

//   const { dark } = useTheme()

//   // ── Handle image file selection ──────────────────────────────────────────
//   const handleImageFile = (file: File) => {
//     if (!file.type.startsWith("image/")) return
//     setImageMime(file.type)
//     const reader = new FileReader()
//     reader.onload = (e) => setImageBase64(e.target?.result as string)
//     reader.readAsDataURL(file)
//   }

//   // ── Close menu on outside click ──────────────────────────────────────────
//   useEffect(() => {
//     const handleClick = (e: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
//         setMenuOpen(false)
//       }
//     }
//     document.addEventListener("mousedown", handleClick)
//     return () => document.removeEventListener("mousedown", handleClick)
//   }, [])

//   // ── Paste image support ──────────────────────────────────────────────────
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

//   const stopGeneration = () => {
//     abortControllerRef.current?.abort()
//     setLoading(false)
//   }

//   // ── Shared SSE streaming helper ──────────────────────────────────────────
//   const streamAI = async (
//     useDeepResearch: boolean,
//     imgBase64?: string | null,
//     imgMime?: string,
//   ) => {
//     const token = localStorage.getItem("token")
//     abortControllerRef.current = new AbortController()
//     const response = await fetch(`http://localhost:3000/ai/respond`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         chatId,
//         deepResearch: useDeepResearch,
//         imageBase64: imgBase64 ?? null,
//         imageMime: imgMime ?? "image/png",
//       }),
//       signal: abortControllerRef.current.signal,
//     })

//     const reader = response.body!.getReader()
//     const decoder = new TextDecoder()
//     let aiMessage = ""

//     while (true) {
//       const { done, value } = await reader.read()
//       if (done) break
//       const text = decoder.decode(value)
//       const lines = text.split("\n").filter(l => l.startsWith("data: "))
//       for (const line of lines) {
//         const data = line.replace("data: ", "").trim()
//         try {
//           const parsed = JSON.parse(data)
//           if (parsed.done) break
//           if (parsed.delta) {
//             aiMessage += parsed.delta
//             setMessages(prev =>
//               prev.map(m => m.id === "ai-stream" ? { ...m, content: aiMessage } : m)
//             )
//           }
//         } catch { }
//       }
//     }
//   }

//   // ── Regenerate ───────────────────────────────────────────────────────────
//   const regenerate = async () => {
//     if (loading) return
//     setLoading(true)
//     setMessages(prev => {
//       const idx = [...prev].reverse().findIndex(m => m.role === "ASSISTANT")
//       if (idx === -1) return prev
//       const realIdx = prev.length - 1 - idx
//       return prev.slice(0, realIdx)
//     })
//     try {
//       setMessages(prev => [...prev, { id: "ai-stream", role: "ASSISTANT", content: "" }])
//       await streamAI(deepResearch, sessionImageRef.current?.base64, sessionImageRef.current?.mime)
//       await loadMessages()
//     } catch (err: any) {
//       if (err?.name !== "AbortError") console.error("Regenerate error")
//       await loadMessages()
//     } finally {
//       setLoading(false)
//     }
//   }

//   const copyCode = (code: string, id: string) => {
//     navigator.clipboard.writeText(code)
//     setCopiedMap(prev => ({ ...prev, [id]: true }))
//     setTimeout(() => setCopiedMap(prev => ({ ...prev, [id]: false })), 2000)
//   }

//   // ── Init: load messages + handle pending content from landing page ────────
//   useEffect(() => {
//     initFiredRef.current = false
//     const init = async () => {
//       if (initFiredRef.current) return
//       initFiredRef.current = true
//       try {
//         const pendingContent = sessionStorage.getItem("pendingContent")
//         sessionStorage.removeItem("pendingContent")

//         if (pendingContent !== null && pendingContent.trim() !== "") {
//           await api.post("/messages", { chatId, role: "USER", content: pendingContent })
//         } else if (pendingContent !== null && pendingContent.trim() === "") {
//           await api.post("/messages", { chatId, role: "USER", content: "What is in this image?" })
//         }

//         const res = await api.get(`/messages?chatId=${chatId}`)
//         setMessages(res.data)

//       const last = res.data[res.data.length - 1]
// if (last?.role === "USER" && pendingContent !== null) {
//           const pendingImage = sessionStorage.getItem("pendingImage")
//           const pendingMime = sessionStorage.getItem("pendingMime") ?? "image/png"
//           sessionStorage.removeItem("pendingImage")
//           sessionStorage.removeItem("pendingMime")

//           if (pendingImage) {
//             sessionImageRef.current = { base64: pendingImage, mime: pendingMime }
//             setMessages(prev => prev.map((m, i) =>
//               i === prev.length - 1 ? { ...m, imageBase64: pendingImage } : m
//             ))
//           }

//           setLoading(true)
//           setMessages(prev => [...prev, { id: "ai-stream", role: "ASSISTANT", content: "" }])
//           await streamAI(deepResearch, pendingImage, pendingMime)
//           await loadMessages()
//         }
//       } catch (err: any) {
//         if (err?.name !== "AbortError") console.error("Init error")
//         await loadMessages()
//       } finally {
//         setLoading(false)
//       }
//     }
//     init()
//   }, [chatId])

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [messages])

//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto"
//       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
//     }
//   }, [input])

//   // ── Load messages (preserving local imageBase64 on temp messages) ─────────
//   const loadMessages = async () => {
//     try {
//       const res = await api.get(`/messages?chatId=${chatId}`)
//       setMessages(prev => {
//         const imageMapById: Record<string, string> = {}
//         const imageMapByContent: Record<string, string> = {}
//         prev.forEach(m => {
//           if (m.imageBase64) {
//             imageMapById[m.id] = m.imageBase64
//             imageMapByContent[m.content?.trim()] = m.imageBase64
//           }
//         })
//         return res.data.map((m: any) => ({
//           ...m,
//           imageBase64: imageMapById[m.id] ?? imageMapByContent[m.content?.trim()] ?? m.imageBase64
//         }))
//       })
//     } catch (err) {
//       console.error("Error loading messages")
//     }
//   }

//   // ── Save edit ────────────────────────────────────────────────────────────
//   const saveEdit = async (msgId: string) => {
//     if (!editText.trim()) return
//     setEditingId(null)
//     try {
//       await api.patch(`/messages/${msgId}`, { content: editText.trim() })
//       const res = await api.get(`/messages?chatId=${chatId}`)
//       const msgs: any[] = res.data
//       const editedIdx = msgs.findIndex(m => m.id === msgId)
//       const msgsAfter = msgs.slice(editedIdx + 1)
//       for (const m of msgsAfter) {
//         await api.delete(`/messages/${m.id}`)
//         console.log("Deleted message:", m.id, m.role)
//       }
//       await new Promise(resolve => setTimeout(resolve, 300))
//       setMessages(msgs.slice(0, editedIdx + 1))
//       setLoading(true)
//       setMessages(prev => [...prev, { id: "ai-stream", role: "ASSISTANT", content: "" }])
//       await streamAI(deepResearch, sessionImageRef.current?.base64, sessionImageRef.current?.mime)
//       await loadMessages()
//     } catch (err: any) {
//       if (err?.name !== "AbortError") console.error("Edit error")
//       await loadMessages()
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ── Send message ─────────────────────────────────────────────────────────
//   const sendMessage = async () => {
//     if ((!input.trim() && !imageBase64) || loading) return
//     const content = input.trim()
//     const currentImage = imageBase64
//     const currentMime = imageMime
//     const currentDeepResearch = deepResearch 

//     if (currentImage) {
//       sessionImageRef.current = { base64: currentImage, mime: currentMime }
//     }
//     const imageToSend = currentImage ?? sessionImageRef.current?.base64 ?? null
//     const mimeToSend = currentMime ?? sessionImageRef.current?.mime ?? "image/png"

//     const url = new URL(window.location.href)
//   url.searchParams.delete('deepResearch')
//   window.history.replaceState({}, '', url.toString())

//     setInput("")
//     setImageBase64(null)
//     setDeepResearch(false)
//     setLoading(true)

//     const tempMsg = { id: "temp-" + Date.now(), role: "USER", content, imageBase64: currentImage }
//     setMessages(prev => [...prev, tempMsg])

//     try {
//       await api.post("/messages", { chatId, role: "USER", content })
//       setMessages(prev => [...prev, { id: "ai-stream", role: "ASSISTANT", content: "" }])
//       await streamAI(currentDeepResearch, imageToSend, mimeToSend)
//       await loadMessages()
//       setLoading(false)
//     } catch (err: any) {
//       if (err?.name !== "AbortError") console.error("Error sending message")
//       await loadMessages()
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <>
//       <style>{`
//         .ca-root {
//           display: flex;
//           flex-direction: column;
//           height: 100%;
//           background: #ffffff;
//           font-family: ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif;
//         }
//         .ca-root.dark { background: #212121; }
//         .ca-root.dark .ca-bubble-user { background: #2f2f2f; color: #ececec; }
//         .ca-root.dark .ca-bubble-ai { color: #ececec; }
//         .ca-root.dark .ca-bubble-ai code { background: #2f2f2f; color: #ececec; }
//         .ca-root.dark .ca-input-area { background: #212121; }
//         .ca-root.dark .ca-input-wrap { background: #2f2f2f; border-color: #3a3a3a; }
//         .ca-root.dark .ca-textarea { color: #ececec; }
//         .ca-root.dark .ca-plus-btn { color: #8e8ea0; }
//         .ca-root.dark .ca-plus-btn:hover,
//         .ca-root.dark .ca-plus-btn.open { background: #3a3a3a; color: #ececec; }
//         .ca-root.dark .ca-send-btn { background: #ececec; color: #0d0d0d; }
//         .ca-root.dark .ca-send-btn:disabled { background: #3a3a3a; color: #6b6b6b; }
//         .ca-root.dark .ca-disclaimer { color: #6b6b6b; }
//         .ca-root.dark .ca-menu { background: #2f2f2f; border-color: #3a3a3a; box-shadow: 0 4px 20px rgba(0,0,0,0.35); }
//         .ca-root.dark .ca-menu-item { color: #ececec; }
//         .ca-root.dark .ca-menu-item:hover { background: #3a3a3a; }
//         .ca-root.dark .ca-menu-item.selected { color: #60a5fa; }
//         .ca-root.dark .ca-menu-item.selected:hover { background: #1e3a5f; }
//         .ca-root.dark .ca-menu-divider { border-color: #3a3a3a; }
//         .ca-root.dark .ca-badge { background: #1e3a5f; color: #60a5fa; border-color: #3b82f6; }
//         .ca-root.dark .ca-badge:hover { background: #1a3050; }
//         .ca-root.dark .ca-badge-x { background: #2d5a9e; color: #60a5fa; }
//         .ca-root.dark .ca-img-preview img { border-color: #3a3a3a; }

//         .ca-messages {
//           flex: 1;
//           overflow-y: auto;
//           padding: 24px 16px 0;
//         }
//         .ca-messages::-webkit-scrollbar { width: 4px; }
//         .ca-messages::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 4px; }
//         .ca-messages::-webkit-scrollbar-track { background: transparent; }

//         .ca-messages-inner {
//           max-width: 680px;
//           margin: 0 auto;
//           display: flex;
//           flex-direction: column;
//           gap: 24px;
//           padding-bottom: 16px;
//         }

//         .ca-msg-user { display: flex; justify-content: flex-end; }
//         .ca-bubble-user {
//           background: #f4f4f4;
//           color: #0d0d0d;
//           padding: 12px 18px;
//           border-radius: 20px;
//           font-size: 15px;
//           line-height: 1.6;
//           max-width: 80%;
//           word-break: break-word;
//         }
//         .ca-msg-ai { display: flex; justify-content: flex-start; }
//         .ca-bubble-ai {
//           color: #0d0d0d;
//           font-size: 15px;
//           line-height: 1.7;
//           max-width: 90%;
//           word-break: break-word;
//         }
//         .ca-bubble-ai p { margin-bottom: 12px; }
//         .ca-bubble-ai p:last-child { margin-bottom: 0; }
//         .ca-bubble-ai h1,.ca-bubble-ai h2,.ca-bubble-ai h3 { font-weight: 600; margin: 16px 0 8px; }
//         .ca-bubble-ai ul,.ca-bubble-ai ol { padding-left: 20px; margin-bottom: 12px; }
//         .ca-bubble-ai li { margin-bottom: 4px; }
//         .ca-bubble-ai code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: monospace; }
//         .ca-bubble-ai pre code { background: none; padding: 0; font-size: 13px; }
//         .ca-bubble-ai strong { font-weight: 600; }

//         .ca-code-block { position: relative; margin-bottom: 16px; border-radius: 10px; overflow: hidden; background: #212121; }
//         .ca-code-header { display: flex; align-items: center; justify-content: space-between; background: #2f2f2f; padding: 8px 16px; font-size: 12px; color: #8e8ea0; font-family: monospace; }
//         .ca-code-copy-btn { background: none; border: none; cursor: pointer; color: #8e8ea0; display: flex; align-items: center; gap: 5px; font-size: 12px; font-family: inherit; padding: 3px 8px; border-radius: 4px; transition: background 0.12s, color 0.12s; }
//         .ca-code-copy-btn:hover { background: #3a3a3a; color: #ffffff; }
//         .ca-bubble-ai pre { margin: 0 !important; border-radius: 0 !important; padding: 0 !important; background: transparent !important; }

//         .ca-typing { display: flex; gap: 4px; padding: 4px 0; align-items: center; }
//         .ca-typing span { width: 6px; height: 6px; background: #8e8ea0; border-radius: 50%; animation: ca-bounce 1.2s infinite; }
//         .ca-typing span:nth-child(2) { animation-delay: 0.2s; }
//         .ca-typing span:nth-child(3) { animation-delay: 0.4s; }
//         @keyframes ca-bounce {
//           0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
//           40% { transform: translateY(-6px); opacity: 1; }
//         }

//         .ca-input-area { flex-shrink: 0; padding: 12px 16px 20px; background: #ffffff; }
//         .ca-input-wrap {
//           max-width: 720px;
//           margin: 0 auto;
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
//         .ca-input-wrap:focus-within { border-color: #c4c4c4; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

//         /* Image preview inside input */
//         .ca-img-preview {
//           position: relative;
//           display: inline-block;
//           margin-left: 4px;
//         }
//         .ca-img-preview img {
//           height: 60px;
//           width: 60px;
//           border-radius: 8px;
//           object-fit: cover;
//           border: 1px solid #e5e5e5;
//           display: block;
//         }
//         .ca-img-preview-remove {
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

//         .ca-input-row { display: flex; align-items: center; gap: 10px; }

//         .ca-textarea {
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
//         .ca-textarea::placeholder { color: #8e8ea0; }

//         .ca-bottom-row { display: flex; align-items: center; justify-content: space-between; }
//         .ca-left-tools { display: flex; align-items: center; gap: 6px; }

//         /* Plus button */
//         .ca-plus-btn {
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
//         .ca-plus-btn:hover { background: #f0f0f0; color: #0d0d0d; }
//         .ca-plus-btn.open { background: #f0f0f0; color: #0d0d0d; transform: rotate(45deg); }

//         /* Popup menu */
//         .ca-menu-wrap { position: relative; }
//         .ca-menu {
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
//           animation: ca-pop 0.13s ease;
//         }
//         @keyframes ca-pop {
//           from { opacity: 0; transform: translateY(6px) scale(0.97); }
//           to   { opacity: 1; transform: translateY(0) scale(1); }
//         }
//         .ca-menu-item {
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
//         .ca-menu-item:hover { background: #f5f5f5; }
//         .ca-menu-item.selected { color: #2563eb; }
//         .ca-menu-item.selected:hover { background: #eff6ff; }
//         .ca-menu-item-left { display: flex; align-items: center; gap: 10px; }
//         .ca-menu-divider { border: none; border-top: 1px solid #f0f0f0; margin: 4px 0; }

//         /* Active badge */
//         .ca-badge {
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
//         .ca-badge:hover { background: #dbeafe; }
//         .ca-badge-x {
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
//         .ca-badge:hover .ca-badge-x { background: #93c5fd; }

//         /* Send button */
//         .ca-send-btn {
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
//         .ca-send-btn:disabled { background: #e5e5e5; color: #acacac; cursor: default; }
//         .ca-send-btn:not(:disabled):hover { background: #2a2a2a; }

//         .ca-disclaimer { font-size: 12px; color: #8e8ea0; text-align: center; margin-top: 8px; }
//         .ca-msg-user:hover .ca-edit-btn { opacity: 1 !important; }
//       `}</style>

//       {/* Hidden image file input */}
//       <input
//         ref={fileInputRef}
//         type="file"
//         accept="image/*"
//         style={{ display: "none" }}
//         onChange={e => {
//           const f = e.target.files?.[0]
//           if (f) handleImageFile(f)
//           e.target.value = ""
//         }}
//       />

//       <div className={`ca-root${dark ? " dark" : ""}`}>

//         {/* ── Messages ── */}
//         <div className="ca-messages">
//           <div className="ca-messages-inner">
//             {messages.map((msg) => (
//               msg.role === "USER" ? (
//                 <div key={msg.id} className="ca-msg-user" style={{ flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
//                   {editingId === msg.id ? (
//                     <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "80%", alignItems: "flex-end" }}>
//                       <textarea
//                         value={editText}
//                         onChange={e => setEditText(e.target.value)}
//                         autoFocus
//                         style={{ width: "100%", background: dark ? "#2f2f2f" : "#f4f4f4", color: dark ? "#ececec" : "#0d0d0d", border: "1px solid #c4c4c4", borderRadius: "16px", padding: "12px 18px", fontSize: "15px", fontFamily: "inherit", lineHeight: "1.6", resize: "none", outline: "none", minHeight: "60px" }}
//                         onKeyDown={e => {
//                           if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(msg.id) }
//                           if (e.key === "Escape") setEditingId(null)
//                         }}
//                       />
//                       <div style={{ display: "flex", gap: "6px" }}>
//                         <button onClick={() => saveEdit(msg.id)} style={{ background: "#0d0d0d", color: "white", border: "none", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Save</button>
//                         <button onClick={() => setEditingId(null)} style={{ background: "none", color: "#6b6b6b", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
//                       <button
//                         onClick={() => { setEditingId(msg.id); setEditText(msg.content) }}
//                         style={{ background: "none", border: "none", cursor: "pointer", color: "#8e8ea0", padding: "4px", borderRadius: "6px", opacity: 0, transition: "opacity 0.1s", marginTop: "8px", flexShrink: 0 }}
//                         className="ca-edit-btn"
//                       >
//                         <Pencil size={13} />
//                       </button>
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", maxWidth: "80%" }}>
//                         {msg.imageBase64 && (
//                           <img src={msg.imageBase64} alt="uploaded" style={{ maxWidth: "260px", maxHeight: "200px", borderRadius: "12px", objectFit: "cover", display: "block" }} />
//                         )}
//                         {msg.content && <div className="ca-bubble-user">{msg.content}</div>}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div key={msg.id} className="ca-msg-ai">
//                   <div className="ca-bubble-ai">
//                     <ReactMarkdown
//                       components={{
//                         code({ node, className, children, ...props }: any) {
//                           const isBlock = className?.startsWith('language-')
//                           const language = className?.replace('language-', '') ?? 'text'
//                           const codeText = String(children).replace(/\n$/, '')
//                           const blockId = `${msg.id}-${language}-${codeText.slice(0, 10)}`
//                           if (isBlock) {
//                             return (
//                               <div className="ca-code-block">
//                                 <div className="ca-code-header">
//                                   <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//                                     <Code2 size={13} /> {language}
//                                   </span>
//                                   <button className="ca-code-copy-btn" onClick={() => copyCode(codeText, blockId)}>
//                                     {copiedMap[blockId] ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
//                                   </button>
//                                 </div>
//                                 <SyntaxHighlighter language={language} style={oneDark} customStyle={{ margin: 0, borderRadius: 0, fontSize: 13 }} PreTag="div">
//                                   {codeText}
//                                 </SyntaxHighlighter>
//                               </div>
//                             )
//                           }
//                           return <code className={className} {...props}>{children}</code>
//                         }
//                       }}
//                     >
//                       {msg.content}
//                     </ReactMarkdown>
//                   </div>
//                 </div>
//               )
//             ))}

//             {!loading && messages.length > 0 && messages[messages.length - 1]?.role === "ASSISTANT" && (
//               <div style={{ display: "flex", justifyContent: "flex-start" }}>
//                 <button
//                   onClick={regenerate}
//                   style={{ background: "none", border: "none", cursor: "pointer", color: "#8e8ea0", display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", padding: "4px 8px", borderRadius: "6px", transition: "background 0.12s, color 0.12s", fontFamily: "inherit" }}
//                   onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = dark ? "#2a2a2a" : "#f0f0f0"; el.style.color = dark ? "#ececec" : "#0d0d0d" }}
//                   onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "none"; el.style.color = "#8e8ea0" }}
//                 >
//                   <RotateCcw size={13} /> Regenerate
//                 </button>
//               </div>
//             )}

//             {loading && (
//               <div className="ca-msg-ai">
//                 <div className="ca-bubble-ai">
//                   <div className="ca-typing"><span /><span /><span /></div>
//                 </div>
//               </div>
//             )}
//             <div ref={bottomRef} />
//           </div>
//         </div>

//         {/* ── Input area ── */}
//         <div className="ca-input-area">
//           <div className="ca-input-wrap">

//             {/* Image preview above textarea */}
//             {imageBase64 && (
//               <div className="ca-img-preview">
//                 <img src={imageBase64} alt="preview" />
//                 <button className="ca-img-preview-remove" onClick={() => setImageBase64(null)}>
//                   <X size={10} />
//                 </button>
//               </div>
//             )}

//             {/* Textarea row */}
//             <div className="ca-input-row">
//               <textarea
//                 ref={textareaRef}
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder="Ask anything"
//                 rows={1}
//                 className="ca-textarea"
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" && !e.shiftKey) {
//                     e.preventDefault()
//                     sendMessage()
//                   }
//                 }}
//               />
//             </div>

//             {/* Bottom toolbar */}
//             <div className="ca-bottom-row">
//               <div className="ca-left-tools">

//                 {/* Plus button + popup menu */}
//                 <div className="ca-menu-wrap" ref={menuRef}>
//                   <button
//                     className={`ca-plus-btn${menuOpen ? " open" : ""}`}
//                     onClick={() => setMenuOpen(p => !p)}
//                     title="Attach / options"
//                   >
//                     <Plus size={18} />
//                   </button>

//                   {menuOpen && (
//                     <div className="ca-menu">
//                       {/* Add photos & files → opens image picker */}
//                       <button
//                         className="ca-menu-item"
//                         onClick={() => { setMenuOpen(false); fileInputRef.current?.click() }}
//                       >
//                         <div className="ca-menu-item-left">
//                           <Paperclip size={16} color="#6b6b6b" />
//                           Add photos &amp; files
//                         </div>
//                       </button>

//                       <hr className="ca-menu-divider" />

//                       {/* Deep Research toggle */}
//                       <button
//                         className={`ca-menu-item${deepResearch ? " selected" : ""}`}
// onClick={() => { setDeepResearch((p: boolean) => !p); setMenuOpen(false) }}                      >
//                         <div className="ca-menu-item-left">
//                           <Globe size={16} color={deepResearch ? "#2563eb" : "#6b6b6b"} />
//                           Deep Research
//                         </div>
//                         {deepResearch && <Check size={15} color="#2563eb" strokeWidth={2.5} />}
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Blue badge shown when deep research is active */}
//                 {deepResearch && (
//                   <button
//                     className="ca-badge"
//                     onClick={() => setDeepResearch(false)}
//                     title="Remove deep research"
//                   >
//                     <Globe size={13} />
//                     Research
//                     <span className="ca-badge-x">
//                       <X size={10} strokeWidth={2.5} />
//                     </span>
//                   </button>
//                 )}

//               </div>

//               {loading ? (
//                 <button className="ca-send-btn" onClick={stopGeneration}>
//                   <Square size={14} fill="currentColor" />
//                 </button>
//               ) : (
//                 <button
//                   className="ca-send-btn"
//                   disabled={!input.trim() && !imageBase64}
//                   onClick={sendMessage}
//                 >
//                   <ArrowUp size={18} strokeWidth={2.5} />
//                 </button>
//               )}
//             </div>
//           </div>
//           <p className="ca-disclaimer">NUIGPT can make mistakes. Check important info.</p>
//         </div>

//       </div>
//     </>
//   )
// }







import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { api } from "../lib/api";
import { useTheme } from "./chat";
import {
  Plus,
  ArrowUp,
  Copy,
  Check,
  Code2,
  Square,
  RotateCcw,
  Pencil,
  Globe,
  X,
  Paperclip,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const Route = createFileRoute("/chat/$chatId")({
  component: ChatPage,
  validateSearch: (search: Record<string, unknown>) => ({
    deepResearch:
      search.deepResearch === true || search.deepResearch === "true",
  }),
});

function ChatPage() {
  const { chatId } = Route.useParams();
  const { deepResearch: initialDeepResearch } = Route.useSearch();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [deepResearch, setDeepResearch] = useState(initialDeepResearch);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/png");
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initFiredRef = useRef(false);
  const sessionImageRef = useRef<{ base64: string; mime: string } | null>(null);

  const { dark } = useTheme();

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (e) => setImageBase64(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    setLoading(false);
  };

  const streamAI = async (
    useDeepResearch: boolean,
    imgBase64?: string | null,
    imgMime?: string,
  ) => {
    const token = localStorage.getItem("token");
    abortControllerRef.current = new AbortController();
    const response = await fetch(`http://localhost:3000/ai/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        chatId,
        deepResearch: useDeepResearch,
        imageBase64: imgBase64 ?? null,
        imageMime: imgMime ?? "image/png",
      }),
      signal: abortControllerRef.current.signal,
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let aiMessage = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split("\n").filter((l) => l.startsWith("data: "));
      for (const line of lines) {
        const data = line.replace("data: ", "").trim();
        try {
          const parsed = JSON.parse(data);
          if (parsed.done) break;
          if (parsed.delta) {
            aiMessage += parsed.delta;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === "ai-stream" ? { ...m, content: aiMessage } : m,
              ),
            );
          }
        } catch {}
      }
    }
  };

  const regenerate = async () => {
    if (loading) return;
    setLoading(true);
    setMessages((prev) => {
      const idx = [...prev].reverse().findIndex((m) => m.role === "ASSISTANT");
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      return prev.slice(0, realIdx);
    });
    try {
      setMessages((prev) => [
        ...prev,
        { id: "ai-stream", role: "ASSISTANT", content: "" },
      ]);
      await streamAI(
        deepResearch,
        sessionImageRef.current?.base64,
        sessionImageRef.current?.mime,
      );
      await loadMessages();
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("Regenerate error");
      await loadMessages();
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedMap((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setCopiedMap((prev) => ({ ...prev, [id]: false })), 2000);
  };

  useEffect(() => {
    initFiredRef.current = false;
    const init = async () => {
      if (initFiredRef.current) return;
      initFiredRef.current = true;
      try {
        const pendingContent = sessionStorage.getItem("pendingContent");
        sessionStorage.removeItem("pendingContent");

        if (pendingContent !== null && pendingContent.trim() !== "") {
          await api.post("/messages", {
            chatId,
            role: "USER",
            content: pendingContent,
          });
        } else if (pendingContent !== null && pendingContent.trim() === "") {
          await api.post("/messages", {
            chatId,
            role: "USER",
            content: "What is in this image?",
          });
        }

        const res = await api.get(`/messages?chatId=${chatId}`);
        setMessages(res.data);

        const last = res.data[res.data.length - 1];
        if (last?.role === "USER" && pendingContent !== null) {
          const pendingImage = sessionStorage.getItem("pendingImage");
          const pendingMime =
            sessionStorage.getItem("pendingMime") ?? "image/png";
          sessionStorage.removeItem("pendingImage");
          sessionStorage.removeItem("pendingMime");

          if (pendingImage) {
            sessionImageRef.current = {
              base64: pendingImage,
              mime: pendingMime,
            };
            setMessages((prev) =>
              prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, imageBase64: pendingImage } : m,
              ),
            );
          }

          setLoading(true);
          setMessages((prev) => [
            ...prev,
            { id: "ai-stream", role: "ASSISTANT", content: "" },
          ]);
          await streamAI(deepResearch, pendingImage, pendingMime);
          await loadMessages();
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") console.error("Init error");
        await loadMessages();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const loadMessages = async () => {
    try {
      const res = await api.get(`/messages?chatId=${chatId}`);
      setMessages((prev) => {
        const imageMapById: Record<string, string> = {};
        const imageMapByContent: Record<string, string> = {};
        prev.forEach((m) => {
          if (m.imageBase64) {
            imageMapById[m.id] = m.imageBase64;
            imageMapByContent[m.content?.trim()] = m.imageBase64;
          }
        });
        return res.data.map((m: any) => ({
          ...m,
          imageBase64:
            imageMapById[m.id] ??
            imageMapByContent[m.content?.trim()] ??
            m.imageBase64,
        }));
      });
    } catch (err) {
      console.error("Error loading messages");
    }
  };

  const saveEdit = async (msgId: string) => {
    if (!editText.trim()) return;
    setEditingId(null);
    try {
      await api.patch(`/messages/${msgId}`, { content: editText.trim() });
      const res = await api.get(`/messages?chatId=${chatId}`);
      const msgs: any[] = res.data;
      const editedIdx = msgs.findIndex((m) => m.id === msgId);
      const msgsAfter = msgs.slice(editedIdx + 1);
      for (const m of msgsAfter) {
        await api.delete(`/messages/${m.id}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
      setMessages(msgs.slice(0, editedIdx + 1));
      setLoading(true);
      setMessages((prev) => [
        ...prev,
        { id: "ai-stream", role: "ASSISTANT", content: "" },
      ]);
      await streamAI(
        deepResearch,
        sessionImageRef.current?.base64,
        sessionImageRef.current?.mime,
      );
      await loadMessages();
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("Edit error");
      await loadMessages();
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !imageBase64) || loading) return;
    const content = input.trim();
    const currentImage = imageBase64;
    const currentMime = imageMime;
    const currentDeepResearch = deepResearch;

    if (currentImage) {
      sessionImageRef.current = { base64: currentImage, mime: currentMime };
    }
    const imageToSend = currentImage ?? sessionImageRef.current?.base64 ?? null;
    const mimeToSend =
      currentMime ?? sessionImageRef.current?.mime ?? "image/png";

    const url = new URL(window.location.href);
    url.searchParams.delete("deepResearch");
    window.history.replaceState({}, "", url.toString());

    setInput("");
    setImageBase64(null);
    setLoading(true);

    const tempMsg = {
      id: "temp-" + Date.now(),
      role: "USER",
      content,
      imageBase64: currentImage,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await api.post("/messages", { chatId, role: "USER", content });
      setMessages((prev) => [
        ...prev,
        { id: "ai-stream", role: "ASSISTANT", content: "" },
      ]);
      await streamAI(currentDeepResearch, imageToSend, mimeToSend);
      await loadMessages();
      setLoading(false);
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("Error sending message");
      await loadMessages();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-full font-sans ${dark ? "bg-[#212121]" : "bg-white"}`}
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

      {/* ── Messages ── */}
      <div
        className={`flex-1 overflow-y-auto px-4 pt-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-track]:bg-transparent ${dark ? "[&::-webkit-scrollbar-thumb]:bg-[#3a3a3a]" : "[&::-webkit-scrollbar-thumb]:bg-[#d4d4d4]"}`}
      >
        <div className="max-w-[720px] mx-auto flex flex-col gap-6 pb-4">
          {messages.map((msg) =>
            msg.role === "USER" ? (
              <div key={msg.id} className="flex flex-col items-end gap-1.5">
                {editingId === msg.id ? (
                  <div className="flex flex-col gap-2 w-full max-w-[80%] items-end">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                      className={`w-full border rounded-2xl px-4 py-3 text-[15px] font-[inherit] leading-relaxed resize-none outline-none min-h-[60px] ${dark ? "bg-[#2f2f2f] text-[#ececec] border-[#4a4a4a]" : "bg-[#f4f4f4] text-[#0d0d0d] border-[#c4c4c4]"}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          saveEdit(msg.id);
                        }
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => saveEdit(msg.id)}
                        className="bg-[#0d0d0d] text-white border-none rounded-lg px-3.5 py-1.5 text-[13px] cursor-pointer font-[inherit]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className={`border rounded-lg px-3.5 py-1.5 text-[13px] cursor-pointer font-[inherit] bg-transparent ${dark ? "text-[#8e8ea0] border-[#3a3a3a]" : "text-[#6b6b6b] border-[#e5e5e5]"}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-1.5 group">
                    <button
                      onClick={() => {
                        setEditingId(msg.id);
                        setEditText(msg.content);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer text-[#8e8ea0] p-1 rounded-md mt-2 flex-shrink-0"
                    >
                      <Pencil size={13} />
                    </button>
                    <div className="flex flex-col items-end gap-1.5 max-w-[75%]">
                      {msg.imageBase64 && (
                        <img
                          src={msg.imageBase64}
                          alt="uploaded"
                          className="max-w-[260px] max-h-[200px] rounded-xl object-cover block"
                        />
                      )}
                      {msg.content && (
                        <div
                          className={`px-4 py-3 rounded-[20px] text-[15px] leading-relaxed break-words ${dark ? "bg-[#2f2f2f] text-[#ececec]" : "bg-[#f4f4f4] text-[#0d0d0d]"}`}
                        >
                          {msg.content}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div key={msg.id} className="flex justify-start">
                <div
                  className={`text-[15px] leading-[1.75] w-full break-words prose-headings:font-semibold ${dark ? "text-[#ececec]" : "text-[#0d0d0d]"}`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-3 last:mb-0 text-justify">
                          {children}
                        </p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-xl font-semibold mt-4 mb-2">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold mt-4 mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-semibold mt-3 mb-1.5">
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-6 mb-3 space-y-2">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-6 mb-3 space-y-2">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-[1.75]">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      code({ node, className, children, ...props }: any) {
                        const isBlock = className?.startsWith("language-");
                        const language =
                          className?.replace("language-", "") ?? "text";
                        const codeText = String(children).replace(/\n$/, "");
                        const blockId = `${msg.id}-${language}-${codeText.slice(0, 10)}`;
                        if (isBlock) {
                          return (
                            <div className="relative mb-4 rounded-[10px] overflow-hidden bg-[#212121]">
                              <div className="flex items-center justify-between bg-[#2f2f2f] px-4 py-2 text-xs text-[#8e8ea0] font-mono">
                                <span className="flex items-center gap-1.5">
                                  <Code2 size={13} /> {language}
                                </span>
                                <button
                                  className="flex items-center gap-1.5 text-xs text-[#8e8ea0] hover:text-white hover:bg-[#3a3a3a] px-2 py-1 rounded font-[inherit] bg-transparent border-none cursor-pointer transition-colors"
                                  onClick={() => copyCode(codeText, blockId)}
                                >
                                  {copiedMap[blockId] ? (
                                    <>
                                      <Check size={13} /> Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={13} /> Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <SyntaxHighlighter
                                language={language}
                                style={oneDark}
                                customStyle={{
                                  margin: 0,
                                  borderRadius: 0,
                                  fontSize: 13,
                                }}
                                PreTag="div"
                              >
                                {codeText}
                              </SyntaxHighlighter>
                            </div>
                          );
                        }
                        return (
                          <code
                            className={`${dark ? "bg-[#2f2f2f] text-[#ececec]" : "bg-[#f4f4f4] text-[#0d0d0d]"} px-1.5 py-0.5 rounded text-[13px] font-mono`}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ),
          )}

          {/* Regenerate button */}
          {!loading &&
            messages.length > 0 &&
            messages[messages.length - 1]?.role === "ASSISTANT" && (
              <div className="flex justify-start">
                <button
                  onClick={regenerate}
                  className={`flex items-center gap-1.5 text-xs text-[#8e8ea0] px-2 py-1 rounded-md bg-transparent border-none cursor-pointer font-[inherit] transition-colors ${dark ? "hover:bg-[#2a2a2a] hover:text-[#ececec]" : "hover:bg-[#f0f0f0] hover:text-[#0d0d0d]"}`}
                >
                  <RotateCcw size={13} /> Regenerate
                </button>
              </div>
            )}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-1 py-1 items-center">
                <span className="w-1.5 h-1.5 bg-[#8e8ea0] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-[#8e8ea0] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-[#8e8ea0] rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input area ── */}
      <div
        className={`flex-shrink-0 px-4 pt-3 pb-5 ${dark ? "bg-[#212121]" : "bg-white"}`}
      >
        <div
          className={`max-w-[720px] mx-auto border rounded-3xl px-3.5 py-2.5 flex flex-col gap-2 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.08)] ${
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

          {/* Textarea */}
          <div className="flex items-center gap-2.5">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything"
              rows={1}
              className={`flex-1 bg-transparent border-none outline-none resize-none text-[15px] font-[inherit] leading-[1.5] min-h-6 max-h-[180px] overflow-y-auto p-0 ${dark ? "text-[#ececec] placeholder:text-[#6b6b6b]" : "text-[#0d0d0d] placeholder:text-[#8e8ea0]"}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {/* Plus button + menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((p) => !p)}
                  title="Attach / options"
                  className={`w-[30px] h-[30px] rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-150 ${
                    menuOpen
                      ? dark
                        ? "bg-[#3a3a3a] text-[#ececec]"
                        : "bg-[#f0f0f0] text-[#0d0d0d]"
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
                    className={`absolute bottom-[calc(100%+10px)] left-0 border rounded-[14px] p-1.5 min-w-[220px] z-50 shadow-[0_4px_20px_rgba(0,0,0,0.12)] ${dark ? "bg-[#2f2f2f] border-[#3a3a3a] shadow-[0_4px_20px_rgba(0,0,0,0.35)]" : "bg-white border-[#e5e5e5]"}`}
                  >
                    <button
                      className={`flex items-center gap-2.5 w-full px-3 py-[9px] rounded-lg border-none cursor-pointer font-[inherit] text-sm text-left transition-colors ${dark ? "text-[#ececec] hover:bg-[#3a3a3a]" : "text-[#0d0d0d] hover:bg-[#f5f5f5]"}`}
                      onClick={() => {
                        setMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                    >
                      <Paperclip size={16} className="text-[#6b6b6b]" />
                      Add photos &amp; files
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
                        setDeepResearch((p: boolean) => !p);
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

            {loading ? (
              <button
                onClick={stopGeneration}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer flex-shrink-0 transition-colors ${dark ? "bg-[#ececec] text-[#0d0d0d] hover:bg-[#d4d4d4]" : "bg-[#0d0d0d] text-white hover:bg-[#2a2a2a]"}`}
              >
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                disabled={!input.trim() && !imageBase64}
                onClick={sendMessage}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer flex-shrink-0 transition-colors ${
                  !input.trim() && !imageBase64
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
            )}
          </div>
        </div>

        <p
          className={`text-xs mt-3 text-center ${dark ? "text-[#6b6b6b]" : "text-[#8e8ea0]"}`}
        >
          NUIGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}