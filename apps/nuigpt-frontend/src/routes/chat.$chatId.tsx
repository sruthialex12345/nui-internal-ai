// import { createFileRoute } from '@tanstack/react-router'
// import { useEffect, useState } from 'react'
// import { api } from '../lib/api'

// export const Route = createFileRoute('/chat/$chatId')({
//   component: ChatPage,
// })

// function ChatPage() {
//   const { chatId } = Route.useParams()
//   const [messages, setMessages] = useState<any[]>([])
//   const [input, setInput] = useState("")

//   useEffect(() => {
//     loadMessages()
//   }, [chatId])

//   const loadMessages = async () => {
//     try {
//       const res = await api.get(`/messages?chatId=${chatId}`)
//       setMessages(res.data)
//     } catch (err) {
//       console.error("Error loading messages")
//     }
//   }

//   const sendMessage = async () => {
//     if (!input.trim()) return

//     try {
//       // 1️⃣ Save user message
//       await api.post("/messages", {
//         chatId,
//         role: "USER",
//         content: input,
//       })

//       setInput("")

//       // 2️⃣ Call AI response
//       await api.post("/ai/respond", { chatId })

//       // 3️⃣ Reload messages
//       loadMessages()

//     } catch (err) {
//       console.error("Error sending message")
//     }
//   }

//   return (
//     <div className="flex flex-col h-full px-10 py-6">

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto space-y-6 max-w-3xl mx-auto w-full">
//         {messages.map((msg) => (
//           <div
//             key={msg.id}
//             className={`flex ${
//               msg.role === "USER" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`px-4 py-3 rounded-2xl max-w-xl ${
//                 msg.role === "USER"
//                   ? "bg-[#5436DA] text-white"
//                   : "bg-gray-100 text-black"
//               }`}
//             >
//               {msg.content}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input */}
//       <div className="border-t pt-4 mt-4 max-w-3xl mx-auto w-full">
//         <div className="flex gap-3">
//           <input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             className="flex-1 border rounded-xl px-4 py-3 focus:outline-none"
//             placeholder="Ask nui-bot..."
//             onKeyDown={(e) => {
//               if (e.key === "Enter") sendMessage()
//             }}
//           />
//           <button
//             onClick={sendMessage}
//             className="bg-black text-white px-6 rounded-xl"
//           >
//             Send
//           </button>
//         </div>
//       </div>

//     </div>
//   )
// }




import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { api } from '../lib/api'
import { useTheme } from './chat'
import { Plus, ArrowUp, Copy, Check, Code2, Square, RotateCcw, Pencil, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export const Route = createFileRoute('/chat/$chatId')({
  component: ChatPage,
})

function ChatPage() {
  const { chatId } = Route.useParams()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const initFiredRef = useRef(false)
  const sessionImageRef = useRef<{ base64: string; mime: string } | null>(null)
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
  const stopGeneration = () => {
    abortControllerRef.current?.abort()
    setLoading(false)
  }

  const regenerate = async () => {
    if (loading) return
    setLoading(true)

    // Remove last AI message from UI optimistically
    setMessages(prev => {
      const idx = [...prev].reverse().findIndex(m => m.role === "ASSISTANT")
      if (idx === -1) return prev
      const realIdx = prev.length - 1 - idx
      return prev.slice(0, realIdx)
    })

    try {
      setMessages(prev => [...prev, { id: "ai-stream", role: "ASSISTANT", content: "" }])

      const token = localStorage.getItem("token")
      abortControllerRef.current = new AbortController()
      const response = await fetch(`http://localhost:3000/ai/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ chatId }),
        signal: abortControllerRef.current.signal
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let aiMessage = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        const lines = text.split("\n").filter(l => l.startsWith("data: "))
        for (const line of lines) {
          const data = line.replace("data: ", "").trim()
          try {
            const parsed = JSON.parse(data)
            if (parsed.done) {
              break
            }
            if (parsed.delta) {
              aiMessage += parsed.delta
              setMessages(prev =>
                prev.map(m => m.id === "ai-stream" ? { ...m, content: aiMessage } : m)
              )
            }
          } catch { }
        }
      }

      await loadMessages()
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Regenerate error")
      }
      await loadMessages()
    } finally {
      setLoading(false)
    }
  }
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const { dark } = useTheme()
  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedMap(prev => ({ ...prev, [id]: true }))
    setTimeout(() => setCopiedMap(prev => ({ ...prev, [id]: false })), 2000)
  }
  useEffect(() => {
    initFiredRef.current = false
    const init = async () => {
      if (initFiredRef.current) return
      initFiredRef.current = true
      try {
        // Check for pending content from landing page
        const pendingContent = sessionStorage.getItem("pendingContent")
        sessionStorage.removeItem("pendingContent")

        if (pendingContent !== null && pendingContent.trim() !== "") {
          await api.post("/messages", { chatId, role: "USER", content: pendingContent })
        } else if (pendingContent !== null && pendingContent.trim() === "") {
          // Image-only message — save with placeholder so AI knows to look at the image
          await api.post("/messages", { chatId, role: "USER", content: "What is in this image?" })
        }
        const res = await api.get(`/messages?chatId=${chatId}`)
        setMessages(res.data)

        const last = res.data[res.data.length - 1]
        if (last?.role === "USER") {
          const pendingImage = sessionStorage.getItem("pendingImage")
          const pendingMime = sessionStorage.getItem("pendingMime") ?? "image/png"
          sessionStorage.removeItem("pendingImage")
          sessionStorage.removeItem("pendingMime")

          if (pendingImage) {
            sessionImageRef.current = { base64: pendingImage, mime: pendingMime }
            setMessages(prev => prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, imageBase64: pendingImage } : m
            ))
          }

          setLoading(true)
          setMessages(prev => [...prev, { id: "ai-stream", role: "ASSISTANT", content: "" }])

          const token = localStorage.getItem("token")
          abortControllerRef.current = new AbortController()
          const response = await fetch(`http://localhost:3000/ai/respond`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ chatId, imageBase64: pendingImage, imageMime: pendingMime }),
            signal: abortControllerRef.current.signal
          })

          const reader = response.body!.getReader()
          const decoder = new TextDecoder()
          let aiMessage = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const text = decoder.decode(value)
            const lines = text.split("\n").filter(l => l.startsWith("data: "))
            for (const line of lines) {
              const data = line.replace("data: ", "").trim()
              try {
                const parsed = JSON.parse(data)
                if (parsed.done) {
                  break
                }
                if (parsed.delta) {
                  aiMessage += parsed.delta
                  setMessages(prev =>
                    prev.map(m => m.id === "ai-stream" ? { ...m, content: aiMessage } : m)
                  )
                }
              } catch { }
            }
          }

          await loadMessages()

        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Init error")
        }
        await loadMessages()
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

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

  const loadMessages = async () => {
    try {
      const res = await api.get(`/messages?chatId=${chatId}`)
      setMessages(prev => {
        // Build map by ID for real IDs, and also by position for temp messages
        const imageMapById: Record<string, string> = {}
        const imageMapByContent: Record<string, string> = {}
        prev.forEach(m => {
          if (m.imageBase64) {
            imageMapById[m.id] = m.imageBase64
            imageMapByContent[m.content?.trim()] = m.imageBase64
          }
        })
        return res.data.map((m: any) => ({
          ...m,
          imageBase64: imageMapById[m.id] ?? imageMapByContent[m.content?.trim()] ?? m.imageBase64
        }))
      })
    } catch (err) {
      console.error("Error loading messages")
    }
  }

  const saveEdit = async (msgId: string) => {
    if (!editText.trim()) return
    setEditingId(null)
    try {
      await api.patch(`/messages/${msgId}`, { content: editText.trim() })
      const res = await api.get(`/messages?chatId=${chatId}`)
      const msgs: any[] = res.data
      const editedIdx = msgs.findIndex(m => m.id === msgId)

      // Include the AI message right after the edited user message too
      const msgsAfter = msgs.slice(editedIdx + 1)

      for (const m of msgsAfter) {
        await api.delete(`/messages/${m.id}`)
        console.log("Deleted message:", m.id, m.role)
      }
      console.log("All deletes done, remaining messages:", msgs.slice(0, editedIdx + 1).length)

      // Small delay to ensure all deletes are committed before AI reads DB
      await new Promise(resolve => setTimeout(resolve, 300))

      setMessages(msgs.slice(0, editedIdx + 1))
      setLoading(true)
      setMessages(prev => [...prev, { id: "ai-stream", role: "ASSISTANT", content: "" }])
      const token = localStorage.getItem("token")


      abortControllerRef.current = new AbortController()
      const response = await fetch(`http://localhost:3000/ai/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ chatId }),
        signal: abortControllerRef.current.signal
      })
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let aiMessage = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        const lines = text.split("\n").filter(l => l.startsWith("data: "))
        for (const line of lines) {
          const data = line.replace("data: ", "").trim()
          try {
            const parsed = JSON.parse(data)
            if (parsed.done) {
              break
            }
            if (parsed.delta) {
              aiMessage += parsed.delta
              setMessages(prev => prev.map(m => m.id === "ai-stream" ? { ...m, content: aiMessage } : m))
            }
          } catch { }
        }
      }
      await loadMessages()
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("Edit error")
      await loadMessages()
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if ((!input.trim() && !imageBase64) || loading) return
    const content = input.trim()
    const currentImage = imageBase64
    const currentMime = imageMime
    if (currentImage) {
      sessionImageRef.current = { base64: currentImage, mime: currentMime }
    }
    // For follow-up messages with no new image, use the session image
    const imageToSend = currentImage ?? sessionImageRef.current?.base64 ?? null
    const mimeToSend = currentMime ?? sessionImageRef.current?.mime ?? "image/png"
    setInput("")
    setImageBase64(null)
    setLoading(true)

    // Optimistically add user message
    const tempMsg = { id: "temp-" + Date.now(), role: "USER", content, imageBase64: currentImage }
    setMessages(prev => [...prev, tempMsg])

    try {
      // Save user message
      await api.post("/messages", { chatId, role: "USER", content })

      // Add empty AI message to stream into
      setMessages(prev => [...prev, { id: "ai-stream", role: "ASSISTANT", content: "" }])


      // Start streaming
      const token = localStorage.getItem("token")
      abortControllerRef.current = new AbortController()
      const response = await fetch(`http://localhost:3000/ai/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ chatId, imageBase64: imageToSend, imageMime: mimeToSend }),
        signal: abortControllerRef.current.signal
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let aiMessage = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split("\n").filter(l => l.startsWith("data: "))

        for (const line of lines) {
          const data = line.replace("data: ", "").trim()
          try {
            const parsed = JSON.parse(data)
            if (parsed.done) {
              break
            }
            if (parsed.delta) {
              aiMessage += parsed.delta
              setMessages(prev =>
                prev.map(m => m.id === "ai-stream" ? { ...m, content: aiMessage } : m)
              )
            }
          } catch { /* skip malformed chunks */ }
        }
      }

      // Reload to get clean messages from DB
      await loadMessages()
      setLoading(false)

    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Error sending message")
      }
      await loadMessages()
    } finally {
      setLoading(false)
    }
  }



  return (
    <>
      <style>{`
        .ca-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  font-family: ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif;
}
.ca-root.dark { background: #212121; }
.ca-root.dark .ca-bubble-user { background: #2f2f2f; color: #ececec; }
.ca-root.dark .ca-bubble-ai { color: #ececec; }
.ca-root.dark .ca-bubble-ai code { background: #2f2f2f; color: #ececec; }
.ca-root.dark .ca-input-area { background: #212121; }
.ca-root.dark .ca-input-wrap { background: #2f2f2f; border-color: #3a3a3a; }
.ca-root.dark .ca-textarea { color: #ececec; }
.ca-root.dark .ca-plus-btn { color: #8e8ea0; }
.ca-root.dark .ca-plus-btn:hover { background: #3a3a3a; color: #ececec; }
.ca-root.dark .ca-send-btn { background: #ececec; color: #0d0d0d; }
.ca-root.dark .ca-send-btn:disabled { background: #3a3a3a; color: #6b6b6b; }
.ca-root.dark .ca-disclaimer { color: #6b6b6b; }

        .ca-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px 16px 0;
        }
        .ca-messages::-webkit-scrollbar { width: 4px; }
        .ca-messages::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 4px; }
        .ca-messages::-webkit-scrollbar-track { background: transparent; }

        .ca-messages-inner {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 16px;
        }

        .ca-msg-user { display: flex; justify-content: flex-end; }
        .ca-bubble-user {
          background: #f4f4f4;
          color: #0d0d0d;
          padding: 12px 18px;
          border-radius: 20px;
          font-size: 15px;
          line-height: 1.6;
          max-width: 80%;
          word-break: break-word;
        }

        .ca-msg-ai { display: flex; justify-content: flex-start; }
        .ca-bubble-ai {
  color: #0d0d0d;
  font-size: 15px;
  line-height: 1.7;
  max-width: 90%;
  word-break: break-word;
}
.ca-bubble-ai p { margin-bottom: 12px; }
.ca-bubble-ai p:last-child { margin-bottom: 0; }
.ca-bubble-ai h1,.ca-bubble-ai h2,.ca-bubble-ai h3 { font-weight: 600; margin: 16px 0 8px; }
.ca-bubble-ai ul,.ca-bubble-ai ol { padding-left: 20px; margin-bottom: 12px; }
.ca-bubble-ai li { margin-bottom: 4px; }
.ca-bubble-ai code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: monospace; }
.ca-bubble-ai pre code { background: none; padding: 0; font-size: 13px; }
.ca-bubble-ai strong { font-weight: 600; }

.ca-code-block {
  position: relative;
  margin-bottom: 16px;
  border-radius: 10px;
  overflow: hidden;
  background: #212121;
}
.ca-code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2f2f2f;
  padding: 8px 16px;
  font-size: 12px;
  color: #8e8ea0;
  font-family: monospace;
}
.ca-code-copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #8e8ea0;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-family: inherit;
  padding: 3px 8px;
  border-radius: 4px;
  transition: background 0.12s, color 0.12s;
}
.ca-code-copy-btn:hover { background: #3a3a3a; color: #ffffff; }
.ca-bubble-ai pre {
  margin: 0 !important;
  border-radius: 0 !important;
  padding: 0 !important;
  background: transparent !important;
}
        .ca-typing {
          display: flex;
          gap: 4px;
          padding: 4px 0;
          align-items: center;
        }
        .ca-typing span {
          width: 6px;
          height: 6px;
          background: #8e8ea0;
          border-radius: 50%;
          animation: ca-bounce 1.2s infinite;
        }
        .ca-typing span:nth-child(2) { animation-delay: 0.2s; }
        .ca-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ca-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }

        /* Pinned input — same pill style as index */
        .ca-input-area {
          flex-shrink: 0;
          padding: 12px 16px 20px;
          background: #ffffff;
        }

        .ca-input-wrap {
  max-width: 720px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 24px;
  padding: 10px 14px 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: box-shadow 0.15s, border-color 0.15s;
}
.ca-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ca-img-preview {
  position: relative;
  display: inline-block;
  margin-left: 4px;
}
.ca-img-preview img {
  height: 60px;
  width: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e5e5e5;
  display: block;
}
.ca-img-preview-remove {
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
        .ca-input-wrap:focus-within {
          border-color: #c4c4c4;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .ca-plus-btn {
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
        .ca-plus-btn:hover { background: #f0f0f0; color: #0d0d0d; }

        .ca-textarea {
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
        .ca-textarea::placeholder { color: #8e8ea0; }

        .ca-send-btn {
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
        .ca-send-btn:disabled {
          background: #e5e5e5;
          color: #acacac;
          cursor: default;
        }
        .ca-send-btn:not(:disabled):hover { background: #2a2a2a; }

        .ca-disclaimer {
          font-size: 12px;
          color: #8e8ea0;
          text-align: center;
          margin-top: 8px;
        }
        .ca-msg-user:hover .ca-edit-btn { opacity: 1 !important; }
      `}</style>

      <div className={`ca-root${dark ? " dark" : ""}`}>

        <div className="ca-messages">
          <div className="ca-messages-inner">
            {messages.map((msg) => (
              msg.role === "USER" ? (
                <div key={msg.id} className="ca-msg-user" style={{ flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  {editingId === msg.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "80%", alignItems: "flex-end" }}>
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        autoFocus
                        style={{ width: "100%", background: dark ? "#2f2f2f" : "#f4f4f4", color: dark ? "#ececec" : "#0d0d0d", border: "1px solid #c4c4c4", borderRadius: "16px", padding: "12px 18px", fontSize: "15px", fontFamily: "inherit", lineHeight: "1.6", resize: "none", outline: "none", minHeight: "60px" }}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(msg.id) }
                          if (e.key === "Escape") setEditingId(null)
                        }}
                      />
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => saveEdit(msg.id)} style={{ background: "#0d0d0d", color: "white", border: "none", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ background: "none", color: "#6b6b6b", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                      <button onClick={() => { setEditingId(msg.id); setEditText(msg.content) }} style={{ background: "none", border: "none", cursor: "pointer", color: "#8e8ea0", padding: "4px", borderRadius: "6px", opacity: 0, transition: "opacity 0.1s", marginTop: "8px", flexShrink: 0 }} className="ca-edit-btn">
                        <Pencil size={13} />
                      </button>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", maxWidth: "80%" }}>
                        {msg.imageBase64 && (
                          <img src={msg.imageBase64} alt="uploaded" style={{ maxWidth: "260px", maxHeight: "200px", borderRadius: "12px", objectFit: "cover", display: "block" }} />
                        )}
                        {msg.content && <div className="ca-bubble-user">{msg.content}</div>}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div key={msg.id} className="ca-msg-ai">
                  <div className="ca-bubble-ai">
                    <ReactMarkdown
                      components={{
                        code({ node, className, children, ...props }: any) {
                          const isBlock = className?.startsWith('language-')
                          const language = className?.replace('language-', '') ?? 'text'
                          const codeText = String(children).replace(/\n$/, '')
                          const blockId = `${msg.id}-${language}-${codeText.slice(0, 10)}`

                          if (isBlock) {
                            return (
                              <div className="ca-code-block">
                                <div className="ca-code-header">
                                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Code2 size={13} /> {language}
                                  </span>
                                  <button
                                    className="ca-code-copy-btn"
                                    onClick={() => copyCode(codeText, blockId)}
                                  >
                                    {copiedMap[blockId]
                                      ? <><Check size={13} /> Copied</>
                                      : <><Copy size={13} /> Copy</>
                                    }
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  language={language}
                                  style={oneDark}
                                  customStyle={{ margin: 0, borderRadius: 0, fontSize: 13 }}
                                  PreTag="div"
                                >
                                  {codeText}
                                </SyntaxHighlighter>
                              </div>
                            )
                          }
                          return <code className={className} {...props}>{children}</code>
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )
            ))}
            {!loading && messages.length > 0 && messages[messages.length - 1]?.role === "ASSISTANT" && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <button
                  onClick={regenerate}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#8e8ea0",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    transition: "background 0.12s, color 0.12s",
                    fontFamily: "inherit"
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = dark ? "#2a2a2a" : "#f0f0f0"
                    el.style.color = dark ? "#ececec" : "#0d0d0d"
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = "none"
                    el.style.color = "#8e8ea0"
                  }}
                >
                  <RotateCcw size={13} /> Regenerate
                </button>
              </div>
            )}
            {loading && (
              <div className="ca-msg-ai">
                <div className="ca-bubble-ai">
                  <div className="ca-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="ca-input-area">
          <div className="ca-input-wrap">
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = "" }} />
            {imageBase64 && (
              <div className="ca-img-preview">
                <img src={imageBase64} alt="preview" />
                <button className="ca-img-preview-remove" onClick={() => setImageBase64(null)}>
                  <X size={10} />
                </button>
              </div>
            )}
            <div className="ca-input-row">
              <button className="ca-plus-btn" onClick={() => fileInputRef.current?.click()}>
                <Plus size={18} />
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything"
                rows={1}
                className="ca-textarea"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
              {loading ? (
                <button className="ca-send-btn" onClick={stopGeneration}>
                  <Square size={14} fill="currentColor" />
                </button>
              ) : (
                <button
                  className="ca-send-btn"
                  disabled={!input.trim() && !imageBase64}
                  onClick={sendMessage}
                >
                  <ArrowUp size={18} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
          <p className="ca-disclaimer">NUIGPT can make mistakes. Check important info.</p>
        </div>

      </div>
    </>
  )
}
