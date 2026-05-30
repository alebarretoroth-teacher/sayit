"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Volume2, Loader2 } from "lucide-react";
import type { Exercise, AIFeedback } from "@/types";

interface SpeakingDrillProps {
  exercise: Exercise;
  onComplete: (isCorrect: boolean, studentAnswer: string, feedback?: AIFeedback) => void;
}

type RecordingState = "idle" | "recording" | "processing" | "done";

export default function SpeakingDrill({ exercise, onComplete }: SpeakingDrillProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [transcript, setTranscript] = useState("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  function playExample() {
    if (!exercise.audio_url) return;
    new Audio(exercise.audio_url).play();
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunks.current = [];

    recorder.ondataavailable = (e) => chunks.current.push(e.data);
    recorder.onstop = handleRecordingStop;

    mediaRecorder.current = recorder;
    recorder.start();
    setState("recording");
  }

  function stopRecording() {
    mediaRecorder.current?.stop();
    setState("processing");
  }

  async function handleRecordingStop() {
    const blob = new Blob(chunks.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");
    formData.append("exercise_id", exercise.id);
    formData.append("correct_answer", exercise.correct_answer);
    formData.append("pattern", exercise.pattern?.structure ?? "");

    try {
      const res = await fetch("/api/speaking", { method: "POST", body: formData });
      const data: { transcript: string; feedback: AIFeedback } = await res.json();
      setTranscript(data.transcript);
      setFeedback(data.feedback);
      setState("done");
      setTimeout(() => onComplete(data.feedback.is_correct, data.transcript, data.feedback), 2500);
    } catch {
      setState("idle");
    }
  }

  return (
    <div className="space-y-6">
      {/* Target sentence */}
      <div className="card bg-primary/5 border border-primary/20">
        <p className="text-xs text-primary uppercase tracking-widest mb-2 font-semibold">
          Diga em inglês
        </p>
        <p className="text-xl font-semibold text-foreground">{exercise.correct_answer}</p>

        {exercise.audio_url && (
          <button
            onClick={playExample}
            className="mt-3 flex items-center gap-1.5 text-primary text-sm font-medium"
          >
            <Volume2 size={16} />
            Ouvir exemplo
          </button>
        )}
      </div>

      {/* Pattern hint */}
      {exercise.pattern && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Padrão:</span>
          <span className="pattern-chip">{exercise.pattern.structure}</span>
        </div>
      )}

      {/* Recording button */}
      <div className="flex flex-col items-center gap-4 py-4">
        {state === "idle" && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg"
          >
            <Mic size={32} className="text-white" />
          </motion.button>
        )}

        {state === "recording" && (
          <motion.button
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            onClick={stopRecording}
            className="w-20 h-20 rounded-full bg-error flex items-center justify-center shadow-lg"
          >
            <Square size={28} className="text-white" />
          </motion.button>
        )}

        {state === "processing" && (
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          {state === "idle" && "Toque para gravar"}
          {state === "recording" && "Gravando... toque para parar"}
          {state === "processing" && "Analisando sua fala..."}
          {state === "done" && transcript}
        </p>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card space-y-2 border ${
              feedback.is_correct ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">
                {feedback.is_correct ? "Ótima pronúncia! 🎙️" : "Continue praticando!"}
              </p>
              <span className="xp-badge">{feedback.score}/100</span>
            </div>
            <p className="text-sm">{feedback.feedback_pt}</p>
            <p className="text-xs text-muted-foreground italic">{feedback.encouragement}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
