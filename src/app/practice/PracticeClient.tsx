"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2, ChevronRight, RotateCcw, Square } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

const DRILLS = [
  { id: 1, pattern: "Subject + need + to + verb", sentence: "I need more time to think.", translation: "Eu preciso de mais tempo para pensar.", tip: "Use 'need' para necessidade — mais natural que 'I am needing'." },
  { id: 2, pattern: "I'm used to + verb-ing", sentence: "I'm used to waking up early.", translation: "Eu estou acostumada a acordar cedo.", tip: "'Used to' + infinitivo = hábito passado. 'I'm used to' + -ing = estar acostumado." },
  { id: 3, pattern: "Have you ever + past participle?", sentence: "Have you ever been to another country?", translation: "Você já foi a outro país?", tip: "Use 'Have you ever' para falar de experiências de vida." },
  { id: 4, pattern: "I wish + simple past", sentence: "I wish I spoke English fluently.", translation: "Queria falar inglês fluentemente.", tip: "Depois de 'I wish', use o passado simples para desejo sobre o presente." },
  { id: 5, pattern: "It's worth + verb-ing", sentence: "It's worth trying something new.", translation: "Vale a pena tentar algo novo.", tip: "'It's worth' sempre vem com -ing, nunca com infinitivo." },
];

interface FeedbackResult {
  score: number;
  spoken: string;
  match: boolean;
  feedback: string;
  mistakes: string[];
}

type Step = "preview" | "speak" | "feedback";

function playTTS(text: string) {
  // Browser TTS fallback (while ElevenLabs key isn't configured)
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang === "en-US" && v.name.toLowerCase().includes("female"))
      || voices.find((v) => v.lang === "en-US")
      || voices[0];
    if (preferred) utter.voice = preferred;
    window.speechSynthesis.speak(utter);
  }
}

export default function PracticeClient() {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<Step>("preview");
  const [recording, setRecording] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [done, setDone] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const drill = DRILLS[index];
  const progress = (index / DRILLS.length) * 100;
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  function next() {
    if (index + 1 >= DRILLS.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setStep("preview");
      setFeedback(null);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = handleRecordingDone;
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      alert("Permita o acesso ao microfone para gravar.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    setRecording(false);
  }

  async function handleRecordingDone() {
    setLoadingFeedback(true);
    setStep("feedback");

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");
    formData.append("expected", drill.sentence);

    try {
      const res = await fetch("/api/pronunciation", { method: "POST", body: formData });
      const data = await res.json();
      setFeedback(data);
      if (data.score) setScores((s) => [...s, data.score]);
    } catch {
      setFeedback({ score: 0, spoken: "", match: false, feedback: "Não consegui analisar. Tente novamente.", mistakes: [] });
    } finally {
      setLoadingFeedback(false);
    }
  }

  function restart() {
    setIndex(0);
    setStep("preview");
    setFeedback(null);
    setScores([]);
    setDone(false);
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24" style={{ backgroundColor: "#FAF6F1" }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5 w-full max-w-sm">
          <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: "#072547" }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#FF7058" }}>Sessão completa</p>
            <p className="text-5xl font-bold text-white">{avgScore ?? "—"}</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>pontuação média de pronúncia</p>
          </div>
          <p className="text-sm" style={{ color: "#072547", opacity: 0.6 }}>
            Você praticou {DRILLS.length} padrões de frase. A repetição é o que cria fluência.
          </p>
          <button onClick={restart} className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full font-semibold text-sm" style={{ backgroundColor: "#FF7058", color: "#FFFFFF" }}>
            <RotateCcw size={16} /> Praticar novamente
          </button>
        </motion.div>
        <BottomNav active="speaking" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FAF6F1" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#072547" }} className="px-6 pt-12 pb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#FF7058" }}>Speaking Drills</p>
          <span className="text-xs font-bold text-white opacity-50">{index + 1}/{DRILLS.length}</span>
        </div>
        <div className="h-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
          <motion.div className="h-1 rounded-full" style={{ backgroundColor: "#FF7058" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div key={`${drill.id}-${step}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-4">

            {/* Pattern badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#072547", color: "#7DC9E8" }}>
              {drill.pattern}
            </span>

            {/* Sentence card */}
            <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
              <p className="text-2xl font-bold leading-snug" style={{ color: "#072547" }}>{drill.sentence}</p>
              <p className="text-sm" style={{ color: "#072547", opacity: 0.45 }}>{drill.translation}</p>
              {drill.tip && (
                <p className="text-xs pt-3 border-t" style={{ borderColor: "#E5E0D8", color: "#072547", opacity: 0.5 }}>
                  💡 {drill.tip}
                </p>
              )}
            </div>

            {/* PREVIEW step */}
            {step === "preview" && (
              <div className="space-y-3">
                <button
                  onClick={() => playTTS(drill.sentence)}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-sm active:scale-95 transition-all"
                  style={{ backgroundColor: "#072547", color: "#FFFFFF" }}
                >
                  <Volume2 size={18} /> Ouvir pronúncia
                </button>
                <button
                  onClick={() => setStep("speak")}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-sm active:scale-95 transition-all"
                  style={{ backgroundColor: "#FF7058", color: "#FFFFFF" }}
                >
                  <Mic size={18} /> Gravar minha voz
                </button>
              </div>
            )}

            {/* SPEAK step */}
            {step === "speak" && (
              <div className="space-y-3">
                <div className="rounded-2xl p-5 text-center space-y-2" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
                  <p className="text-sm font-semibold" style={{ color: "#072547" }}>Repita em voz alta:</p>
                  <p className="text-lg font-bold italic" style={{ color: "#FF7058" }}>"{drill.sentence}"</p>
                </div>

                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-sm active:scale-95 transition-all"
                    style={{ backgroundColor: "#FF7058", color: "#FFFFFF" }}
                  >
                    <Mic size={18} /> Iniciar gravação
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-sm"
                    style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}
                  >
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                      <Square size={16} fill="white" />
                    </motion.div>
                    Gravando... toque para parar
                  </button>
                )}

                <button onClick={next} className="w-full text-xs text-center py-2" style={{ color: "#072547", opacity: 0.35 }}>
                  Pular
                </button>
              </div>
            )}

            {/* FEEDBACK step */}
            {step === "feedback" && (
              <div className="space-y-3">
                {loadingFeedback ? (
                  <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
                    <p className="text-sm" style={{ color: "#072547", opacity: 0.5 }}>Analisando pronúncia...</p>
                  </div>
                ) : feedback && (
                  <>
                    {/* Score */}
                    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ backgroundColor: "#072547" }}>
                      <div className="text-center">
                        <p className="text-4xl font-bold text-white">{feedback.score}</p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>/ 100</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white mb-1">{feedback.match ? "Muito bom!" : "Continue praticando"}</p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{feedback.feedback}</p>
                      </div>
                    </div>

                    {/* What you said */}
                    {feedback.spoken && (
                      <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#072547", opacity: 0.4 }}>Você disse</p>
                        <p className="text-sm italic" style={{ color: "#072547" }}>"{feedback.spoken}"</p>
                      </div>
                    )}

                    {/* Mistakes */}
                    {feedback.mistakes?.length > 0 && (
                      <div className="space-y-2">
                        {feedback.mistakes.map((m, i) => (
                          <div key={i} className="rounded-xl px-4 py-3 text-xs" style={{ backgroundColor: "#FEF2F2", color: "#B91C1C" }}>
                            {m}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={next}
                  disabled={loadingFeedback}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-sm active:scale-95 transition-all disabled:opacity-40"
                  style={{ backgroundColor: "#072547", color: "#FFFFFF" }}
                >
                  Próxima frase <ChevronRight size={18} />
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav active="speaking" />
    </div>
  );
}
