/**
 * SAYIT — AI Layer (Groq)
 * Transcrição via Whisper (Groq) + correção via Llama 3 (Groq).
 * Groq é gratuito no tier de dev e muito mais rápido que OpenAI.
 */

import Groq from "groq-sdk";
import type { AIFeedback } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Transcreve áudio do aluno usando Whisper (via Groq).
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const file = new File([audioBlob], "audio.webm", { type: "audio/webm" });

  const transcription = await groq.audio.transcriptions.create({
    file,
    model: "whisper-large-v3",
    language: "en",
  });

  return transcription.text;
}

/**
 * Avalia a resposta do aluno (escrita ou transcrita) usando Llama 3 via Groq.
 * Retorna feedback estruturado em português.
 */
export async function evaluateAnswer(params: {
  exercise_type: string;
  prompt: string;
  correct_answer: string;
  student_answer: string;
  pattern?: string;
}): Promise<AIFeedback> {
  const { exercise_type, prompt, correct_answer, student_answer, pattern } = params;

  const systemPrompt = `Você é um professor de inglês especializado em ajudar brasileiros adultos a desenvolver fluência.
Avalie a resposta do aluno de forma construtiva, em português simples e direto.
Seja honesto mas encorajador. Nunca seja condescendente.
Foque no padrão linguístico em questão: ${pattern ?? "estrutura geral"}.
Retorne SOMENTE JSON válido, sem markdown, sem explicações extras.`;

  const userPrompt = `Exercício: ${exercise_type}
Prompt dado ao aluno: ${prompt}
Resposta correta: ${correct_answer}
Resposta do aluno: ${student_answer}

Retorne JSON com exatamente estes campos:
{
  "is_correct": boolean,
  "score": number (0-100),
  "feedback_pt": "string (max 2 frases, direto ao ponto)",
  "corrected_answer": "string ou null",
  "highlighted_error": "string ou null",
  "encouragement": "string (1 frase curta em português)"
}`;

  const response = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 400,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content ?? "{}";
  return JSON.parse(content) as AIFeedback;
}
