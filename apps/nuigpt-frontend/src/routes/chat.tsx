// import { createFileRoute, Outlet } from '@tanstack/react-router'
// import { useState } from 'react'
// import { Button } from "@repo/ui/atoms"
// import { PopUp } from "../components/PopUp"
// import { Plus, PanelLeft, Share, MoreHorizontal, ChevronDown, MessageSquare, Search } from "lucide-react"
// import { useEffect } from "react";
// import { api } from "../lib/api"; // adjust if path differs
// import { useNavigate } from "@tanstack/react-router";
// import { useRouterState } from "@tanstack/react-router";

// export const Route = createFileRoute('/chat')({
//     component: ChatLayout,
// })

// function ChatLayout() {
//     const [isSidebarOpen, setIsSidebarOpen] = useState(true)
//     const [activePop, setActivePop] = useState<string | null>(null)
//     const navigate = useNavigate();
//     const [chats, setChats] = useState<any[]>([])
//     const router = useRouterState();
//     const [search, setSearch] = useState("");
//     const activeChatId = router.location.pathname.split("/").pop();
//     useEffect(() => {
//         api.get("/users/me")
//             .then(res => console.log("User:", res.data))
//             .catch(err => console.log("Error status:", err.response?.status));
//     }, []);
//     useEffect(() => {
//         loadChats()
//     }, [])

//     const loadChats = async () => {
//         try {
//             const res = await api.get("/chats")
//             setChats(res.data)
//         } catch (err) {
//             console.error("Error loading chats")
//         }
//     }
//     useEffect(() => {
//         const closeMenu = () => setActivePop(null)
//         window.addEventListener("click", closeMenu)
//         return () => window.removeEventListener("click", closeMenu)
//     }, [])

//     useEffect(() => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     window.location.href = "https://numentica-ui/login";
//   }
// }, []);
// useEffect(() => {

//   const searchChats = async () => {
//     if (!search) {
//       loadChats()
//       return
//     }

//     try {
//       const res = await api.get(`/chats/search?q=${search}`)
//       setChats(res.data)
//     } catch (err) {
//       console.error("Search error")
//     }
//   }

//   const timeout = setTimeout(searchChats, 300)

//   return () => clearTimeout(timeout)

// }, [search])
//     return (
//         <div className="flex h-screen w-full bg-white text-[#0D0D0D] overflow-hidden relative">

//             {/* SHARED POPUP FRAME */}


//             {/* SIDEBAR */}
//             {isSidebarOpen && (
//                 <aside className="w-[260px] bg-[#F9F9F9] h-full flex flex-col border-r border-gray-200 shrink-0">
//                     <div className="p-3 flex flex-col h-full">
//                         <div className="flex justify-between items-center mb-4 px-1">
//                             <div className="w-6 h-6 bg-black rounded-full" />
//                             <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="h-8 w-8 text-gray-500 hover:bg-gray-200">
//                                 <PanelLeft size={18} />
//                             </Button>
//                         </div>

//                         {/* TOP NAV: Only New Chat and Search */}
//                         <nav className="flex flex-col gap-1">
//                             <Button
//                                 variant="ghost"
//                                 className="justify-start gap-3 h-10 px-2 font-normal hover:bg-gray-200 rounded-lg"
//                                 onClick={async () => {
//                                     try {
//                                         const res = await api.post("/chats");
//                                         console.log("Created chat:", res.data);
//                                         await loadChats();

//                                         navigate({
//                                             to: "/chat/$chatId",
//                                             params: { chatId: res.data.id },
//                                         });

//                                     } catch (err: any) {
//                                         console.log("Error creating chat:", err.response?.data);
//                                     }
//                                 }}
//                             >
//                                 <Plus size={18} /> <span>New chat</span>
//                             </Button>
//                            <div className="flex items-center gap-2 px-3 bg-gray-100 rounded-xl">
//   <Search size={16} />
//   <input
//     placeholder="Search chats"
//     value={search}
//     onChange={(e) => setSearch(e.target.value)}
//     className="bg-transparent outline-none text-sm w-full py-2"
//   />
// </div>
//                         </nav>

//                         {/* CHAT HISTORY */}
//                         <div className="mt-8 flex-1 overflow-y-auto px-1">
//                             <h3 className="text-[12px] text-gray-500 mb-2 px-2 font-medium">Your chats</h3>
//                             {chats.map((chat) => (
//                                 <div
//                                     key={chat.id}
//                                     className={`relative p-2.5 rounded-xl text-[14px] font-medium flex items-center justify-between cursor-pointer transition-colors ${activeChatId === chat.id
//                                         ? "bg-gray-300"
//                                         : "bg-[#ECECEC] hover:bg-gray-300"
//                                         }`}
//                                 >

//                                     {/* CHAT TITLE */}
//                                     <div
//                                         className="flex items-center gap-2 flex-1"
//                                         onClick={() =>
//                                             navigate({
//                                                 to: "/chat/$chatId",
//                                                 params: { chatId: chat.id },
//                                             })
//                                         }
//                                     >
//                                         <MessageSquare size={14} />
//                                         <span className="truncate">{chat.title}</span>
//                                     </div>

//                                     {/* MENU BUTTON */}
//                                     <button
//                                         className="p-1 hover:bg-gray-200 rounded"
//                                         onClick={(e) => {
//                                             e.stopPropagation();
//                                             setActivePop(chat.id);
//                                         }}
//                                     >
//                                         <MoreHorizontal size={16} />
//                                     </button>

//                                     {/* DROPDOWN MENU */}
//                                     {activePop === chat.id && (
//                                         <div className="absolute right-2 top-10 bg-white shadow-lg rounded-lg p-2 text-sm z-50">
//                                             <button
//                                                 className="block w-full text-left px-3 py-2 hover:bg-gray-100"
//                                                 onClick={async () => {
//                                                     await api.delete(`/chats/${chat.id}`);
//                                                     setActivePop(null);
//                                                     loadChats();
//                                                 }}
//                                             >
//                                                 Delete
//                                             </button>
//                                         </div>
//                                     )}

//                                 </div>
//                             ))}
//                         </div>

//                         {/* PROFILE FOOTER */}
//                         <div className="mt-auto pt-4 border-t border-gray-100">
//                             <div
//                                 onClick={() => console.log("profile clicked")}
//                                 className="flex items-center justify-between p-1 hover:bg-gray-200 rounded-xl cursor-pointer"
//                             >
//                                 <div className="flex items-center gap-2 p-1">
//                                     <div className="w-8 h-8 bg-[#5436DA] rounded-full flex items-center justify-center text-white text-xs font-bold">RX</div>
//                                     <span className="text-[13px] font-medium">RIXCY S</span>
//                                 </div>
//                                 <Button variant="outline" className="h-7 text-[11px] px-3 bg-white border-gray-200 rounded-lg shadow-sm">Upgrade</Button>
//                             </div>
//                         </div>
//                     </div>
//                 </aside>
//             )}

//             {/* MAIN CONTENT AREA */}
//             <main className="flex-1 flex flex-col relative h-full">
//                 <header className="flex items-center justify-between p-3">
//                     <div className="flex items-center gap-1">
//                         {!isSidebarOpen && (
//                             <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="mr-2">
//                                 <PanelLeft size={20} />
//                             </Button>
//                         )}
//                         <div className="flex items-center gap-1 hover:bg-gray-100 p-2 px-3 rounded-xl cursor-pointer transition-colors">
//                             <span className="text-[18px] font-semibold text-gray-700">NUIGPT</span>
//                             <ChevronDown size={16} className="text-gray-400 mt-1" />
//                         </div>
//                     </div>

//                     <div className="flex items-center gap-1">
//                         <Button
//                             variant="ghost"

//                             onClick={() => console.log("options clicked")}
//                             className="gap-2 px-3 rounded-xl text-gray-600 hover:bg-gray-100">
//                             <Share size={18} />
//                             <span className="text-sm font-medium">Share</span>
//                         </Button>
//                         <Button
//                             variant="ghost"
//                             onClick={() => console.log("options clicked")}
//                             className="h-9 w-9 text-gray-600 rounded-xl hover:bg-gray-100"
//                         >
//                             <MoreHorizontal size={20} />
//                         </Button>
//                     </div>
//                 </header>

//                 <div className="flex-1 overflow-hidden">
//                     <Outlet />
//                 </div>
//             </main>
//         </div>
//     )
// }


import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plus, PanelLeft, Share, MoreHorizontal, ChevronDown, Search, Pencil, Sun, Moon } from "lucide-react"
import { createContext, useContext } from 'react'
import { api } from "../lib/api"
import { useNavigate, useRouterState } from "@tanstack/react-router"

export const Route = createFileRoute('/chat')({
    component: ChatLayout,
})

export const ThemeContext = createContext<{ dark: boolean; toggleDark: () => void }>({
    dark: false,
    toggleDark: () => { }
})

export const useTheme = () => useContext(ThemeContext)

function ChatLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [activePop, setActivePop] = useState<string | null>(null)
    const navigate = useNavigate()
    const [chats, setChats] = useState<any[]>([])
    const router = useRouterState()
    const [search, setSearch] = useState("")
    const activeChatId = router.location.pathname.split("/").pop()
    const [dark, setDark] = useState(false)
const toggleDark = () => setDark(prev => !prev)
const [selectedModel, setSelectedModel] = useState("gpt-4o-mini")
const [modelDropOpen, setModelDropOpen] = useState(false)

const models = [
  { id: "gpt-4o-mini", name: "GPT-4o mini", sub: "Fast & efficient" },
  { id: "gpt-4o", name: "GPT-4o", sub: "Most capable" },
]

const selectModel = async (modelId: string) => {
  setSelectedModel(modelId)
  setModelDropOpen(false)
  try {
    await api.patch("/users/me/model", { model: modelId })
  } catch (err) {
    console.error("Failed to save model preference")
  }
}
  useEffect(() => {
    api.get("/users/me")
        .then(res => {
          if (res.data.preferredModel) setSelectedModel(res.data.preferredModel)
        })
        .catch(err => console.log("Error status:", err.response?.status))
}, [])
    useEffect(() => { loadChats() }, [])

    const loadChats = async () => {
        try {
            const res = await api.get("/chats")
            setChats(res.data)
        } catch (err) {
            console.error("Error loading chats")
        }
    }

    useEffect(() => {
    const closeMenu = () => { setActivePop(null); setModelDropOpen(false) }
    window.addEventListener("click", closeMenu)
    return () => window.removeEventListener("click", closeMenu)
}, [])
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate({ to: "/" })
        }
    }, [])

    useEffect(() => {
        const searchChats = async () => {
            if (!search) { loadChats(); return }
            try {
                const res = await api.get(`/chats/search?q=${search}`)
                setChats(res.data)
            } catch (err) { console.error("Search error") }
        }
        const timeout = setTimeout(searchChats, 300)
        return () => clearTimeout(timeout)
    }, [search])

    const createChat = async () => {
        try {
            const res = await api.post("/chats")
            await loadChats()
            navigate({ to: "/chat/$chatId", params: { chatId: res.data.id } })
        } catch (err: any) {
            console.log("Error creating chat:", err.response?.data)
        }
    }

    return (
        <>
            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

               .c-root {
    font-family: ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif;
    display: flex;
    height: 100vh;
    width: 100%;
    background: #ffffff;
    color: #0d0d0d;
    overflow: hidden;
    font-size: 14px;
    line-height: 1.5;
}
.c-root.dark {
    background: #212121;
    color: #ececec;
}
.c-root.dark .c-sidebar {
    background: #171717;
    border-right-color: #2a2a2a;
}
.c-root.dark .c-icon-btn { color: #8e8ea0; }
.c-root.dark .c-icon-btn:hover { background: #2a2a2a; color: #ececec; }
.c-root.dark .c-nav-item { color: #ececec; }
.c-root.dark .c-nav-item:hover { background: #2a2a2a; }
.c-root.dark .c-nav-item svg { color: #8e8ea0; }
.c-root.dark .c-search-row:hover { background: #2a2a2a; }
.c-root.dark .c-search-row svg { color: #8e8ea0; }
.c-root.dark .c-search-row input { color: #ececec; }
.c-root.dark .c-search-row input::placeholder { color: #8e8ea0; }
.c-root.dark .c-section-label { color: #8e8ea0; }
.c-root.dark .c-chat-item:hover { background: #2a2a2a; }
.c-root.dark .c-chat-item.active { background: #2a2a2a; }
.c-root.dark .c-chat-title { color: #ececec; }
.c-root.dark .c-chat-more { color: #8e8ea0; }
.c-root.dark .c-chat-more:hover { background: #3a3a3a; color: #ececec; }
.c-root.dark .c-dropdown { background: #2a2a2a; border-color: #3a3a3a; }
.c-root.dark .c-dropdown button:hover { background: #3a3a3a; }
.c-root.dark .c-footer { border-top-color: #2a2a2a; }
.c-root.dark .c-profile:hover { background: #2a2a2a; }
.c-root.dark .c-profile-name { color: #ececec; }
.c-root.dark .c-profile-sub { color: #8e8ea0; }
.c-root.dark .c-upgrade-btn { background: #2a2a2a; border-color: #3a3a3a; color: #ececec; }
.c-root.dark .c-upgrade-btn:hover { background: #3a3a3a; }
.c-root.dark .c-main { background: #212121; }
.c-root.dark .c-model-btn:hover { background: #2a2a2a; }
.c-root.dark .c-model-name { color: #ececec; }
.c-root.dark .c-hdr-btn { color: #8e8ea0; }
.c-root.dark .c-hdr-btn:hover { background: #2a2a2a; color: #ececec; }
.c-root.dark .c-hdr-icon-btn { color: #8e8ea0; }
.c-root.dark .c-hdr-icon-btn:hover { background: #2a2a2a; color: #ececec; }
.c-root.dark .c-logo svg circle,
.c-root.dark .c-logo svg path { stroke: #ececec; }

                /* ── SIDEBAR ── */
                .c-sidebar {
                    width: 260px;
                    background: #f9f9f9;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    flex-shrink: 0;
                    padding: 8px;
                    border-right: 1px solid #e5e5e5;
                }

                .c-sidebar-toprow {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 4px 4px 6px 6px;
                    margin-bottom: 2px;
                }

                .c-logo {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #0d0d0d;
                }

                .c-top-icons {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                }

                .c-icon-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #6b6b6b;
                    border-radius: 8px;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.12s, color 0.12s;
                    flex-shrink: 0;
                }
                .c-icon-btn:hover { background: #ececec; color: #0d0d0d; }

                .c-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    margin-bottom: 4px;
                }

                .c-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    color: #0d0d0d;
                    font-size: 14px;
                    font-weight: 400;
                    transition: background 0.12s;
                    background: none;
                    border: none;
                    text-align: left;
                    width: 100%;
                    font-family: inherit;
                }
                .c-nav-item:hover { background: #ececec; }
                .c-nav-item svg { color: #6b6b6b; flex-shrink: 0; }

                .c-search-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 10px;
                    border-radius: 8px;
                    color: #0d0d0d;
                    font-size: 14px;
                    transition: background 0.12s;
                    width: 100%;
                }
                .c-search-row:hover { background: #ececec; }
                .c-search-row svg { color: #6b6b6b; flex-shrink: 0; }
                .c-search-row input {
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #0d0d0d;
                    font-size: 14px;
                    width: 100%;
                    font-family: inherit;
                    cursor: text;
                }
                .c-search-row input::placeholder { color: #6b6b6b; }

                /* History */
                .c-history {
                    flex: 1;
                    overflow-y: auto;
                    margin-top: 4px;
                }
                .c-history::-webkit-scrollbar { width: 4px; }
                .c-history::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 4px; }
                .c-history::-webkit-scrollbar-track { background: transparent; }

                .c-section-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: #6b6b6b;
                    padding: 10px 10px 4px;
                }

                .c-chat-item {
                    position: relative;
                    display: flex;
                    align-items: center;
                    padding: 7px 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    gap: 6px;
                    transition: background 0.1s;
                }
                .c-chat-item:hover { background: #ececec; }
                .c-chat-item.active { background: #ececec; }

                .c-chat-title {
                    font-size: 14px;
                    color: #0d0d0d;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    flex: 1;
                    font-weight: 400;
                }

                .c-chat-more {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #6b6b6b;
                    border-radius: 6px;
                    width: 26px;
                    height: 26px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.1s, background 0.1s;
                    flex-shrink: 0;
                }
                .c-chat-item:hover .c-chat-more,
                .c-chat-item.active .c-chat-more { opacity: 1; }
                .c-chat-more:hover { background: #d9d9d9; color: #0d0d0d; }

                .c-dropdown {
                    position: absolute;
                    right: 4px;
                    top: calc(100% + 2px);
                    background: #ffffff;
                    border: 1px solid #e5e5e5;
                    border-radius: 10px;
                    padding: 4px;
                    z-index: 100;
                    min-width: 140px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                }
                .c-dropdown button {
                    display: block;
                    width: 100%;
                    text-align: left;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #e03131;
                    font-size: 14px;
                    font-family: inherit;
                    padding: 8px 12px;
                    border-radius: 6px;
                    transition: background 0.1s;
                }
                .c-dropdown button:hover { background: #f5f5f5; }

                /* Footer */
                .c-footer {
                    padding-top: 8px;
                    border-top: 1px solid #e5e5e5;
                    margin-top: 4px;
                }
                .c-profile {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.12s;
                }
                .c-profile:hover { background: #ececec; }
                .c-avatar {
                    width: 32px;
                    height: 32px;
                    background: #5436DA;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 700;
                    color: white;
                    flex-shrink: 0;
                    letter-spacing: 0.5px;
                }
                .c-profile-info { flex: 1; min-width: 0; }
                .c-profile-name { font-size: 13px; font-weight: 500; color: #0d0d0d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .c-profile-sub { font-size: 11px; color: #6b6b6b; }
                .c-upgrade-btn {
                    background: #ffffff;
                    border: 1px solid #e5e5e5;
                    color: #0d0d0d;
                    font-size: 12px;
                    font-weight: 500;
                    font-family: inherit;
                    padding: 4px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 0.12s;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                .c-upgrade-btn:hover { background: #f5f5f5; }

                /* ── MAIN ── */
                .c-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #ffffff;
                    position: relative;
                    overflow: hidden;
                }

                .c-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 16px;
                    height: 52px;
                    flex-shrink: 0;
                }

                .c-header-left { display: flex; align-items: center; gap: 2px; }

                .c-model-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    background: none;
                    border: none;
                    color: #0d0d0d;
                    font-family: inherit;
                    transition: background 0.12s;
                }
                .c-model-btn:hover { background: #f0f0f0; }
                .c-model-name { font-size: 16px; font-weight: 600; color: #0d0d0d; }
                .c-model-sub { font-size: 14px; font-weight: 400; color: #6b6b6b; }

                .c-header-right { display: flex; align-items: center; gap: 2px; }

                .c-hdr-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #6b6b6b;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    font-size: 14px;
                    font-family: inherit;
                    transition: background 0.12s, color 0.12s;
                    height: 36px;
                }
                .c-hdr-btn:hover { background: #f0f0f0; color: #0d0d0d; }

                .c-hdr-icon-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #6b6b6b;
                    border-radius: 8px;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.12s, color 0.12s;
                }
                .c-hdr-icon-btn:hover { background: #f0f0f0; color: #0d0d0d; }

                .c-content {
                    flex: 1;
                    overflow: hidden;
                }
            `}</style>

            <ThemeContext.Provider value={{ dark, toggleDark }}>
                <div className={`c-root${dark ? " dark" : ""}`}>

                    {/* ── SIDEBAR ── */}
                    {isSidebarOpen && (
                        <aside className="c-sidebar">

                            {/* Top row: logo + collapse + new chat */}
                            <div className="c-sidebar-toprow">
                                <div className="c-logo">
                                    {/* Simple circle logo like ChatGPT */}
                                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                        <circle cx="14" cy="14" r="13" stroke="#0d0d0d" strokeWidth="1.5" />
                                        <path d="M9 14.5c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="c-top-icons">
                                    <button className="c-icon-btn" title="Close sidebar" onClick={() => setIsSidebarOpen(false)}>
                                        <PanelLeft size={18} />
                                    </button>
                                    <button className="c-icon-btn" title="New chat" onClick={createChat}>
                                        <Pencil size={17} />
                                    </button>
                                </div>
                            </div>

                            {/* Nav */}
                            <nav className="c-nav">
                                <button className="c-nav-item" onClick={createChat}>
                                    <Plus size={17} />
                                    New chat
                                </button>
                                <div className="c-search-row">
                                    <Search size={16} />
                                    <input
                                        placeholder="Search chats"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </nav>

                            {/* Chat history */}
                            <div className="c-history">
                                <div className="c-section-label">Your chats</div>
                                {chats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className={`c-chat-item${activeChatId === chat.id ? " active" : ""}`}
                                    >
                                        <span
                                            className="c-chat-title"
                                            onClick={() => navigate({ to: "/chat/$chatId", params: { chatId: chat.id } })}
                                        >
                                            {chat.title}
                                        </span>
                                        <button
                                            className="c-chat-more"
                                            onClick={(e) => { e.stopPropagation(); setActivePop(chat.id); }}
                                        >
                                            <MoreHorizontal size={15} />
                                        </button>
                                        {activePop === chat.id && (
                                            <div className="c-dropdown">
                                                <button onClick={async () => {
                                                    await api.delete(`/chats/${chat.id}`)
                                                    setActivePop(null)
                                                    loadChats()
                                                }}>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Profile footer */}
                            <div className="c-footer">
                                <div className="c-profile" onClick={() => console.log("profile clicked")}>
                                    <div className="c-avatar">RX</div>
                                    <div className="c-profile-info">
                                        <div className="c-profile-name">SRUTHI ALEX</div>
                                        <div className="c-profile-sub">Free</div>
                                    </div>
                                    <button className="c-upgrade-btn" onClick={(e) => e.stopPropagation()}>
                                        Upgrade
                                    </button>
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* ── MAIN ── */}
                    <main className="c-main">
                        <header className="c-header">
                            <div className="c-header-left">
                                {!isSidebarOpen && (
                                    <>
                                        <button className="c-icon-btn" onClick={() => setIsSidebarOpen(true)}>
                                            <PanelLeft size={18} />
                                        </button>
                                        <button className="c-icon-btn" onClick={createChat}>
                                            <Pencil size={17} />
                                        </button>
                                    </>
                                )}
                               <div style={{ position: "relative" }}>
  <button className="c-model-btn" onClick={(e) => { e.stopPropagation(); setModelDropOpen(p => !p) }}>
    <span className="c-model-name">NUIGPT</span>
    <span className="c-model-sub">{models.find(m => m.id === selectedModel)?.name ?? "Auto"}</span>
    <ChevronDown size={14} style={{ color: "#6b6b6b" }} />
  </button>
  {modelDropOpen && (
    <div style={{
      position: "absolute", top: "calc(100% + 6px)", left: 0,
      background: dark ? "#2a2a2a" : "#ffffff",
      border: `1px solid ${dark ? "#3a3a3a" : "#e5e5e5"}`,
      borderRadius: "12px", padding: "6px", zIndex: 200,
      minWidth: "200px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)"
    }}>
      {models.map(m => (
        <button key={m.id} onClick={() => selectModel(m.id)} style={{
          display: "flex", flexDirection: "column", alignItems: "flex-start",
          width: "100%", background: selectedModel === m.id ? (dark ? "#3a3a3a" : "#f0f0f0") : "none",
          border: "none", cursor: "pointer", padding: "10px 12px", borderRadius: "8px",
          fontFamily: "inherit", transition: "background 0.1s", gap: "2px"
        }}
        onMouseEnter={e => (e.currentTarget.style.background = dark ? "#3a3a3a" : "#f0f0f0")}
        onMouseLeave={e => (e.currentTarget.style.background = selectedModel === m.id ? (dark ? "#3a3a3a" : "#f0f0f0") : "none")}
        >
          <span style={{ fontSize: "14px", fontWeight: 500, color: dark ? "#ececec" : "#0d0d0d" }}>{m.name}</span>
          <span style={{ fontSize: "12px", color: "#8e8ea0" }}>{m.sub}</span>
        </button>
      ))}
    </div>
  )}
</div>
                            </div>
                            <div className="c-header-right">
                                <button className="c-hdr-btn" onClick={() => console.log("share")}>
                                    <Share size={16} />
                                    <span>Share</span>
                                </button>
                                <button className="c-hdr-icon-btn" onClick={toggleDark} title="Toggle theme">
                                    {dark ? <Sun size={18} /> : <Moon size={18} />}
                                </button>
                                <button className="c-hdr-icon-btn" onClick={() => console.log("more")}>
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                        </header>

                        <div className="c-content">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </ThemeContext.Provider>
        </>
    )
}