import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  const { phrase } = await req.json();
  if (!phrase) return NextResponse.json({ error: "phrase required" }, { status: 400 });

  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      {
        role: "system",
        content: `Você é um professor de inglês especialista em ajudar brasileiros.
O aluno vai te dar uma frase ou palavra em português. Responda SOMENTE JSON válido com:
{
  "english": "tradução natural em inglês",
  "pronunciation": "pronúncia simplificada em português (ex: ai uork)",
  "alternatives": ["outra forma de dizer", "mais uma alternativa"],
  "example": "frase de exemplo em inglês usando a tradução",
  "tip": "dica curta sobre uso ou contexto (max 1 frase)"
}`
      },
      {
        role: "user",
        content: `Como se diz em inglês: "${phrase}"`
      }
    ],
    temperature: 0.3,
    max_tokens: 300,
    response_format: { type: "json_object" },
  });

  const data = JSON.parse(response.choices[0].message.content ?? "{}");
  return NextResponse.json(data);
}
