// lib/portfolio-service.ts
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { fetchMultipleTokenPrices, fetchStakingAPY, TOKEN_IDS } from './coingecko-service';
import { getUserStakeAccounts } from './getUserStakeAccounts';

export interface TokenBalance {
  symbol: string;
  amount: number;
  valueUSD: number;
  percentage: number;
  priceUSD: number;
  apy?: number;
  change24h?: number;
}

export interface PortfolioData {
  totalValueUSD: number;
  totalSOLEquivalent: number;
  liquidSOL: number; // Unstaked SOL balance
  liquidSOLValueUSD: number; // Unstaked SOL value in USD
  assets: TokenBalance[];
  lastUpdated: Date;
}

export interface PortfolioRecommendation {
  type: 'rebalance' | 'stake_optimization' | 'risk_adjustment' | 'yield_improvement';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialGain?: string;
  action?: string;
}

/**
 * Fetch user's SPL token balances (mSOL, bSOL, etc.)
 */
async function fetchSPLTokenBalances(
  connection: Connection,
  walletPubkey: PublicKey
): Promise<{ msol: number; bsol: number; jitosol: number }> {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });

    let msol = 0;
    let bsol = 0;
    let jitosol = 0;

    // mSOL mint address
    const MSOL_MINT = 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So';
    // bSOL mint address
    const BSOL_MINT = 'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1';
    // jitoSOL mint address
    const JITOSOL_MINT = 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn';

    tokenAccounts.value.forEach((accountInfo) => {
      const parsedInfo = accountInfo.account.data.parsed.info;
      const mint = parsedInfo.mint;
      const amount = parsedInfo.tokenAmount.uiAmount || 0;

      if (mint === MSOL_MINT) {
        msol += amount;
      } else if (mint === BSOL_MINT) {
        bsol += amount;
      } else if (mint === JITOSOL_MINT) {
        jitosol += amount;
      }
    });

    return { msol, bsol, jitosol };
  } catch (error) {
    console.error('Error fetching SPL token balances:', error);
    return { msol: 0, bsol: 0, jitosol: 0 };
  }
}

/**
 * Fetch native SOL balance including staked SOL
 */
async function fetchSOLBalance(
  connection: Connection,
  walletPubkey: PublicKey
): Promise<{ liquid: number; staked: number; total: number }> {
  try {
    // Get liquid SOL balance
    const balance = await connection.getBalance(walletPubkey);
    const liquidSOL = balance / LAMPORTS_PER_SOL;

    // Get staked SOL from stake accounts (only active accounts with balance)
    const stakeAccounts = await getUserStakeAccounts(walletPubkey, connection);
    console.log('📊 Stake accounts found:', stakeAccounts.length);
    const stakedSOL = stakeAccounts.reduce((total, account) => {
      const accountSOL = account.lamports / LAMPORTS_PER_SOL;
      console.log('  - Stake account:', account.stakePubkey.toString().slice(0, 8), accountSOL.toFixed(4), 'SOL, status:', account.status);
      // Only count accounts with balance > 0.01 SOL (filter out dust/empty accounts)
      if (accountSOL > 0.01) {
        return total + accountSOL;
      }
      return total;
    }, 0);
    console.log('📊 Total staked SOL (filtered):', stakedSOL.toFixed(4));
    console.log('📊 Liquid SOL:', liquidSOL.toFixed(4));

    return {
      liquid: liquidSOL,
      staked: stakedSOL,
      total: liquidSOL + stakedSOL,
    };
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    return { liquid: 0, staked: 0, total: 0 };
  }
}

/**
 * Get comprehensive portfolio data for a user
 */
export async function getUserPortfolio(
  connection: Connection,
  walletPubkey: PublicKey
): Promise<PortfolioData> {
  try {
    // Fetch balances in parallel
    const [solBalance, splBalances] = await Promise.all([
      fetchSOLBalance(connection, walletPubkey),
      fetchSPLTokenBalances(connection, walletPubkey),
    ]);

    // Fetch prices and APYs in parallel
    const [prices, apys] = await Promise.all([
      fetchMultipleTokenPrices([TOKEN_IDS.SOL, TOKEN_IDS.MSOL, TOKEN_IDS.BSOL, TOKEN_IDS.JITOSOL]),
      fetchStakingAPY(),
    ]);

    // Extract prices with fallbacks
    const solPrice = prices[TOKEN_IDS.SOL]?.usd || 0;
    const msolPrice = prices[TOKEN_IDS.MSOL]?.usd || 0;
    const bsolPrice = prices[TOKEN_IDS.BSOL]?.usd || 0;
    const jitosolPrice = prices[TOKEN_IDS.JITOSOL]?.usd || 0;

    // Calculate values - Separate liquid and staked SOL
    const liquidSolValue = solBalance.liquid * solPrice;
    const stakedSolValue = solBalance.staked * solPrice;
    const msolValue = splBalances.msol * msolPrice;
    const bsolValue = splBalances.bsol * bsolPrice;
    const jitosolValue = splBalances.jitosol * jitosolPrice;
    
    // Total balance is sum of actual token amounts (wallet SOL + bSOL + mSOL)
    const totalSOLAmount = solBalance.liquid + splBalances.bsol + splBalances.msol + splBalances.jitosol;
    const totalValue = totalSOLAmount * solPrice;
    
    // Total for percentage calculation includes all assets
    const totalValueForPercentage = liquidSolValue + stakedSolValue + msolValue + bsolValue + jitosolValue;

    // Build asset list
    const assets: TokenBalance[] = [];

    // Add liquid SOL (wallet balance) - shown but not counted in portfolio total
    if (solBalance.liquid > 0) {
      assets.push({
        symbol: 'SOL',
        amount: solBalance.liquid,
        valueUSD: liquidSolValue,
        percentage: totalValueForPercentage > 0 ? (liquidSolValue / totalValueForPercentage) * 100 : 0,
        priceUSD: solPrice,
        apy: 0, // Wallet SOL doesn't earn APY
        change24h: prices[TOKEN_IDS.SOL]?.usd_24h_change,
      });
    }

    // Add staked SOL (native staking)
    if (solBalance.staked > 0) {
      assets.push({
        symbol: 'STAKED_SOL',
        amount: solBalance.staked,
        valueUSD: stakedSolValue,
        percentage: totalValueForPercentage > 0 ? (stakedSolValue / totalValueForPercentage) * 100 : 0,
        priceUSD: solPrice,
        apy: apys.sol,
        change24h: prices[TOKEN_IDS.SOL]?.usd_24h_change,
      });
    }

    if (splBalances.msol > 0) {
      assets.push({
        symbol: 'mSOL',
        amount: splBalances.msol,
        valueUSD: msolValue,
        percentage: totalValueForPercentage > 0 ? (msolValue / totalValueForPercentage) * 100 : 0,
        priceUSD: msolPrice,
        apy: apys.msol,
        change24h: prices[TOKEN_IDS.MSOL]?.usd_24h_change,
      });
    }

    if (splBalances.bsol > 0) {
      assets.push({
        symbol: 'bSOL',
        amount: splBalances.bsol,
        valueUSD: bsolValue,
        percentage: totalValueForPercentage > 0 ? (bsolValue / totalValueForPercentage) * 100 : 0,
        priceUSD: bsolPrice,
        apy: apys.bsol,
        change24h: prices[TOKEN_IDS.BSOL]?.usd_24h_change,
      });
    }

    if (splBalances.jitosol > 0) {
      assets.push({
        symbol: 'jitoSOL',
        amount: splBalances.jitosol,
        valueUSD: jitosolValue,
        percentage: totalValueForPercentage > 0 ? (jitosolValue / totalValueForPercentage) * 100 : 0,
        priceUSD: jitosolPrice,
        apy: 7.2, // Default jitoSOL APY
        change24h: prices[TOKEN_IDS.JITOSOL]?.usd_24h_change,
      });
    }

    // Sort by value (largest first)
    assets.sort((a, b) => b.valueUSD - a.valueUSD);

    return {
      totalValueUSD: totalValue,
      totalSOLEquivalent: totalSOLAmount,
      liquidSOL: solBalance.liquid, // Add liquid SOL for display
      liquidSOLValueUSD: liquidSolValue, // Add liquid SOL value
      assets,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching user portfolio:', error);
    throw error;
  }
}

/**
 * Analyze portfolio and generate intelligent recommendations
 */
export function analyzePortfolio(portfolio: PortfolioData): PortfolioRecommendation[] {
  const recommendations: PortfolioRecommendation[] = [];

  if (portfolio.assets.length === 0) {
    return [{
      type: 'risk_adjustment',
      priority: 'high',
      title: 'No Assets Detected',
      description: 'Your portfolio appears empty. Consider depositing SOL to start earning yields.',
      action: 'Deposit SOL to your wallet to begin.',
    }];
  }

  // Find assets by symbol
  const solAsset = portfolio.assets.find(a => a.symbol === 'SOL');
  const msolAsset = portfolio.assets.find(a => a.symbol === 'mSOL');
  const bsolAsset = portfolio.assets.find(a => a.symbol === 'bSOL');
  const jitosolAsset = portfolio.assets.find(a => a.symbol === 'jitoSOL');

  // Calculate weighted average APY
  const totalStaked = (msolAsset?.valueUSD || 0) + (bsolAsset?.valueUSD || 0) + (jitosolAsset?.valueUSD || 0);
  const weightedAPY = totalStaked > 0
    ? ((msolAsset?.valueUSD || 0) * (msolAsset?.apy || 0) +
       (bsolAsset?.valueUSD || 0) * (bsolAsset?.apy || 0) +
       (jitosolAsset?.valueUSD || 0) * (jitosolAsset?.apy || 0)) / totalStaked
    : 0;

  // 1. Check for unstaked SOL
  if (solAsset && solAsset.percentage > 20) {
    const potentialYield = (solAsset.valueUSD * 0.07) / 12; // Monthly at 7% APY
    recommendations.push({
      type: 'yield_improvement',
      priority: 'high',
      title: 'Large Unstaked SOL Balance',
      description: `You have ${solAsset.amount.toFixed(2)} SOL (${solAsset.percentage.toFixed(1)}% of portfolio) sitting idle. Consider staking to earn ~7% APY.`,
      potentialGain: `~$${potentialYield.toFixed(2)}/month`,
      action: `Stake SOL to bSOL for ${bsolAsset?.apy?.toFixed(2) || '7.5'}% APY or mSOL for ${msolAsset?.apy?.toFixed(2) || '6.8'}% APY`,
    });
  }

  // 2. APY optimization - recommend highest yielding asset
  const allStakedAssets = [msolAsset, bsolAsset, jitosolAsset].filter(a => a !== undefined) as TokenBalance[];
  if (allStakedAssets.length > 1) {
    const highestAPY = Math.max(...allStakedAssets.map(a => a.apy || 0));
    const lowestAPY = Math.min(...allStakedAssets.map(a => a.apy || 0));
    const apyDiff = highestAPY - lowestAPY;

    if (apyDiff > 0.5) {
      const bestAsset = allStakedAssets.find(a => a.apy === highestAPY);
      const worstAsset = allStakedAssets.find(a => a.apy === lowestAPY);

      if (bestAsset && worstAsset && worstAsset.valueUSD > 100) {
        const potentialGain = ((worstAsset.valueUSD * apyDiff) / 100);
        recommendations.push({
          type: 'stake_optimization',
          priority: apyDiff > 1.0 ? 'high' : 'medium',
          title: 'APY Optimization Opportunity',
          description: `Your ${worstAsset.symbol} earns ${worstAsset.apy?.toFixed(2)}% APY while ${bestAsset.symbol} offers ${bestAsset.apy?.toFixed(2)}% APY. Moving to ${bestAsset.symbol} could boost your yields.`,
          potentialGain: `+$${potentialGain.toFixed(2)}/year`,
          action: `Consider converting ${worstAsset.symbol} to ${bestAsset.symbol} for better returns`,
        });
      }
    }
  }

  // 3. Diversification check
  const topAssetPercentage = portfolio.assets[0]?.percentage || 0;
  if (topAssetPercentage > 70 && portfolio.assets.length > 1) {
    recommendations.push({
      type: 'risk_adjustment',
      priority: 'medium',
      title: 'High Concentration Risk',
      description: `${portfolio.assets[0].symbol} represents ${topAssetPercentage.toFixed(1)}% of your portfolio. Consider diversifying across multiple liquid staking tokens to reduce risk.`,
      action: 'Rebalance to spread holdings across mSOL, bSOL, and jitoSOL',
    });
  }

  // 4. Small positions cleanup
  const smallPositions = portfolio.assets.filter(a => a.valueUSD < 10 && a.percentage < 5);
  if (smallPositions.length > 2) {
    recommendations.push({
      type: 'rebalance',
      priority: 'low',
      title: 'Simplify Small Positions',
      description: `You have ${smallPositions.length} small positions totaling less than $${smallPositions.reduce((sum, a) => sum + a.valueUSD, 0).toFixed(2)}. Consider consolidating for easier management.`,
      action: 'Consolidate small holdings into your main staking position',
    });
  }

  // 5. Performance-based recommendation
  if (weightedAPY > 0 && weightedAPY < 6.5) {
    recommendations.push({
      type: 'yield_improvement',
      priority: 'medium',
      title: 'Below-Average Portfolio Yield',
      description: `Your current portfolio APY is ${weightedAPY.toFixed(2)}%, which is below the average 7%+ available on Solana. Optimizing your stake positions could improve returns.`,
      action: 'Review and move to higher-yielding liquid staking options',
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Format portfolio data for chatbot context
 */
export function formatPortfolioForAI(portfolio: PortfolioData): string {
  const lastUpdated = new Date(portfolio.lastUpdated);
  let context = `USER PORTFOLIO DATA (as of ${lastUpdated.toLocaleTimeString()}):\n\n`;
  context += `Total Value: $${portfolio.totalValueUSD.toFixed(2)} (${portfolio.totalSOLEquivalent.toFixed(2)} SOL)\n`;
  context += `Liquid Balance: ${portfolio.liquidSOL.toFixed(4)} SOL ($${portfolio.liquidSOLValueUSD.toFixed(2)})\n\n`;
  context += `Holdings:\n`;

  portfolio.assets.forEach(asset => {
    let assetLabel = asset.symbol;
    if (asset.symbol === 'SOL') assetLabel = 'SOL (Liquidity)';
    if (asset.symbol === 'STAKED_SOL') assetLabel = 'SOL (Staked)';
    context += `- ${assetLabel}: ${asset.amount.toFixed(4)} tokens ($${asset.valueUSD.toFixed(2)}, ${asset.percentage.toFixed(2)}% of portfolio)\n`;
    if (asset.apy) {
      context += `  APY: ${asset.apy.toFixed(2)}%\n`;
    }
    if (asset.change24h !== undefined) {
      context += `  24h Change: ${asset.change24h >= 0 ? '+' : ''}${asset.change24h.toFixed(2)}%\n`;
    }
  });

  // Add recommendations
  const recommendations = analyzePortfolio(portfolio);
  if (recommendations.length > 0) {
    context += `\nRECOMMENDATIONS:\n`;
    recommendations.forEach((rec, idx) => {
      context += `${idx + 1}. [${rec.priority.toUpperCase()}] ${rec.title}\n`;
      context += `   ${rec.description}\n`;
      if (rec.potentialGain) {
        context += `   Potential gain: ${rec.potentialGain}\n`;
      }
    });
  }

  return context;
}
