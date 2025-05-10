import { NextRequest, NextResponse } from "next/server"
import { chatWithSolanaBot } from "@/lib/chatbot"
import type { Message } from "@/lib/chatbot"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { prompt, messages } = body

  if (typeof prompt !== "string" || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "Invalid request body. Expecting { prompt: string, messages: Message[] }" },
      { status: 400 }
    )
  }

  try {
    const { reply, updatedMessages } = await chatWithSolanaBot(prompt, messages as Message[])
    return NextResponse.json({ reply, updatedMessages })
  } catch (error: any) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    )
  }
}
