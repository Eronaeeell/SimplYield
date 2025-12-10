import { NextRequest, NextResponse } from "next/server"
import { chatWithSolanaBot } from "@/lib/chatbot"
import type { Message } from "@/lib/chatbot"

// Use Node runtime to avoid ArrayBuffer detachment issues
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { prompt, messages } = body

  if (typeof prompt !== "string" || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Invalid request body. Expecting { prompt: string, messages: Message[] }" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { reply } = await chatWithSolanaBot(prompt, messages as Message[])
    
    // Return simple JSON response instead of streaming to avoid ArrayBuffer issues
    return NextResponse.json({ reply }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    )
  }
}
