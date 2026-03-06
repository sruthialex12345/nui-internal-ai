import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Plus,
  PanelLeft,
  Share,
  MoreHorizontal,
  ChevronDown,
  Search,
  Pencil,
  Sun,
  Moon,
} from "lucide-react";
import { createContext, useContext } from "react";
import { api } from "../lib/api";
import { useNavigate, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/chat")({
  component: ChatLayout,
});

export const ThemeContext = createContext<{
  dark: boolean;
  toggleDark: () => void;
}>({
  dark: false,
  toggleDark: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function ChatLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePop, setActivePop] = useState<string | null>(null);
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const router = useRouterState();
  const [search, setSearch] = useState("");
  const activeChatId = router.location.pathname.split("/").pop();
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [modelDropOpen, setModelDropOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const models = [
    { id: "gpt-4o-mini", name: "GPT-4o mini", sub: "Fast & efficient" },
    { id: "gpt-4o", name: "GPT-4o", sub: "Most capable" },
  ];
  const toggleDark = () =>
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  const selectModel = async (modelId: string) => {
    setSelectedModel(modelId);
    setModelDropOpen(false);
    try {
      await api.patch("/users/me/model", { model: modelId });
    } catch (err) {
      console.error("Failed to save model preference");
    }
  };

  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => {
        if (res.data.preferredModel) setSelectedModel(res.data.preferredModel);
        if (res.data.name) setUserName(res.data.name);
        if (res.data.email) setUserEmail(res.data.email);
      })
      .catch((err) => console.log("Error status:", err.response?.status));
  }, []);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const res = await api.get("/chats");
      setChats(res.data);
    } catch (err) {
      console.error("Error loading chats");
    }
  };

  useEffect(() => {
    const closeMenu = () => {
      setActivePop(null);
      setModelDropOpen(false);
    };
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate({ to: "/" });
  }, []);

  useEffect(() => {
    const searchChats = async () => {
      if (!search) {
        loadChats();
        return;
      }
      try {
        const res = await api.get(`/chats/search?q=${search}`);
        setChats(res.data);
      } catch (err) {
        console.error("Search error");
      }
    };
    const timeout = setTimeout(searchChats, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const createChat = async () => {
    try {
      const res = await api.post("/chats");
      await loadChats();
      navigate({ to: "/chat/$chatId", params: { chatId: res.data.id } });
    } catch (err: any) {
      console.log("Error creating chat:", err.response?.data);
    }
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      <div
        className={`flex h-screen w-full overflow-hidden text-sm font-sans ${dark ? "bg-[#212121] text-[#ececec]" : "bg-white text-[#0d0d0d]"}`}
      >
        {/* ── SIDEBAR ── */}
        {isSidebarOpen && (
          <aside
            className={`w-[260px] h-full flex flex-col flex-shrink-0 p-2 border-r ${dark ? "bg-[#171717] border-[#2a2a2a]" : "bg-[#f9f9f9] border-[#e5e5e5]"}`}
          >
            {/* Top row */}
            <div className="flex items-center justify-between px-1.5 pb-1.5 mb-0.5 pt-1">
              <div className="w-7 h-7 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="NUIGPT"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg border-none cursor-pointer transition-colors ${dark ? "text-[#8e8ea0] hover:bg-[#2a2a2a] hover:text-[#ececec]" : "text-[#6b6b6b] hover:bg-[#ececec] hover:text-[#0d0d0d]"}`}
                >
                  <PanelLeft size={18} />
                </button>
                <button
                  onClick={createChat}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg border-none cursor-pointer transition-colors ${dark ? "text-[#8e8ea0] hover:bg-[#2a2a2a] hover:text-[#ececec]" : "text-[#6b6b6b] hover:bg-[#ececec] hover:text-[#0d0d0d]"}`}
                >
                  <Pencil size={17} />
                </button>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-px mb-1">
              <button
                onClick={createChat}
                className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-normal w-full text-left border-none cursor-pointer transition-colors font-[inherit] ${dark ? "text-[#ececec] hover:bg-[#2a2a2a]" : "text-[#0d0d0d] hover:bg-[#ececec]"}`}
              >
                <Plus
                  size={17}
                  className={dark ? "text-[#8e8ea0]" : "text-[#6b6b6b]"}
                />
                New chat
              </button>
              <div
                className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm w-full transition-colors ${dark ? "hover:bg-[#2a2a2a]" : "hover:bg-[#ececec]"}`}
              >
                <Search
                  size={16}
                  className={
                    dark
                      ? "text-[#8e8ea0] flex-shrink-0"
                      : "text-[#6b6b6b] flex-shrink-0"
                  }
                />
                <input
                  placeholder="Search chats"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`bg-transparent border-none outline-none text-sm w-full font-[inherit] cursor-text ${dark ? "text-[#ececec] placeholder:text-[#8e8ea0]" : "text-[#0d0d0d] placeholder:text-[#6b6b6b]"}`}
                />
              </div>
            </nav>

            {/* Chat history */}
            <div className="flex-1 overflow-y-auto mt-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#d4d4d4] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-track]:bg-transparent">
              <div
                className={`text-xs font-medium px-2.5 pt-2.5 pb-1 ${dark ? "text-[#8e8ea0]" : "text-[#6b6b6b]"}`}
              >
                Your chats
              </div>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`relative flex items-center px-2.5 py-[7px] rounded-lg cursor-pointer gap-1.5 transition-colors group ${
                    activeChatId === chat.id
                      ? dark
                        ? "bg-[#2a2a2a]"
                        : "bg-[#ececec]"
                      : dark
                        ? "hover:bg-[#2a2a2a]"
                        : "hover:bg-[#ececec]"
                  }`}
                >
                  <span
                    className={`text-sm font-normal flex-1 whitespace-nowrap overflow-hidden text-ellipsis ${dark ? "text-[#ececec]" : "text-[#0d0d0d]"}`}
                    onClick={() =>
                      navigate({
                        to: "/chat/$chatId",
                        params: { chatId: chat.id },
                      })
                    }
                  >
                    {chat.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePop(chat.id);
                    }}
                    className={`w-[26px] h-[26px] flex items-center justify-center rounded-md border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ${dark ? "text-[#8e8ea0] hover:bg-[#3a3a3a] hover:text-[#ececec]" : "text-[#6b6b6b] hover:bg-[#d9d9d9] hover:text-[#0d0d0d]"}`}
                  >
                    <MoreHorizontal size={15} />
                  </button>
                  {activePop === chat.id && (
                    <div
                      className={`absolute right-1 top-[calc(100%+2px)] border rounded-[10px] p-1 z-50 min-w-[140px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] ${dark ? "bg-[#2a2a2a] border-[#3a3a3a]" : "bg-white border-[#e5e5e5]"}`}
                    >
                      <button
                        onClick={async () => {
                          await api.delete(`/chats/${chat.id}`);
                          setActivePop(null);
                          loadChats();
                        }}
                        className={`block w-full text-left border-none cursor-pointer text-[#e03131] text-sm font-[inherit] px-3 py-2 rounded-md transition-colors ${dark ? "hover:bg-[#3a3a3a]" : "hover:bg-[#f5f5f5]"}`}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Profile footer */}
            <div
              className={`pt-2 border-t mt-1 ${dark ? "border-[#2a2a2a]" : "border-[#e5e5e5]"}`}
            >
              <div
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${dark ? "hover:bg-[#2a2a2a]" : "hover:bg-[#ececec]"}`}
              >
                <div className="w-8 h-8 bg-[#5436DA] rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 tracking-wide">
                  {userName ? userName.slice(0, 2).toUpperCase() : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis ${dark ? "text-[#ececec]" : "text-[#0d0d0d]"}`}
                  >
                    {userName || userEmail || "User"}
                  </div>
                  <div className="text-[11px] text-[#6b6b6b] whitespace-nowrap overflow-hidden text-ellipsis">
                    {userEmail}
                  </div>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate({ to: "/" });
                  }}
                  className={`text-xs font-medium px-3 py-1 rounded-md cursor-pointer transition-colors shadow-sm whitespace-nowrap flex-shrink-0 border ${dark ? "bg-[#2a2a2a] border-[#3a3a3a] text-[#ececec] hover:bg-[#3a3a3a]" : "bg-white border-[#e5e5e5] text-[#0d0d0d] hover:bg-[#f5f5f5]"}`}
                >
                  Log out
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* ── MAIN ── */}
        <main
          className={`flex-1 flex flex-col h-full relative overflow-hidden ${dark ? "bg-[#212121]" : "bg-white"}`}
        >
          <header className="flex items-center justify-between px-4 h-[52px] flex-shrink-0">
            <div className="flex items-center gap-0.5">
              {!isSidebarOpen && (
                <>
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border-none cursor-pointer transition-colors ${dark ? "text-[#8e8ea0] hover:bg-[#2a2a2a] hover:text-[#ececec]" : "text-[#6b6b6b] hover:bg-[#f0f0f0] hover:text-[#0d0d0d]"}`}
                  >
                    <PanelLeft size={18} />
                  </button>
                  <button
                    onClick={createChat}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border-none cursor-pointer transition-colors ${dark ? "text-[#8e8ea0] hover:bg-[#2a2a2a] hover:text-[#ececec]" : "text-[#6b6b6b] hover:bg-[#f0f0f0] hover:text-[#0d0d0d]"}`}
                  >
                    <Pencil size={17} />
                  </button>
                </>
              )}
              {/* Model selector */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModelDropOpen((p) => !p);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-[inherit] transition-colors ${dark ? "hover:bg-[#2a2a2a]" : "hover:bg-[#f0f0f0]"}`}
                >
                  <span
                    className={`text-base font-semibold ${dark ? "text-[#ececec]" : "text-[#0d0d0d]"}`}
                  >
                    NUIGPT
                  </span>
                  <span className="text-sm font-normal text-[#6b6b6b]">
                    {models.find((m) => m.id === selectedModel)?.name ?? "Auto"}
                  </span>
                  <ChevronDown size={14} className="text-[#6b6b6b]" />
                </button>
                {modelDropOpen && (
                  <div
                    className={`absolute top-[calc(100%+6px)] left-0 border rounded-xl p-1.5 z-50 min-w-[200px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] ${dark ? "bg-[#2a2a2a] border-[#3a3a3a]" : "bg-white border-[#e5e5e5]"}`}
                  >
                    {models.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => selectModel(m.id)}
                        className={`flex flex-col items-start w-full border-none cursor-pointer px-3 py-2.5 rounded-lg font-[inherit] transition-colors gap-0.5 ${
                          selectedModel === m.id
                            ? dark
                              ? "bg-[#3a3a3a]"
                              : "bg-[#f0f0f0]"
                            : dark
                              ? "hover:bg-[#3a3a3a]"
                              : "hover:bg-[#f0f0f0]"
                        }`}
                      >
                        <span
                          className={`text-sm font-medium ${dark ? "text-[#ececec]" : "text-[#0d0d0d]"}`}
                        >
                          {m.name}
                        </span>
                        <span className="text-xs text-[#8e8ea0]">{m.sub}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={toggleDark}
                title="Toggle theme"
                className={`w-9 h-9 flex items-center justify-center rounded-lg border-none cursor-pointer transition-colors ${dark ? "text-[#8e8ea0] hover:bg-[#2a2a2a] hover:text-[#ececec]" : "text-[#6b6b6b] hover:bg-[#f0f0f0] hover:text-[#0d0d0d]"}`}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </ThemeContext.Provider>
  );
}
