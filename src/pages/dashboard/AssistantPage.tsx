import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bot, Send, ChevronDown, Trash2, Plus, User, ShieldCheck, Sparkles, Mic } from "lucide-react";
import { LoadingBlock } from "../../components/dashboard/widgets";
import { useAuth } from "../../context/AuthContext";
import { DashboardAPI, type Conversation, type Message } from "../../lib/dashboard";
import type { Repository } from "../../lib/auth";

const SUGGESTED = [
  "Explain my project architecture.",
  "What does this repository do?",
  "What should I work on next?",
  "Find unfinished tasks in this project.",
  "Explain the main dependencies.",
  "Summarize my recent development activity.",
];

export default function AssistantPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [repoId, setRepoId] = useState<string | null>(params.get("repo"));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConvs = async () => {
    if (!user) return;
    const list = await DashboardAPI.conversations(user.id);
    setConvs(list);
    return list;
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [rs, cs] = await Promise.all([DashboardAPI.repositories(user.id), DashboardAPI.conversations(user.id)]);
      setRepos(rs);
      setConvs(cs);
      if (params.get("repo")) setRepoId(params.get("repo"));
      const first = cs[0];
      if (first) {
        setActiveId(first.id);
        setRepoId(first.repositoryId);
        setMessages(await DashboardAPI.messages(first.id));
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const newConversation = async () => {
    if (!user) return;
    const conv = await DashboardAPI.createConversation(user.id, repoId, "New conversation");
    setConvs((c) => [conv, ...c]);
    setActiveId(conv.id);
    setMessages([]);
  };

  const openConversation = async (id: string) => {
    const conv = convs.find((c) => c.id === id);
    setActiveId(id);
    if (conv) setRepoId(conv.repositoryId);
    setMessages(await DashboardAPI.messages(id));
  };

  const deleteConversation = async (id: string) => {
    if (!user) return;
    await DashboardAPI.deleteConversation(user.id, id);
    const next = convs.filter((c) => c.id !== id);
    setConvs(next);
    if (activeId === id) {
      setActiveId(next[0]?.id ?? null);
      setMessages(next[0] ? await DashboardAPI.messages(next[0].id) : []);
    }
  };

  const send = async (question: string) => {
    if (!user || !question.trim() || busy) return;
    setBusy(true);
    try {
      let convId = activeId;
      if (!convId) {
        const conv = await DashboardAPI.createConversation(user.id, repoId, "New conversation");
        convId = conv.id;
        setActiveId(convId);
        setConvs((c) => [conv, ...c]);
      }
      const optimistic: Message = { id: `tmp-${Date.now()}`, conversationId: convId, role: "user", content: question, createdAt: new Date().toISOString() };
      setMessages((m) => [...m, optimistic]);
      setInput("");
      const reply = await DashboardAPI.chat(user.id, { conversationId: convId, repositoryId: repoId, question });
      setMessages((m) => [...m.filter((x) => x.id !== optimistic.id), optimistic, reply]);
      await loadConvs();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingBlock label="Loading AI assistant…" />;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[24px] font-extrabold tracking-tight">AI Project <span className="text-gradient">Assistant</span></h2>
        <p className="mt-1 text-[13.5px] text-[#94A3B8]">Repository-aware answers grounded in your GitHub metadata and tracked tasks.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Conversations */}
        <aside className="rounded-[22px] border border-[#252D43] bg-[#10182A]/80 p-4 backdrop-blur">
          <button onClick={newConversation} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-4 py-3 text-[13.5px] font-semibold text-white glow-btn transition-all hover:brightness-110">
            <Plus className="h-4.5 w-4.5" /> New conversation
          </button>
          <p className="mt-5 px-1 text-[10px] font-bold tracking-[0.18em] text-[#475569] uppercase">History</p>
          {convs.length === 0 ? (
            <p className="mt-3 px-1 text-[12.5px] leading-relaxed text-[#64748B]">No conversations yet. Start one below.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {convs.map((c) => (
                <li key={c.id} className="group flex items-center gap-1">
                  <button
                    onClick={() => openConversation(c.id)}
                    className={`min-w-0 flex-1 truncate rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors ${
                      activeId === c.id ? "border border-[#8B5CF6]/35 bg-[#8B5CF6]/12 font-semibold text-white" : "text-[#94A3B8] hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    {c.title}
                  </button>
                  <button
                    onClick={() => deleteConversation(c.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#64748B] opacity-0 transition-all hover:bg-[#F87171]/10 hover:text-[#FCA5A5] group-hover:opacity-100"
                    aria-label={`Delete ${c.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Chat */}
        <section className="relative overflow-hidden rounded-[22px] border border-[#8B5CF6]/25 bg-[#0B1020]/90 backdrop-blur">
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#8B5CF6]/12 blur-[70px]" aria-hidden />
          <div className="relative flex h-[640px] max-h-[75vh] flex-col">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 border-b border-[#252D43]/80 px-5 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-[0_0_20px_rgba(139,92,246,0.45)]">
                <Bot className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="text-[14px] font-bold text-white">GitLoop AI Assistant</p>
                <p className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Repository-aware · Conversations saved
                </p>
              </div>
              <label className="relative ml-auto">
                <span className="sr-only">Repository context</span>
                <select
                  value={repoId ?? ""}
                  onChange={(e) => setRepoId(e.target.value || null)}
                  className="max-w-[220px] appearance-none truncate rounded-full border border-[#252D43] bg-white/[0.03] py-2 pl-3.5 pr-9 text-[12px] font-semibold text-white outline-none focus:border-[#8B5CF6]/55"
                >
                  <option value="">All repositories</option>
                  {repos.map((r) => <option key={r.id} value={r.id}>{r.fullName}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
              </label>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
              {messages.length === 0 && !busy ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#A855F7]">
                    <Sparkles className="h-6 w-6" />
                  </span>
                  <p className="mt-4 text-[15px] font-bold text-white">Ask anything about your projects</p>
                  <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-[#64748B]">
                    Answers are grounded in GitHub metadata and your tracked tasks. I&apos;ll never claim to have inspected files that weren&apos;t retrieved.
                  </p>
                  <div className="mt-5 flex max-w-md flex-wrap justify-center gap-2">
                    {SUGGESTED.map((s) => (
                      <button key={s} onClick={() => send(s)} className="rounded-full border border-[#252D43] bg-white/[0.03] px-3.5 py-2 text-[12px] text-[#CBD5E1] transition-all hover:border-[#8B5CF6]/50 hover:text-white">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
                      m.role === "user" ? "bg-gradient-to-br from-[#3B82F6] to-[#22D3EE]" : "bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] shadow-[0_0_14px_rgba(139,92,246,0.4)]"
                    }`}>
                      {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </span>
                    <div className={`max-w-[82%] whitespace-pre-line rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-md bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white"
                        : "rounded-bl-md border border-[#252D43] bg-white/[0.04] text-[#E2E8F0]"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              {busy && (
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#252D43] bg-white/[0.04] px-4 py-3.5">
                    <span className="typing-dot h-2 w-2 rounded-full bg-[#A855F7]" />
                    <span className="typing-dot h-2 w-2 rounded-full bg-[#3B82F6]" />
                    <span className="typing-dot h-2 w-2 rounded-full bg-[#22D3EE]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-[#252D43]/80 px-5 py-4">
              <form
                onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex items-center gap-2 rounded-full border border-[#252D43] bg-[#090D18]/80 py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-[#8B5CF6]/55"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your codebase…"
                  className="min-w-0 flex-1 bg-transparent text-[13.5px] text-white placeholder:text-[#64748B] outline-none"
                  aria-label="Ask your AI companion"
                />
                <button type="button" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#252D43] text-[#94A3B8] transition-colors hover:border-[#8B5CF6]/40 hover:text-white" aria-label="Voice input (open Voice Assistant)" onClick={() => navigate("/dashboard/voice")}>
                  <Mic className="h-4 w-4" />
                </button>
                <button type="submit" disabled={busy || !input.trim()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-transform hover:scale-105 disabled:opacity-50" aria-label="Send message">
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-[#475569]">
                <ShieldCheck className="h-3 w-3 text-[#22D3EE]" />
                Only your authorized repositories and tracked tasks are used as context.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
