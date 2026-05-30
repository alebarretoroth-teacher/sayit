import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio, evaluateAnswer } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as Blob;
    const correctAnswer = formData.get("correct_answer") as string;
    const pattern = formData.get("pattern") as string;
    const exerciseId = formData.get("exercise_id") as string;

    // 1. Transcribe
    const transcript = await transcribeAudio(audio);

    // 2. Evaluate
    const feedback = await evaluateAnswer({
      exercise_type: "speaking_drill",
      prompt: "Say this sentence aloud",
      correct_answer: correctAnswer,
      student_answer: transcript,
      pattern,
    });

    return NextResponse.json({ transcript, feedback });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process audio" },
      { status: 500 }
    );
  }
}
