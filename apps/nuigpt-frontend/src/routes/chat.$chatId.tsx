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
        className={`flex-1 overflow-y-auto px-4 pt-6 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-track]:bg-transparent ${
          dark
            ? "[&::-webkit-scrollbar-thumb]:bg-[#3a3a3a]"
            : "[&::-webkit-scrollbar-thumb]:bg-[#d4d4d4]"
        }`}
      >
        <div className="max-w-[768px] mx-auto w-full flex flex-col gap-7 pb-4">
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
                    <div className="flex flex-col items-end gap-1.5 max-w-[520px]">
                      {" "}
                      {msg.imageBase64 && (
                        <img
                          src={msg.imageBase64}
                          alt="uploaded"
                          className="max-w-[260px] max-h-[200px] rounded-xl object-cover block"
                        />
                      )}
                      {msg.content && (
                        <div
                          className={`px-4 py-3 rounded-[20px] text-[15px] leading-relaxed break-words w-fit ${dark ? "bg-[#2f2f2f] text-[#ececec]" : "bg-[#f4f4f4] text-[#0d0d0d]"}`}
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
                  className={`text-[15px] leading-[1.75] max-w-[768px] w-full prose-headings:font-semibold ${dark ? "text-[#ececec]" : "text-[#0d0d0d]"}`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-3 last:mb-0 leading-7">{children}</p>
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
              <div className="flex w-full">
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
            <div className="flex w-full">
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
          className={`max-w-[768px] mx-auto w-full border rounded-[28px] px-3 py-2 flex flex-col shadow-sm transition-all duration-200 ${
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
              className={`flex-1 bg-transparent border-none outline-none resize-none text-[15px] leading-[1.5] min-h-[24px] max-h-[180px] overflow-y-auto p-0 ${
                dark
                  ? "text-[#ececec] placeholder:text-[#6b6b6b]"
                  : "text-[#0d0d0d] placeholder:text-[#8e8ea0]"
              }`}
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
