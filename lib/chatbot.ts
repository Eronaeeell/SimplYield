// lib/solanaChatbot.ts
import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

const systemMessage: Message = {
  role: "system",
  content: `You are a knowledgeable AI assistant focused on Solana DeFi. Current year is 2025. Provide up-to-date, accurate information about the Solana ecosystem.

RESPONSE STYLE:
- Be direct and concise - get to the point quickly
- Provide actionable information, not unnecessary explanations
- Only elaborate when the user asks for more details
- Focus on practical, real-world applications

FORMATTING RULES:
1. Structure:
   - Use ## for main concepts (max 2-3 per response)
   - Use ### for subtopics
   - Use **bold** for key terms
   - Use \`code\` for technical terms, addresses, commands
   - Use > blockquotes for critical warnings/tips
   - Add emojis sparingly (💰 📊 ⚡ ⚠️)

2. Organization:
   - Use bullet points (-) for related items
   - Use numbered lists (1., 2., 3.) for steps
   - Keep paragraphs 2-3 lines maximum
   - Add line breaks between sections
   - Reference current Solana protocols (Marinade, Jito, Jupiter, Raydium, etc.)

3. Content:
   - Provide latest APY rates, fees, and stats when discussing DeFi
   - Mention current market conditions when relevant
   - Cite specific protocols and their current offerings
   - Include risks and best practices
   - End with clear next steps

Be precise, current, and efficient in your responses.`,
};

// Detect intent based on input
function detectIntent(userInput: string): { intent: string; tokenId?: string } | null {
  const lower = userInput.toLowerCase();

  if (lower.includes("solana") && lower.includes("price")) return { intent: "fetch_price", tokenId: "solana" };
  if (lower.includes("msol") && lower.includes("price")) return { intent: "fetch_price", tokenId: "msol" };
  if (lower.includes("jitosol") && lower.includes("price")) return { intent: "fetch_price", tokenId: "jito-staked-sol" };

  if (lower.includes("market data") && lower.includes("solana")) return { intent: "fetch_market", tokenId: "solana" };
  if (lower.includes("market data") && lower.includes("msol")) return { intent: "fetch_market", tokenId: "msol" };
  if (lower.includes("market data") && lower.includes("jitosol")) return { intent: "fetch_market", tokenId: "jito-staked-sol" };

  return null;
}

// Fetch Price
async function fetchTokenPrice(id: string): Promise<number | null> {
  try {
    const res = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
      params: { ids: id, vs_currencies: "usd" },
    });
    return res.data[id]?.usd || null;
  } catch {
    return null;
  }
}

// Fetch Market Data
async function fetchMarketData(id: string): Promise<any> {
  try {
    const res = await axios.get(`${COINGECKO_API_URL}/coins/${id}`);
    return res.data;
  } catch {
    return null;
  }
}

// Chatbot Handler
export async function chatWithSolanaBot(
  userInput: string,
  prevMessages: Message[]
): Promise<{ reply: string; updatedMessages: Message[] }> {
  const conversation: Message[] = [...prevMessages];
  const intentInfo = detectIntent(userInput);

  if (intentInfo) {
    const tokenId = intentInfo.tokenId!;

    if (intentInfo.intent === "fetch_price") {
      const price = await fetchTokenPrice(tokenId);
      const reply = price !== null ? `The current price of ${tokenId.toUpperCase()} is $${price}.` : "Unable to fetch price.";
      conversation.push({ role: "assistant", content: reply });
      return { reply, updatedMessages: conversation };
    }

    if (intentInfo.intent === "fetch_market") {
      const marketData = await fetchMarketData(tokenId);
      const reply = marketData ? `${tokenId.toUpperCase()} has a market cap of $${marketData.market_data.market_cap.usd.toLocaleString()} and a circulating supply of ${marketData.market_data.circulating_supply.toLocaleString()}.` : "Unable to fetch market data.";
      conversation.push({ role: "assistant", content: reply });
      return { reply, updatedMessages: conversation };
    }
  }

  // General conversation if no price or market intent
  conversation.push({ role: "user", content: userInput });

  // Check if API key is available
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is not set");
    return {
      reply: "I'm sorry, but the AI service is not properly configured. Please check the API key configuration.",
      updatedMessages: conversation,
    };
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
        messages: [systemMessage, ...conversation],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://simplYield.vercel.app",
          "X-Title": "SimplYield Assistant",
        },
        timeout: 15000,
      }
    );

    const botReply = response.data.choices[0].message.content;
    conversation.push({ role: "assistant", content: botReply });

    return { reply: botReply, updatedMessages: conversation };
  } catch (error: any) {
    console.error("OpenRouter API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers ? { ...error.config.headers, Authorization: '[REDACTED]' } : undefined
      }
    });
    
    let errorMessage = "AI service temporarily unavailable";
    
    if (error.response?.status === 401) {
      errorMessage = "API authentication failed";
    } else if (error.response?.status === 429) {
      errorMessage = "Rate limit exceeded. Please try again later";
    } else if (error.response?.status === 400) {
      errorMessage = "Invalid request format";
    }
    
    return {
      reply: `I'm having trouble processing your request right now. ${errorMessage}`,
      updatedMessages: conversation,
    };
  }
}
