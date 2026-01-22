// lib/solanaChatbot.ts
import axios from "axios";
import { fetchTokenPrice, fetchTokenMarketData, TOKEN_IDS } from "@/lib/coingecko-service";
import { PortfolioData, formatPortfolioForAI, analyzePortfolio } from "@/lib/portfolio-service";
import { getNLUService } from "@/lib/nlu/nlu-service";
import { INTENTS } from "@/lib/nlu/training-data";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

const systemMessage: Message = {
  role: "system",
  content: `You are SimplYield AI, an intelligent assistant for the SimplYield platform - a Solana liquid staking aggregator. Current year is 2025.

PLATFORM CAPABILITIES (SimplYield):
You are operating within the SimplYield platform which provides:
- **Native SOL Staking**: Stake SOL to validators (~7.2% APY)
- **Liquid Staking with Marinade (mSOL)**: Convert SOL to mSOL (6.45% APY fixed)
- **Liquid Staking with BlazeStake (bSOL)**: Convert SOL to bSOL (~6.42% APY)
- **Portfolio Tracking**: Real-time view of user's holdings
- **Wallet Integration**: Solana wallet connection
- **Asset Management**: Stake, unstake, and swap between supported tokens

SUPPORTED TOKENS ON THIS PLATFORM:
✅ SOL (Native Solana)
✅ mSOL (Marinade Finance liquid staking token)
✅ bSOL (BlazeStake liquid staking token)

❌ NOT SUPPORTED: jitoSOL, stSOL, laineSOL, or other liquid staking tokens

IMPORTANT RULES:
1. ONLY recommend actions using SOL, mSOL, or bSOL
2. You can EXPLAIN other protocols (Jito, Lido, etc.) if asked, but NEVER suggest users use them
3. If a user asks about unsupported tokens, explain they're not available on SimplYield
4. When suggesting portfolio optimizations, ONLY use the 3 supported tokens
5. You have access to user's REAL portfolio data - use it for personalized advice

RESPONSE STYLE:
- Be direct and concise - get to the point quickly
- Provide actionable information specific to SimplYield features
- Reference ACTUAL holdings and values from their portfolio
- Calculate potential gains/losses with real numbers
- Focus on practical actions users can take NOW on this platform

FORMATTING RULES:
1. Structure:
   - Use ## for main concepts (max 2-3 per response)
   - Use ### for subtopics
   - Use **bold** for key terms and token names
   - Use \`code\` for technical terms
   - Use > blockquotes for critical warnings
   - Add emojis sparingly (💰 📊 ⚡ ⚠️)

2. Organization:
   - Use bullet points (-) for related items
   - Use numbered lists for actionable steps
   - Keep paragraphs 2-3 lines maximum
   - End with clear next steps users can do on SimplYield

3. Content:
   - Provide current APY rates for SOL (7.2%), mSOL (6.45%), bSOL (6.42%)
   - Mention risks: smart contract risk, impermanent loss, validator risks
   - Explain benefits: liquidity, DeFi composability, auto-compounding
   - Include transaction fees and time estimates when relevant

PORTFOLIO ANALYSIS:
- Reference user's ACTUAL holdings from their connected wallet
- Identify optimization opportunities (e.g., unstaked SOL → stake it)
- Suggest rebalancing between mSOL and bSOL based on APY
- Calculate real potential monthly/yearly gains
- Warn about concentration risk or lack of diversification

When users ask "what can I do here?", explain SimplYield's features and how to maximize their yield with the available options.

Be precise, helpful, and platform-focused in your responses.`,
};

// Detect intent based on input
function detectIntent(userInput: string): { 
  intent: string; 
  tokenId?: string; 
  tokenName?: string;
  isPortfolioQuery?: boolean;
} | null {
  const lower = userInput.toLowerCase();

  // Portfolio queries
  if (
    lower.includes('portfolio') || 
    lower.includes('my holdings') || 
    lower.includes('my assets') ||
    lower.includes('my balance') ||
    lower.includes('what do i have') ||
    lower.includes('distribution') ||
    lower.includes('allocation') ||
    lower.includes('how is my') ||
    lower.includes('analyze my') ||
    lower.includes('suggest') && (lower.includes('portfolio') || lower.includes('holdings')) ||
    lower.includes('should i') && (lower.includes('move') || lower.includes('switch') || lower.includes('stake'))
  ) {
    return { intent: "portfolio_analysis", isPortfolioQuery: true };
  }

  // Price queries
  if (lower.includes("sol") && lower.includes("price") && !lower.includes("msol") && !lower.includes("bsol")) {
    return { intent: "fetch_price", tokenId: TOKEN_IDS.SOL, tokenName: "SOL" };
  }
  if (lower.includes("msol") && lower.includes("price")) {
    return { intent: "fetch_price", tokenId: TOKEN_IDS.MSOL, tokenName: "mSOL" };
  }
  if (lower.includes("bsol") && lower.includes("price")) {
    return { intent: "fetch_price", tokenId: TOKEN_IDS.BSOL, tokenName: "bSOL" };
  }
  if (lower.includes("jitosol") && lower.includes("price")) {
    return { intent: "fetch_price", tokenId: TOKEN_IDS.JITOSOL, tokenName: "jitoSOL" };
  }

  // Market data queries
  if (lower.includes("market data") && lower.includes("sol") && !lower.includes("msol") && !lower.includes("bsol")) {
    return { intent: "fetch_market", tokenId: TOKEN_IDS.SOL, tokenName: "SOL" };
  }
  if (lower.includes("market data") && lower.includes("msol")) {
    return { intent: "fetch_market", tokenId: TOKEN_IDS.MSOL, tokenName: "mSOL" };
  }
  if (lower.includes("market data") && lower.includes("bsol")) {
    return { intent: "fetch_market", tokenId: TOKEN_IDS.BSOL, tokenName: "bSOL" };
  }
  if (lower.includes("market data") && lower.includes("jitosol")) {
    return { intent: "fetch_market", tokenId: TOKEN_IDS.JITOSOL, tokenName: "jitoSOL" };
  }

  return null;
}

// Note: fetchTokenPrice and fetchTokenMarketData are now imported from coingecko-service.ts

// Chatbot Handler
export async function chatWithSolanaBot(
  userInput: string,
  prevMessages: Message[],
  portfolioData?: PortfolioData | null
): Promise<{ reply: string; updatedMessages: Message[] }> {
  const conversation: Message[] = [...prevMessages];
  
  // First, try NLU service for intent detection
  const nluService = getNLUService();
  let nluResult = null;
  try {
    nluResult = await nluService.processInput(userInput);
    console.log('🧠 NLU Result:', {
      text: userInput,
      intent: nluResult.intent,
      confidence: nluResult.confidence,
      entities: nluResult.entities,
      valid: nluResult.valid,
      errorMessage: nluResult.errorMessage
    });
  } catch (error) {
    console.error('NLU processing error:', error);
  }
  
  // Handle NLU-detected staking/unstaking intents with high confidence
  if (nluResult && nluResult.confidence >= 0.4) {
    const { intent, entities, valid, errorMessage } = nluResult;
    
    // Handle stake intents
    if (intent === INTENTS.STAKE_NATIVE && valid && entities.amount) {
      const reply = `🚀 **Native SOL Staking**\n\nI'll help you stake **${entities.amount} SOL** to a native validator.\n\n**Next Steps:**\n1. Click the "Stake SOL" button in the interface\n2. Enter the amount: ${entities.amount} SOL\n3. Confirm the transaction in your wallet\n\n**Details:**\n- APY: ~7.2%\n- Lock period: Warm-up period (~2-3 days)\n- Rewards: Auto-compounding\n\n> ⚠️ Unstaking takes 2-3 days (cooldown period)`;
      conversation.push({ role: "user", content: userInput });
      conversation.push({ role: "assistant", content: reply });
      return { reply, updatedMessages: conversation };
    }
    
    if (intent === INTENTS.STAKE_MSOL && valid && entities.amount) {
      const reply = `🚀 **Liquid Staking with Marinade (mSOL)**\n\nI'll help you stake **${entities.amount} SOL** to get **mSOL** tokens.\n\n**Next Steps:**\n1. Click the "Stake to mSOL" button\n2. Enter the amount: ${entities.amount} SOL\n3. Confirm the transaction\n\n**Benefits:**\n- APY: 6.45% (fixed)\n- Instant liquidity: Use mSOL in DeFi\n- No lock period\n- Auto-compounding rewards\n\n> 💡 mSOL can be used across Solana DeFi while earning staking rewards!`;
      conversation.push({ role: "user", content: userInput });
      conversation.push({ role: "assistant", content: reply });
      return { reply, updatedMessages: conversation };
    }
    
    if (intent === INTENTS.STAKE_BSOL && valid && entities.amount) {
      const reply = `🚀 **Liquid Staking with BlazeStake (bSOL)**\n\nI'll help you stake **${entities.amount} SOL** to get **bSOL** tokens.\n\n**Next Steps:**\n1. Click the "Stake to bSOL" button\n2. Enter the amount: ${entities.amount} SOL\n3. Confirm the transaction\n\n**Benefits:**\n- APY: ~6.42%\n- Instant liquidity: Use bSOL in DeFi\n- No lock period\n- Auto-compounding rewards\n\n> 💡 bSOL can be traded or used in DeFi protocols while earning staking rewards!`;
      conversation.push({ role: "user", content: userInput });
      conversation.push({ role: "assistant", content: reply });
      return { reply, updatedMessages: conversation };
    }
    
    // Handle unstake intents
    if (intent === INTENTS.UNSTAKE_NATIVE) {
      const reply = `🔓 **Unstake Native SOL**\n\nTo unstake your native SOL:\n\n**Steps:**\n1. Type "unstake" to see your active stake accounts\n2. I'll show you a list like:\n   - 1. 5.0 SOL → 7gy7..019e\n   - 2. 10.0 SOL → Gf8s..2eh7\n3. Reply with "unstake [number]" to select which account\n\n> ⚠️ Cooldown period: 2-3 days before SOL is available\n\nReady? Type "unstake" to see your stake accounts.`;
      conversation.push({ role: "user", content: userInput });
      conversation.push({ role: "assistant", content: reply });
      return { reply, updatedMessages: conversation };
    }
    
    if (intent === INTENTS.UNSTAKE_MSOL) {
      const reply = `🔓 **Unstake mSOL**\n\nTo unstake your mSOL tokens:\n\n**Steps:**\n1. Type "unstake mSOL"\n2. I'll show your available mSOL balance\n3. Reply with "unstake [amount] mSOL"\n\n**Options:**\n- Instant unstake (small fee)\n- Delayed unstake (no fee, wait 1 epoch)\n\n> 💡 You can also just swap mSOL back to SOL on DEXes!`;
      conversation.push({ role: "user", content: userInput });
      conversation.push({ role: "assistant", content: reply });
      return { reply, updatedMessages: conversation };
    }
    
    if (intent === INTENTS.UNSTAKE_BSOL) {
      const reply = `🔓 **Unstake bSOL**\n\nTo unstake your bSOL tokens:\n\n**Steps:**\n1. Type "unstake bSOL"\n2. I'll show your available bSOL balance\n3. Reply with "unstake [amount] bSOL"\n\n**Process:**\n- Exchange bSOL back to SOL\n- Usually instant\n- Small fee may apply\n\n> 💡 Alternatively, swap bSOL on DEXes for instant conversion!`;
      conversation.push({ role: "user", content: userInput });
      conversation.push({ role: "assistant", content: reply });
      return { reply, updatedMessages: conversation };
    }
    
    // Handle invalid entity extraction (missing amount, etc.)
    if (!valid && errorMessage) {
      conversation.push({ role: "user", content: userInput });
      conversation.push({ role: "assistant", content: errorMessage });
      return { reply: errorMessage, updatedMessages: conversation };
    }
  }
  
  // Fallback to old detectIntent for price/market queries
  const intentInfo = detectIntent(userInput);

  // Handle portfolio analysis queries - let AI analyze instead of using templates
  if (intentInfo?.isPortfolioQuery) {
    if (!portfolioData || portfolioData.assets.length === 0) {
      const reply = "⚠️ I don't have access to your portfolio data yet. Please connect your wallet to view and analyze your holdings.";
      conversation.push({ role: "user", content: userInput });
      conversation.push({ role: "assistant", content: reply });
      return { reply, updatedMessages: conversation };
    }
    // Continue to let AI model analyze the portfolio naturally
  }

  if (intentInfo) {
    const { tokenId, tokenName, intent } = intentInfo;

    if (intent === "fetch_price") {
      const price = await fetchTokenPrice(tokenId!);
      const reply = price !== null 
        ? `💰 The current price of **${tokenName}** is **$${price.toFixed(price >= 1 ? 2 : 4)}** USD.` 
        : `❌ Unable to fetch the price for ${tokenName}. Please try again later.`;
      conversation.push({ role: "assistant", content: reply });
      return { reply, updatedMessages: conversation };
    }

    if (intent === "fetch_market") {
      const marketData = await fetchTokenMarketData(tokenId!);
      if (marketData) {
        const reply = `## 📊 ${tokenName} Market Data\n\n` +
          `- **Current Price:** $${marketData.current_price.toFixed(2)}\n` +
          `- **Market Cap:** $${marketData.market_cap.toLocaleString()}\n` +
          `- **24h Volume:** $${marketData.total_volume.toLocaleString()}\n` +
          `- **24h Change:** ${marketData.price_change_percentage_24h >= 0 ? '+' : ''}${marketData.price_change_percentage_24h.toFixed(2)}%\n` +
          `- **Circulating Supply:** ${marketData.circulating_supply.toLocaleString()} ${marketData.symbol}`;
        conversation.push({ role: "assistant", content: reply });
        return { reply, updatedMessages: conversation };
      } else {
        const reply = `❌ Unable to fetch market data for ${tokenName}. Please try again later.`;
        conversation.push({ role: "assistant", content: reply });
        return { reply, updatedMessages: conversation };
      }
    }
  }

  // General conversation if no price or market intent
  conversation.push({ role: "user", content: userInput });

  // Add portfolio context to the conversation if available
  if (portfolioData && portfolioData.assets.length > 0) {
    const portfolioContext = formatPortfolioForAI(portfolioData);
    // Insert portfolio context before the user's message for AI awareness
    conversation.splice(conversation.length - 1, 0, {
      role: "system",
      content: portfolioContext
    });
  }

  // Check if API key is available
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is not set");
    return {
      reply: "I'm sorry, but the AI service is not properly configured. Please check the API key configuration.",
      updatedMessages: conversation,
    };
  }

  // Retry logic with exponential backoff
  const maxRetries = 2; // Reduced retries to avoid long waits
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Wait before retry (exponential backoff: 2s, 5s)
      if (attempt > 0) {
        const waitTime = attempt === 1 ? 2000 : 5000;
        console.log(`⏳ Rate limited, waiting ${waitTime/1000}s before retry ${attempt}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const response = await axios.post(
        OPENROUTER_URL,
        {
          model: "tngtech/deepseek-r1t2-chimera:free",
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
          timeout: 30000,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      // Validate response structure
      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        console.error("Invalid API response structure:", response.data);
        throw new Error("Invalid response from AI service");
      }

      const botReply = response.data.choices[0].message?.content || "";
      
      if (!botReply) {
        console.error("Empty reply from API:", response.data);
        throw new Error("Empty response from AI service");
      }

      conversation.push({ role: "assistant", content: botReply });

      return { reply: botReply, updatedMessages: conversation };
    } catch (error: any) {
      lastError = error;
      
      // If not a rate limit or timeout error, don't retry
      const isRetryable = error.response?.status === 429 || 
                          error.response?.status === 503 ||
                          error.code === 'ECONNABORTED';
      
      if (!isRetryable || attempt === maxRetries - 1) {
        console.log(`❌ Non-retryable error or max retries reached`);
        break;
      }
      
      console.log(`⚠️ Retryable error (${error.response?.status || error.code}), will retry...`);
    }
  }

  // Handle error after all retries
  const error = lastError;
  if (error) {
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
    
    let errorMessage = "";
    
    if (error.response?.status === 401) {
      errorMessage = "Error 401: Authentication failed. Please check API key configuration.";
    } else if (error.response?.status === 429) {
      errorMessage = "Error 429: Rate limit exceeded. Please wait a moment and try again.";
    } else if (error.response?.status === 400) {
      errorMessage = "Error 400: Invalid request format.";
    } else if (error.response?.status === 503) {
      errorMessage = "Error 503: Service temporarily unavailable.";
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = "Error: Request timeout (30s exceeded). The AI service is slow, please try again.";
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = "Error: Network connection failed.";
    } else if (error.response?.status) {
      errorMessage = `Error ${error.response.status}: ${error.response.statusText || 'Request failed'}`;
    } else {
      errorMessage = `Error: ${error.message || 'Unknown error occurred'}`;
    }
    
    return {
      reply: errorMessage,
      updatedMessages: conversation,
    };
  }
  
  return {
    reply: "Error: Unexpected issue occurred. Please try again.",
    updatedMessages: conversation,
  };
}
