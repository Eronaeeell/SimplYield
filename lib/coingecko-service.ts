// lib/coingecko-service.ts
import axios from "axios";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

// CoinGecko token IDs mapping
export const TOKEN_IDS = {
  SOL: "solana",
  MSOL: "msol",
  BSOL: "blazestake-staked-sol",
  JITOSOL: "jito-staked-sol",
} as const;

export interface TokenPrice {
  usd: number;
  usd_24h_change?: number;
}

export interface TokenMarketData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  ath: number;
  atl: number;
}

export interface StakingAPY {
  sol: number;
  msol: number;
  bsol: number;
}

/**
 * Fetch current price for a single token
 */
export async function fetchTokenPrice(tokenId: string): Promise<number | null> {
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: tokenId,
        vs_currencies: "usd",
        include_24hr_change: "true",
      },
    });
    return response.data[tokenId]?.usd || null;
  } catch (error) {
    console.error(`Error fetching price for ${tokenId}:`, error);
    return null;
  }
}

/**
 * Fetch prices for multiple tokens at once
 */
export async function fetchMultipleTokenPrices(
  tokenIds: string[]
): Promise<Record<string, TokenPrice>> {
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: tokenIds.join(","),
        vs_currencies: "usd",
        include_24hr_change: "true",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching multiple token prices:", error);
    return {};
  }
}

/**
 * Fetch detailed market data for a token
 */
export async function fetchTokenMarketData(
  tokenId: string
): Promise<TokenMarketData | null> {
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/coins/${tokenId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
      },
    });

    const data = response.data;
    return {
      id: data.id,
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      current_price: data.market_data.current_price.usd,
      market_cap: data.market_data.market_cap.usd,
      total_volume: data.market_data.total_volume.usd,
      price_change_percentage_24h: data.market_data.price_change_percentage_24h,
      circulating_supply: data.market_data.circulating_supply,
      total_supply: data.market_data.total_supply,
      ath: data.market_data.ath.usd,
      atl: data.market_data.atl.usd,
    };
  } catch (error) {
    console.error(`Error fetching market data for ${tokenId}:`, error);
    return null;
  }
}

/**
 * Fetch all portfolio token prices (SOL, mSOL, bSOL)
 */
export async function fetchPortfolioPrices(): Promise<{
  sol: number;
  msol: number;
  bsol: number;
}> {
  const tokenIds = [TOKEN_IDS.SOL, TOKEN_IDS.MSOL, TOKEN_IDS.BSOL];
  const prices = await fetchMultipleTokenPrices(tokenIds);

  return {
    sol: prices[TOKEN_IDS.SOL]?.usd || 0,
    msol: prices[TOKEN_IDS.MSOL]?.usd || 0,
    bsol: prices[TOKEN_IDS.BSOL]?.usd || 0,
  };
}

/**
 * Fetch real-time native SOL staking APY from Solana Compass
 */
async function fetchNativeSOLAPY(): Promise<number> {
  try {
    // Use validators.app API for real-time staking APY
    const response = await axios.get("https://www.validators.app/api/v1/validators/stake-pools.json", {
      timeout: 5000,
    });
    
    console.log("Validators API response sample:", response.data?.slice(0, 2));
    
    // Find Solana Compass pool or calculate average
    const pools = response.data || [];
    if (Array.isArray(pools) && pools.length > 0) {
      // Calculate average APY from top stake pools
      let totalApy = 0;
      let count = 0;
      
      for (let i = 0; i < Math.min(10, pools.length); i++) {
        const pool = pools[i];
        const apy = pool.apy || pool.APY || pool.avg_apy || 0;
        if (apy > 0) {
          totalApy += apy;
          count++;
        }
      }
      
      if (count > 0) {
        const avgApy = totalApy / count;
        console.log("Native SOL APY:", avgApy);
        return avgApy;
      }
    }
    
    console.log("Using fallback SOL APY");
    return 7.2;
  } catch (error: any) {
    console.error("Error fetching native SOL APY:", error.message);
    // Fallback to estimated 7.2% APY
    return 7.2;
  }
}

/**
 * Fetch real-time mSOL APY from Marinade Finance
 */
async function fetchMarinadeAPY(): Promise<number> {
  try {
    // Marinade Finance APY endpoint
    const response = await axios.get("https://api.marinade.finance/msol/apy/1d", {
      timeout: 5000,
    });
    
    console.log("Marinade API response:", response.data);
    
    // Handle different response formats
    let apyValue = 0;
    if (typeof response.data === 'number') {
      apyValue = response.data;
    } else if (response.data?.value !== undefined) {
      apyValue = response.data.value;
    } else if (response.data?.apy !== undefined) {
      apyValue = response.data.apy;
    }
    
    // Convert decimal to percentage if needed
    const finalApy = apyValue > 1 ? apyValue : apyValue * 100;
    console.log("Marinade APY:", finalApy);
    return finalApy > 0 ? finalApy : 6.8;
  } catch (error: any) {
    console.error("Error fetching Marinade APY:", error.message);
    return 6.8; // Fallback to estimated value
  }
}

/**
 * Fetch real-time bSOL APY from BlazeStake
 */
async function fetchBlazeStakeAPY(): Promise<number> {
  try {
    const response = await axios.get("https://stake.solblaze.org/api/v1/apy", {
      timeout: 5000,
    });
    // BlazeStake returns APY as a number (e.g., 7.5 for 7.5%)
    const apyValue = response.data?.apy || response.data || 0;
    // If it's a plain number response, use it directly
    return typeof apyValue === 'number' ? apyValue : parseFloat(apyValue) || 7.5;
  } catch (error) {
    console.error("Error fetching BlazeStake APY:", error);
    return 7.5; // Fallback to estimated value
  }
}

/**
 * Get real-time staking APY for SOL, mSOL, and bSOL
 * Fetches from protocol-specific APIs:
 * - Solana Compass for native SOL
 * - Marinade Finance API for mSOL
 * - BlazeStake API for bSOL
 */
export async function fetchStakingAPY(): Promise<StakingAPY> {
  try {
    // Fetch all APYs in parallel for better performance
    const [solAPY, msolAPY, bsolAPY] = await Promise.all([
      fetchNativeSOLAPY(),
      fetchMarinadeAPY(),
      fetchBlazeStakeAPY(),
    ]);

    // Use current rates if APIs return 0 or fail
    return {
      sol: solAPY > 0 ? solAPY : 6.28,
      msol: msolAPY > 0 ? msolAPY : 6.42,
      bsol: bsolAPY > 0 ? bsolAPY : 7.5,
    };
  } catch (error) {
    console.error("Error fetching staking APY:", error);
    // Return current rates as fallback
    return {
      sol: 6.28,
      msol: 6.42,
      bsol: 7.5,
    };
  }
}

/**
 * Calculate total portfolio value in USD
 */
export function calculatePortfolioValue(
  balances: { sol: number; msol: number; bsol: number },
  prices: { sol: number; msol: number; bsol: number }
): number {
  return (
    balances.sol * prices.sol +
    balances.msol * prices.msol +
    balances.bsol * prices.bsol
  );
}

/**
 * Format price with appropriate decimals
 */
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 1) {
    return price.toFixed(2);
  } else if (price >= 0.01) {
    return price.toFixed(4);
  } else {
    return price.toFixed(6);
  }
}

/**
 * Format APY percentage
 */
export function formatAPY(apy: number): string {
  return `${apy > 0 ? '+' : ''}${apy.toFixed(2)}%`;
}
