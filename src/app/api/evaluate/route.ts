import { NextRequest, NextResponse } from "next/server";
import { evaluateAnswer } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const feedback = await evaluateAnswer(body);
    return NextResponse.json(feedback);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}
