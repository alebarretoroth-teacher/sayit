import Groq from "groq-sdk";
import type { AIFeedback } from "@/types";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY! });
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const file = new File([audioBlob], "audio.webm", { type: "audio/webm" });
  const groq = getGroq();
  const transcription = await groq.audio.transcriptions.create({
    file,
    model: "whisper-large-v3",
    language: "en",
  });
  return transcription.text;
}

export async function evaluateAnswer(params: {
  exercise_type: string;
  prompt: string;
  correct_answer: string;
  student_answer: string;
  pattern?: string;
}): Promise<AIFeedback> {
  const { exercise_type, prompt, correct_answer, student_answer, pattern } = params;

  const systemPrompt = "Voce e um professor de ingles. Avalie a resposta do aluno em portugues. Retorne SOMENTE JSON valido.";

  const userPrompt = `Exercicio: ${exercise_type}\nPrompt: ${prompt}\nResposta correta: ${correct_answer}\nResposta do aluno: ${student_answer}\nPadrao: ${pattern ?? "geral"}\n\nRetorne JSON: {"is_correct":boolean,"score":number,"feedback_pt":"string","corrected_answer":"string|null","highlighted_error":"string|null","encouragement":"string"}`;

  const groq = getGroq();
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
