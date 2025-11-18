import { NextRequest } from "next/server"
import { chatWithSolanaBot } from "@/lib/chatbot"
import type { Message } from "@/lib/chatbot"

export const runtime = 'edge'

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
    
    // Split reply by lines for line-by-line streaming
    const lines = reply.split('\n')
    
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        for (const line of lines) {
          // Send each line followed by newline
          controller.enqueue(encoder.encode(line + '\n'))
          // Small delay between lines for smooth display
          await new Promise(resolve => setTimeout(resolve, 50))
        }
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error("Error in chat API:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
