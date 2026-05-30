import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY! });

const PROMPTS: Record<string, string> = {
  "como-se-diz": `Você é um professor de inglês para brasileiros. O aluno vai digitar uma palavra ou expressão em português.
Responda SOMENTE com JSON válido:
{
  "english": "tradução natural em inglês",
  "pronunciation": "pronúncia em português simplificado (ex: ai uork)",
  "alternatives": ["outra forma", "mais uma"],
  "example": "frase de exemplo curta em inglês",
  "tip": "dica de uso em 1 frase"
}`,

  "traduza": `Você é um tradutor bilíngue inglês-português. O aluno vai digitar texto em inglês ou português.
Detecte o idioma automaticamente e traduza para o outro.
Responda SOMENTE com JSON válido:
{
  "translation": "tradução principal",
  "alternatives": ["alternativa 1", "alternativa 2"],
  "tip": "observação cultural ou de registro (opcional, 1 frase)"
}`,

  "corrija": `Você é um professor de inglês que corrige textos de estudantes brasileiros.
O aluno vai digitar uma frase em inglês. Corrija erros gramaticais, de vocabulário e de naturalidade.
Responda SOMENTE com JSON válido:
{
  "corrected": "frase corrigida completa",
  "errors": [
    {
      "original": "trecho errado",
      "fix": "versão correta",
      "explanation": "explicação curta em português"
    }
  ],
  "overall": "comentário geral motivador em 1 frase"
}
Se não houver erros, retorne "errors": [] e diga que está correto no "overall".`,
};

export async function POST(req: NextRequest) {
  try {
    const { mode, text } = await req.json();
    if (!mode || !text) return NextResponse.json({ error: "mode and text required" }, { status: 400 });

    const systemPrompt = PROMPTS[mode];
    if (!systemPrompt) return NextResponse.json({ error: "invalid mode" }, { status: 400 });

  const groq = getGroq();
  const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(response.choices[0].message.content ?? "{}");
    return NextResponse.json(data);
  } catch (err) {
    console.error("language-tool error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
