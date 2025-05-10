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
  content:
    "You are a knowledgeable AI assistant focused on Solana-specific DeFi strategies based on real market data when available such as staking, liquidity pools, and farming.",
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

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [systemMessage, ...conversation],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const botReply = response.data.choices[0].message.content;
    conversation.push({ role: "assistant", content: botReply });

    return { reply: botReply, updatedMessages: conversation };
  } catch (error: any) {
    return {
      reply: `Error: ${error.response?.data || error.message}`,
      updatedMessages: conversation,
    };
  }
}
