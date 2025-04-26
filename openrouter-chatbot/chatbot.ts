import axios from "axios";
import readlineSync from "readline-sync";

// Your OpenRouter API Key
const API_KEY = "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// CoinGecko API (no key needed!)
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

interface Message {
    role: "system" | "user" | "assistant";
    content: string;
}

const systemMessage: Message = {
    role: "system",
    content: "You are a knowledgeable AI assistant focused on Solana-specific DeFi strategies based on real market data when available such as staking, liquidity pools, and farming.",
};

// 🧠 CoinGecko helper functions

async function fetchTokenPrice(id: string): Promise<number | null> {
    try {
        const res = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
            params: {
                ids: id,
                vs_currencies: "usd",
            },
        });
        return res.data[id]?.usd || null;
    } catch (error) {
        console.error("Error fetching price:", error);
        return null;
    }
}

async function fetchMarketData(id: string): Promise<any> {
    try {
        const res = await axios.get(`${COINGECKO_API_URL}/coins/${id}`);
        return res.data;
    } catch (error) {
        console.error("Error fetching market data:", error);
        return null;
    }
}

// 🧠 Helper to detect intent
function detectIntent(userInput: string): { intent: string, tokenId?: string } | null {
    const lowerInput = userInput.toLowerCase();

    // Price related intents
    if (lowerInput.includes("solana") && lowerInput.includes("price")) {
        return { intent: "fetch_price", tokenId: "solana" };
    }
    if (lowerInput.includes("msol") && lowerInput.includes("price")) {
        return { intent: "fetch_price", tokenId: "msol" };
    }
    if (lowerInput.includes("jitosol") && lowerInput.includes("price")) {
        return { intent: "fetch_price", tokenId: "jito-staked-sol" };
    }

    // Market data intents
    if (lowerInput.includes("market data") && lowerInput.includes("solana")) {
        return { intent: "fetch_market", tokenId: "solana" };
    }
    if (lowerInput.includes("market data") && lowerInput.includes("msol")) {
        return { intent: "fetch_market", tokenId: "msol" };
    }
    if (lowerInput.includes("market data") && lowerInput.includes("jitosol")) {
        return { intent: "fetch_market", tokenId: "jito-staked-sol" };
    }

    // Check for compound questions (price + reason)
    if (lowerInput.includes("why") && (lowerInput.includes("stake") || lowerInput.includes("invest"))) {
        if (lowerInput.includes("msol")) {
            return { intent: "fetch_price_and_reason", tokenId: "msol" };
        }
        if (lowerInput.includes("jitosol")) {
            return { intent: "fetch_price_and_reason", tokenId: "jito-staked-sol" };
        }
    }

    return null;
}

// 🧠 Main chatbot logic

async function chatWithBot() {
    const conversation: Message[] = [systemMessage];

    while (true) {
        const userInput = readlineSync.question("You: ");

        if (userInput.toLowerCase() === "exit" || userInput.toLowerCase() === "quit") {
            console.log("Goodbye!");
            break;
        }

        const lowerInput = userInput.toLowerCase();
        let tokenId: string | undefined;
        let needsPrice = false;
        let needsMarket = false;
        let needsReasoning = false;

        if (lowerInput.includes("msol")) tokenId = "msol";
        if (lowerInput.includes("jitosol")) tokenId = "jito-staked-sol";
        if (lowerInput.includes("solana") && !tokenId) tokenId = "solana";

        if (lowerInput.includes("price")) needsPrice = true;
        if (lowerInput.includes("market data")) needsMarket = true;
        if (
            lowerInput.includes("why") || 
            lowerInput.includes("should") || 
            lowerInput.includes("is it good") || 
            lowerInput.includes("worth") || 
            lowerInput.includes("recommend")
        ) needsReasoning = true;

        if (tokenId && (needsPrice || needsMarket)) {
            let prePrompt = "";
            let fetchedPrice = null;
            let fetchedMarketData = null;

            if (needsPrice) {
                fetchedPrice = await fetchTokenPrice(tokenId);
                if (fetchedPrice !== null) {
                    console.log(`Bot: The current price of ${tokenId.toUpperCase()} is $${fetchedPrice}\n`);
                    prePrompt += `The current price of ${tokenId.toUpperCase()} is $${fetchedPrice}. `;
                }
            }

            if (needsMarket) {
                fetchedMarketData = await fetchMarketData(tokenId);
                if (fetchedMarketData) {
                    const marketCap = fetchedMarketData.market_data.market_cap.usd;
                    const circulatingSupply = fetchedMarketData.market_data.circulating_supply;
                    console.log(`Bot: ${tokenId.toUpperCase()} Market Cap: $${(marketCap).toLocaleString()}, Circulating Supply: ${circulatingSupply.toLocaleString()}\n`);
                    prePrompt += `${tokenId.toUpperCase()} has a market cap of $${marketCap.toLocaleString()} and a circulating supply of ${circulatingSupply.toLocaleString()}. `;
                }
            }

            // Now if reasoning is needed, talk to AI
            if (needsReasoning) {
                const finalPrompt = prePrompt + `\n\nBased on the above info, ${userInput}`;

                conversation.push({ role: "user", content: finalPrompt });

                try {
                    const response = await axios.post(
                        OPENROUTER_URL,
                        {
                            model: "deepseek/deepseek-chat-v3-0324:free",
                            messages: conversation,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${API_KEY}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    const botResponse = response.data.choices[0].message.content;
                    console.log(`Bot: ${botResponse}\n`);

                    conversation.push({ role: "assistant", content: botResponse });
                } catch (error: any) {
                    console.error("Error:", error.response?.data || error.message);
                    break;
                }
            }

            continue;
        }

        // fallback if no price/market special handling
        conversation.push({ role: "user", content: userInput });

        try {
            const response = await axios.post(
                OPENROUTER_URL,
                {
                    model: "deepseek/deepseek-chat-v3-0324:free",
                    messages: conversation,
                },
                {
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const botResponse = response.data.choices[0].message.content;
            console.log(`Bot: ${botResponse}\n`);

            conversation.push({ role: "assistant", content: botResponse });
        } catch (error: any) {
            console.error("Error:", error.response?.data || error.message);
            break;
        }
    }
}


chatWithBot();
