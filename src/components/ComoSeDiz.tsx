"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

type Mode = "como-se-diz" | "traduza" | "corrija";

interface ComoSeDizResult {
  english: string;
  pronunciation: string;
  alternatives: string[];
  example: string;
  tip: string;
}

interface TraduzResult {
  translation: string;
  alternatives: string[];
  tip: string;
}

interface CorrijaResult {
  corrected: string;
  errors: { original: string; fix: string; explanation: string }[];
  overall: string;
}

const TABS: { key: Mode; label: string; placeholder: string }[] = [
  { key: "como-se-diz", label: "Como se diz?", placeholder: "Digite em português..." },
  { key: "traduza",     label: "Traduza",       placeholder: "Digite em inglês ou português..." },
  { key: "corrija",     label: "Corrija",        placeholder: "Digite sua frase em inglês..." },
];

export default function ComoSeDizFAB() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("como-se-diz");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ComoSeDizResult | TraduzResult | CorrijaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/language-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, text: input.trim() }),
      });
      if (!res.ok) throw new Error("Erro na API");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch {
      setError("Não consegui processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  }

  function handleClose() {
    setOpen(false);
    setInput("");
    setResult(null);
    setError("");
  }

  function switchMode(m: Mode) {
    setMode(m);
    setInput("");
    setResult(null);
    setError("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const currentTab = TABS.find((t) => t.key === mode)!;

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={handleOpen}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg font-semibold text-sm"
        style={{ backgroundColor: "#072547", color: "#FFFFFF" }}
      >
        <MessageCircle size={17} />
        Assistente
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(7,37,71,0.45)" }}
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl px-5 pt-4 pb-8"
              style={{ backgroundColor: "#072547", maxHeight: "88vh", overflowY: "auto" }}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#FF7058" }}>
                  Assistente de Inglês
                </p>
                <button onClick={handleClose}>
                  <X size={18} color="rgba(255,255,255,0.5)" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => switchMode(tab.key)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: mode === tab.key ? "#FF7058" : "rgba(255,255,255,0.08)",
                      color: mode === tab.key ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={currentTab.placeholder}
                  className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#FFFFFF",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-4 py-3 rounded-xl font-bold text-sm active:scale-95 disabled:opacity-40"
                  style={{ backgroundColor: "#FF7058", color: "#FFFFFF" }}
                >
                  {loading ? "..." : "→"}
                </button>
              </form>

              {error && (
                <p className="text-sm text-center py-2 mb-2" style={{ color: "#FF7058" }}>{error}</p>
              )}

              {/* Results */}
              <AnimatePresence mode="wait">
                {result && (
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.1)" }} />

                    {/* COMO SE DIZ result */}
                    {mode === "como-se-diz" && (() => {
                      const r = result as ComoSeDizResult;
                      return (
                        <>
                          <div>
                            <p className="text-2xl font-bold text-white">{r.english}</p>
                            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>/{r.pronunciation}/</p>
                          </div>
                          <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#7DC9E8" }}>Exemplo</p>
                            <p className="text-sm italic" style={{ color: "rgba(255,255,255,0.85)" }}>"{r.example}"</p>
                          </div>
                          {r.alternatives?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {r.alternatives.map((alt, i) => (
                                <span key={i} className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                                  {alt}
                                </span>
                              ))}
                            </div>
                          )}
                          {r.tip && <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>💡 {r.tip}</p>}
                        </>
                      );
                    })()}

                    {/* TRADUZA result */}
                    {mode === "traduza" && (() => {
                      const r = result as TraduzResult;
                      return (
                        <>
                          <div className="rounded-xl px-4 py-4" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                            <p className="text-xl font-bold text-white">{r.translation}</p>
                          </div>
                          {r.alternatives?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>Outras traduções</p>
                              <div className="flex flex-wrap gap-2">
                                {r.alternatives.map((alt, i) => (
                                  <span key={i} className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                                    {alt}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {r.tip && <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>💡 {r.tip}</p>}
                        </>
                      );
                    })()}

                    {/* CORRIJA result */}
                    {mode === "corrija" && (() => {
                      const r = result as CorrijaResult;
                      return (
                        <>
                          <div className="rounded-xl px-4 py-4 space-y-2" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8FB9A8" }}>Versão corrigida</p>
                            <p className="text-lg font-bold text-white">{r.corrected}</p>
                          </div>
                          {r.errors?.length > 0 && (
                            <div className="space-y-2">
                              {r.errors.map((err, i) => (
                                <div key={i} className="rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,112,88,0.3)" }}>
                                  <p className="text-xs line-through mb-1" style={{ color: "rgba(255,112,88,0.8)" }}>{err.original}</p>
                                  <p className="text-sm font-semibold text-white">→ {err.fix}</p>
                                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{err.explanation}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {r.errors?.length === 0 && (
                            <p className="text-sm text-center py-2" style={{ color: "#8FB9A8" }}>✅ Sua frase está correta!</p>
                          )}
                          {r.overall && <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>💡 {r.overall}</p>}
                        </>
                      );
                    })()}

                    <button
                      onClick={() => { setInput(""); setResult(null); inputRef.current?.focus(); }}
                      className="text-xs underline"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      Limpar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
