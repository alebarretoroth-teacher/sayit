import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as File;
    const expected = formData.get("expected") as string;

    if (!audio || !expected) {
      return NextResponse.json({ error: "audio and expected required" }, { status: 400 });
    }

    // Transcribe with Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: "whisper-large-v3",
      language: "en",
    });

    const spoken = transcription.text?.trim() ?? "";

    // Compare with expected using LLM
    const comparison = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `Você é um professor de inglês avaliando a pronúncia de um aluno brasileiro.
Compare o que o aluno falou com o que era esperado e dê feedback construtivo.
Responda SOMENTE com JSON válido:
{
  "score": 0-100,
  "spoken": "o que o aluno disse",
  "expected": "o que era esperado",
  "match": true/false,
  "feedback": "feedback em português (máx 2 frases, positivo e construtivo)",
  "mistakes": ["erro específico se houver"]
}`,
        },
        {
          role: "user",
          content: `Esperado: "${expected}"\nFalado: "${spoken}"`,
        },
      ],
      temperature: 0.2,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(comparison.choices[0].message.content ?? "{}");
    return NextResponse.json({ ...result, spoken });
  } catch (err) {
    console.error("pronunciation error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
