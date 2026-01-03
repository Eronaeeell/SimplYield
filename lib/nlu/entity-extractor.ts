// Entity extraction from user input
export interface ExtractedEntities {
  amount?: number;
  token?: 'SOL' | 'mSOL' | 'bSOL' | 'NATIVE';
  address?: string;
  duration?: string;
  risk_level?: 'low' | 'medium' | 'high';
}

// Patterns for entity extraction
const AMOUNT_PATTERN = /(\d+(?:\.\d+)?)/;
const SOL_PATTERN = /\b(sol|solana|native)\b/i;
const MSOL_PATTERN = /\b(msol|marinade)\b/i;
const BSOL_PATTERN = /\b(bsol|blaze(?:stake)?)\b/i;
// Support both Solana (base58) and Ethereum-style (0x) addresses
const ADDRESS_PATTERN = /\b(?:0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})\b/;
const DURATION_PATTERN = /\b(\d+\s*(?:days?|weeks?|months?|years?))\b/i;
const RISK_PATTERN = /\b(low|medium|high)(?:\s+risk)?\b/i;

// Fuzzy matching for tokens with typos
const fuzzyMatchToken = (text: string): 'SOL' | 'mSOL' | 'bSOL' | 'NATIVE' | undefined => {
  const lower = text.toLowerCase();
  
  // mSOL variants
  if (/m[sS]?[oO0][lL1]|marinade/i.test(lower)) return 'mSOL';
  
  // bSOL variants
  if (/b[sS]?[oO0][lL1]|blaze/i.test(lower)) return 'bSOL';
  
  // Native/SOL variants
  if (/[sS][oO0][lL1]|solana|native/i.test(lower)) return 'SOL';
  
  return undefined;
};

export const extractEntities = (text: string): ExtractedEntities => {
  const entities: ExtractedEntities = {};
  
  // Extract amount
  const amountMatch = text.match(AMOUNT_PATTERN);
  if (amountMatch) {
    entities.amount = parseFloat(amountMatch[1]);
  }
  
  // Extract token (with fuzzy matching)
  const tokenMatch = fuzzyMatchToken(text);
  if (tokenMatch) {
    entities.token = tokenMatch;
  }
  
  // If no fuzzy match, try exact patterns
  if (!entities.token) {
    if (BSOL_PATTERN.test(text)) {
      entities.token = 'bSOL';
    } else if (MSOL_PATTERN.test(text)) {
      entities.token = 'mSOL';
    } else if (SOL_PATTERN.test(text)) {
      entities.token = 'SOL';
    }
  }
  
  // Extract address
  const addressMatch = text.match(ADDRESS_PATTERN);
  if (addressMatch) {
    entities.address = addressMatch[0];
  }
  
  // Extract duration
  const durationMatch = text.match(DURATION_PATTERN);
  if (durationMatch) {
    entities.duration = durationMatch[1];
  }
  
  // Extract risk level
  const riskMatch = text.match(RISK_PATTERN);
  if (riskMatch) {
    entities.risk_level = riskMatch[1].toLowerCase() as 'low' | 'medium' | 'high';
  }
  
  return entities;
};

// Validate extracted entities based on intent
export const validateEntities = (
  intent: string,
  entities: ExtractedEntities
): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  // Intent-specific validation
  switch (intent) {
    case 'STAKE_NATIVE':
    case 'STAKE_MSOL':
    case 'STAKE_BSOL':
    case 'UNSTAKE_NATIVE':
    case 'UNSTAKE_MSOL':
    case 'UNSTAKE_BSOL':
      if (!entities.amount) missing.push('amount');
      break;
      
    case 'SEND':
      if (!entities.amount) missing.push('amount');
      if (!entities.address) missing.push('address');
      break;
      
    default:
      // No validation needed for other intents
      break;
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
};

// Helper to create error message for missing entities
export const getMissingEntitiesMessage = (intent: string, missing: string[], originalText: string): string => {
  const entityNames: Record<string, string> = {
    amount: 'amount',
    address: 'recipient address',
    token: 'token type',
  };
  
  const missingNames = missing.map(m => entityNames[m] || m).join(', ');
  
  switch (intent) {
    case 'STAKE_NATIVE':
      return `Sure! How much SOL would you like to stake? 💰\n\nJust tell me the amount like: "5 SOL" or "stake 5"`;
      
    case 'STAKE_MSOL':
      return `I'd be happy to help you stake to Marinade! 🌊\n\nHow much would you like to stake? For example: "5 SOL" or "stake 5 to msol"`;
      
    case 'STAKE_BSOL':
      return `Great choice with BlazeStake! 🔥\n\nHow much would you like to stake? For example: "5 SOL" or "stake 5 to bsol"`;
      
    case 'UNSTAKE_NATIVE':
    case 'UNSTAKE_MSOL':
    case 'UNSTAKE_BSOL':
      return `I can help you unstake! 📤\n\nHow much would you like to unstake? For example: "3 SOL" or "unstake 3"`;
      
    case 'SEND':
      return `I can help you send SOL! 💸\n\nI need both the ${missingNames}. For example: "send 2 SOL to GZXs9Dy4GzPD3PYZ2pz6ggPYPjDYKE3fFMDVZ8ZdEJ3m"`;
      
    default:
      return `I need the following information: ${missingNames}`;
  }
};
