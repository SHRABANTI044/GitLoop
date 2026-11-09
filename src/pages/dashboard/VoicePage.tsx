import { useEffect, useRef, useState } from "react";
import { Mic, Bot, User, ChevronDown, Send, AudioWaveform, Square } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DashboardAPI, type Conversation, type Message } from "../../lib/dashboard";
import type { Repository } from "../../lib/auth";

interface SpeechRecognitionCtor {
  new (): SpeechRecognitionInstance;
}
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getRecognition(): SpeechRecognitionInstance | null {
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}

const bars = [14, 26, 38, 52, 44, 62, 48, 70, 56, 40, 64, 50, 34, 58, 42, 66, 46, 30, 52, 38, 24, 44, 32, 20];

export default function VoicePage() {
  const { user } = useAuth();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [repoId, setRepoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    DashboardAPI.repositories(user.id).then((rs) => {
      setRepos(rs);
      if (rs.length > 0) setRepoId(rs[0].id);
    });
    setSupported(!!getRecognition());
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (question: string) => {
    if (!user || !question.trim() || busy) return;
    setBusy(true);
    try {
      const convs = await DashboardAPI.conversations(user.id);
      let conv: Conversation = convs[0] ?? (await DashboardAPI.createConversation(user.id, repoId, "Voice conversation"));
      const userMsg: Message = { id: `tmp-${Date.now()}`, conversationId: conv.id, role: "user", content: question, createdAt: new Date().toISOString() };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      const reply = await DashboardAPI.chat(user.id, { conversationId: conv.id, repositoryId: repoId, question });
      setMessages((m) => [...m, reply]);
    } finally {
      setBusy(false);
    }
  };

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = getRecognition();
    if (!rec) {
      setSupported(false);
      return;
    }
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      send(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-extrabold tracking-tight">Voice <span className="text-gradient">Assistant</span></h2>
        <p className="mt-1 text-[13.5px] text-[#94A3B8]">Talk to your projects. Literally.</p>
      </div>

      <section className="relative overflow-hidden rounded-[22px] border border-[#252D43] bg-[#0B1020]/90 backdrop-blur">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5CF6]/10 blur-[90px]" />
        </div>

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[320px_1fr]">
          {/* Mic visual */}
          <div className="flex flex-col items-center">
            <div className="relative flex h-[240px] w-[240px] items-center justify-center">
              <span className={`absolute inset-0 rounded-full border border-[#8B5CF6]/20 ${listening ? "animate-pulse-ring" : ""}`} aria-hidden />
              <span className="absolute inset-8 rounded-full border border-dashed border-[#22D3EE]/25 animate-[spin_30s_linear_infinite]" aria-hidden />
              <div className="absolute inset-0 flex items-center justify-center gap-[3px] px-8" aria-hidden>
                {bars.map((h, i) => (
                  <span
                    key={i}
                    className={`w-[3px] rounded-full bg-gradient-to-t from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] ${listening ? "wave-bar" : ""}`}
                    style={{ height: `${listening ? h : 18}%`, animationDelay: `${i * 0.07}s`, opacity: listening ? 0.4 + (h / 100) * 0.6 : 0.3 }}
                  />
                ))}
              </div>
              <button
                onClick={toggleListening}
                disabled={!supported || busy}
                className={`relative flex h-[96px] w-[96px] items-center justify-center rounded-full border transition-all duration-300 ${
                  listening
                    ? "border-[#22D3EE]/60 bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] shadow-[0_0_50px_rgba(34,211,238,0.45)]"
                    : "border-[#A855F7]/50 bg-gradient-to-br from-[#151D32] to-[#0B1020] shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:scale-105"
                } disabled:opacity-50`}
                aria-label={listening ? "Stop listening" : "Start voice input"}
              >
                {listening ? <Square className="h-9 w-9 text-white" /> : <Mic className="h-9 w-9 text-white drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />}
              </button>
            </div>
            <p className="mt-3 text-[12px] font-bold tracking-[0.14em] text-[#94A3B8] uppercase">
              {listening ? "Listening…" : supported ? "Tap mic to speak" : "Voice not supported here"}
            </p>
            {!supported && <p className="mt-1.5 max-w-[240px] text-center text-[11.5px] text-[#64748B]">Your browser doesn&apos;t support speech recognition. Type instead — the AI is the same.</p>}

            <label className="relative mt-5 w-full max-w-[260px]">
              <span className="sr-only">Repository context</span>
              <select value={repoId ?? ""} onChange={(e) => setRepoId(e.target.value || null)} className="w-full appearance-none truncate rounded-xl border border-[#252D43] bg-[#090D18] py-2.5 pl-3.5 pr-9 text-[12.5px] font-semibold text-white outline-none focus:border-[#8B5CF6]/55">
                <option value="">All repositories</option>
                {repos.map((r) => <option key={r.id} value={r.id}>{r.fullName}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            </label>
          </div>

          {/* Conversation */}
          <div className="flex min-w-0 flex-col">
            <div ref={scrollRef} className="min-h-[280px] flex-1 space-y-4 overflow-y-auto pr-1">
              {messages.length === 0 && !busy ? (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#A855F7]">
                    <AudioWaveform className="h-6 w-6" />
                  </span>
                  <p className="mt-4 text-[14.5px] font-bold text-white">Ask with your voice</p>
                  <p className="mt-1.5 max-w-xs text-[12.5px] leading-relaxed text-[#64748B]">Try “Which project needs my attention?” or “What should I work on next?”</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
                      m.role === "user" ? "bg-gradient-to-br from-[#3B82F6] to-[#22D3EE]" : "bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]"
                    }`}>
                      {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </span>
                    <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed ${
                      m.role === "user" ? "rounded-br-md bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white" : "rounded-bl-md border border-[#252D43] bg-white/[0.04] text-[#E2E8F0]"
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

            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-4 flex items-center gap-2 rounded-full border border-[#252D43] bg-[#090D18]/80 py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-[#8B5CF6]/55">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type or speak your question…" className="min-w-0 flex-1 bg-transparent text-[13.5px] text-white placeholder:text-[#64748B] outline-none" aria-label="Voice or text question" />
              <button type="submit" disabled={busy || !input.trim()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-transform hover:scale-105 disabled:opacity-50" aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
