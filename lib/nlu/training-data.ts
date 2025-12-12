// Synthetic training data for NLU model
export interface TrainingExample {
  text: string;
  intent: string;
  entities?: {
    amount?: number;
    token?: string;
    address?: string;
    duration?: string;
    risk_level?: string;
  };
}

export const INTENTS = {
  STAKE_NATIVE: 'STAKE_NATIVE',
  STAKE_MSOL: 'STAKE_MSOL',
  STAKE_BSOL: 'STAKE_BSOL',
  UNSTAKE_NATIVE: 'UNSTAKE_NATIVE',
  UNSTAKE_MSOL: 'UNSTAKE_MSOL',
  UNSTAKE_BSOL: 'UNSTAKE_BSOL',
  SEND: 'SEND',
  EXPLAIN: 'EXPLAIN',
  BALANCE: 'BALANCE',
  PRICE: 'PRICE',
  MARKET_DATA: 'MARKET_DATA',
  PORTFOLIO_ANALYSIS: 'PORTFOLIO_ANALYSIS',
  PORTFOLIO_RECOMMENDATION: 'PORTFOLIO_RECOMMENDATION',
} as const;

export type Intent = typeof INTENTS[keyof typeof INTENTS];

// Generate comprehensive training dataset
export const generateTrainingData = (): TrainingExample[] => {
  const data: TrainingExample[] = [];

  // ========== STAKE_NATIVE (Native SOL staking) ==========
  const stakeNativeTemplates = [
    "stake {amount} sol",
    "stake {amount} SOL",
    "stake {amount} native sol",
    "i want to stake {amount} sol",
    "can you stake {amount} sol for me",
    "please stake {amount} sol",
    "pls stake {amount} sol",
    "staking {amount} sol",
    "put {amount} sol to stake",
    "lock {amount} sol",
    "delegate {amount} sol",
    "stake {amount} solana",
    "stake {amount} native",
    "stake {amount} in native sol",
    "can i stake {amount} sol",
    "help me stake {amount} sol",
    "i wanna stake {amount} sol",
    "could you stake {amount} sol",
    "stake about {amount} sol",
  ];

  const amounts = [0.5, 1, 1.5, 2, 5, 10, 15, 20, 50, 100];
  
  stakeNativeTemplates.forEach(template => {
    amounts.forEach(amount => {
      data.push({
        text: template.replace('{amount}', amount.toString()),
        intent: INTENTS.STAKE_NATIVE,
        entities: { amount, token: 'SOL' },
      });
    });
  });

  // ========== STAKE_MSOL (Marinade Finance) ==========
  const stakeMsolTemplates = [
    "stake {amount} sol to msol",
    "stake {amount} SOL in msol",
    "stake {amount} sol into msol",
    "stake {amount} to msol",
    "convert {amount} sol to msol",
    "i want to stake {amount} sol in msol",
    "can you put {amount} sol into msol for me",
    "please stake {amount} sol to msol",
    "pls stake {amount} msol",
    "stake {amount} in marinade",
    "stake {amount} with marinade",
    "stake {amount} sol marinade",
    "liquid stake {amount} sol msol",
    "msol stake {amount} sol",
    "stake {amount} sol for msol",
    "can i stake {amount} sol to msol",
    "help me stake {amount} sol in msol",
    "i wanna stake {amount} to msol",
    "could you stake {amount} sol into msol",
    "can we do {amount} marinade",
    "do {amount} marinade",
    "lets do {amount} marinade",
    "{amount} marinade please",
    "please {amount} marinade",
    "stake {amount} marinade",
    "{amount} to marinade",
    "{amount} in marinade",
    "put {amount} in marinade",
    "can we stake {amount} marinade",
  ];

  stakeMsolTemplates.forEach(template => {
    amounts.forEach(amount => {
      data.push({
        text: template.replace('{amount}', amount.toString()),
        intent: INTENTS.STAKE_MSOL,
        entities: { amount, token: 'mSOL' },
      });
    });
  });

  // ========== STAKE_BSOL (BlazeStake) ==========
  const stakeBsolTemplates = [
    "stake {amount} sol to bsol",
    "stake {amount} SOL in bsol",
    "stake {amount} sol into bsol",
    "stake {amount} to bsol",
    "convert {amount} sol to bsol",
    "i want to stake {amount} sol in bsol",
    "can you put {amount} sol into bsol for me",
    "please stake {amount} sol to bsol",
    "pls stake {amount} bsol",
    "stake {amount} in blaze",
    "stake {amount} with blazestake",
    "stake {amount} sol blaze",
    "liquid stake {amount} sol bsol",
    "bsol stake {amount} sol",
    "stake {amount} sol for bsol",
    "can i stake {amount} sol to bsol",
    "help me stake {amount} sol in bsol",
    "i wanna stake {amount} to bsol",
    "could you stake {amount} sol into bsol",
  ];

  stakeBsolTemplates.forEach(template => {
    amounts.forEach(amount => {
      data.push({
        text: template.replace('{amount}', amount.toString()),
        intent: INTENTS.STAKE_BSOL,
        entities: { amount, token: 'bSOL' },
      });
    });
  });

  // ========== UNSTAKE_NATIVE ==========
  const unstakeNativeTemplates = [
    "unstake {amount} sol",
    "unstake {amount} SOL",
    "unstake {amount} native sol",
    "i want to unstake {amount} sol",
    "can you unstake {amount} sol for me",
    "please unstake {amount} sol",
    "pls unstake {amount} sol",
    "unstaking {amount} sol",
    "withdraw {amount} sol",
    "undelegate {amount} sol",
    "deactivate {amount} sol",
    "unstake {amount} native",
    "can i unstake {amount} sol",
    "help me unstake {amount} sol",
    "i wanna unstake {amount} sol",
    "could you unstake {amount} sol",
  ];

  // Patterns without amount (shows account selector)
  const unstakeNativeNoAmountTemplates = [
    "unstake sol",
    "unstake SOL",
    "unstake native sol",
    "i want to unstake sol",
    "can you unstake sol for me",
    "please unstake sol",
    "unstake native",
    "unstaking sol",
  ];

  unstakeNativeTemplates.forEach(template => {
    amounts.forEach(amount => {
      data.push({
        text: template.replace('{amount}', amount.toString()),
        intent: INTENTS.UNSTAKE_NATIVE,
        entities: { amount, token: 'SOL' },
      });
    });
  });

  // Add no-amount patterns (amount will be selected from account list)
  unstakeNativeNoAmountTemplates.forEach(template => {
    data.push({
      text: template,
      intent: INTENTS.UNSTAKE_NATIVE,
      entities: { token: 'SOL' },
    });
  });

  // ========== UNSTAKE_MSOL ==========
  const unstakeMsolTemplates = [
    "unstake {amount} msol",
    "unstake {amount} mSOL",
    "unstake msol {amount}",
    "i want to unstake {amount} msol",
    "can you unstake {amount} msol for me",
    "please unstake {amount} msol",
    "pls unstake {amount} msol",
    "withdraw {amount} msol",
    "convert {amount} msol back to sol",
    "unstake marinade {amount}",
    "can i unstake {amount} msol",
    "help me unstake {amount} msol",
    "i wanna unstake {amount} msol",
    "unstake {amount} from msol",
  ];

  unstakeMsolTemplates.forEach(template => {
    amounts.forEach(amount => {
      data.push({
        text: template.replace('{amount}', amount.toString()),
        intent: INTENTS.UNSTAKE_MSOL,
        entities: { amount, token: 'mSOL' },
      });
    });
  });

  // ========== UNSTAKE_BSOL ==========
  const unstakeBsolTemplates = [
    "unstake {amount} bsol",
    "unstake {amount} bSOL",
    "unstake bsol {amount}",
    "i want to unstake {amount} bsol",
    "can you unstake {amount} bsol for me",
    "please unstake {amount} bsol",
    "pls unstake {amount} bsol",
    "withdraw {amount} bsol",
    "convert {amount} bsol back to sol",
    "unstake blaze {amount}",
    "can i unstake {amount} bsol",
    "help me unstake {amount} bsol",
    "i wanna unstake {amount} bsol",
    "unstake {amount} from bsol",
  ];

  unstakeBsolTemplates.forEach(template => {
    amounts.forEach(amount => {
      data.push({
        text: template.replace('{amount}', amount.toString()),
        intent: INTENTS.UNSTAKE_BSOL,
        entities: { amount, token: 'bSOL' },
      });
    });
  });

  // ========== SEND ==========
  const sendTemplates = [
    "send {amount} sol to {address}",
    "send {amount} SOL to {address}",
    "transfer {amount} sol to {address}",
    "can you send {amount} sol to {address}",
    "please send {amount} sol to {address}",
    "pls send {amount} sol to {address}",
    "i want to send {amount} sol to {address}",
    "help me send {amount} sol to {address}",
    "transfer {amount} to {address}",
    "send {amount} to this address {address}",
    "can i send {amount} sol to {address}",
    "i wanna send {amount} sol to {address}",
    "could you send {amount} sol to {address}",
    "send about {amount} sol to {address}",
  ];

  const addresses = [
    "GZXs9Dy4GzPD3PYZ2pz6ggPYPjDYKE3fFMDVZ8ZdEJ3m",
    "8sU2K6b1yvRJ9PCqN8xHJz7xpXzq2FZNLYjGWW3mYDt4",
    "FkHvw6KZEzqVf5CW9xXmMgzF7rLq9u3TpBN2jKdM8Yrx",
    "3V9P5mGjXqT2sWkN8YdHzE4rFLx7cU6aB1QvJnK9pMts",
  ];

  sendTemplates.forEach(template => {
    amounts.slice(0, 5).forEach(amount => {
      addresses.slice(0, 2).forEach(address => {
        data.push({
          text: template.replace('{amount}', amount.toString()).replace('{address}', address),
          intent: INTENTS.SEND,
          entities: { amount, address, token: 'SOL' },
        });
      });
    });
  });

  // ========== EXPLAIN ==========
  const explainTemplates = [
    "what is staking",
    "explain staking",
    "how does staking work",
    "what is msol",
    "what is bsol",
    "tell me about liquid staking",
    "explain liquid staking",
    "what is the difference between msol and bsol",
    "how does marinade work",
    "how does blazestake work",
    "what are the risks of staking",
    "explain apy",
    "what is native staking",
    "how to stake sol",
    "can you explain staking to me",
    "what are staking rewards",
    "how do i earn yield",
    "explain yield",
    "what is defi",
    "how does solana staking work",
  ];

  explainTemplates.forEach(text => {
    data.push({
      text,
      intent: INTENTS.EXPLAIN,
      entities: {},
    });
  });

  // ========== BALANCE ==========
  const balanceTemplates = [
    "what's my balance",
    "show my balance",
    "how much sol do i have",
    "check my balance",
    "balance",
    "my balance",
    "what is my balance",
    "can you check my balance",
    "show balance",
    "display my balance",
    "how much do i have",
  ];

  balanceTemplates.forEach(text => {
    data.push({
      text,
      intent: INTENTS.BALANCE,
      entities: {},
    });
  });

  // ========== PRICE ==========
  const priceTemplates = [
    "what is the price of sol",
    "sol price",
    "price of solana",
    "how much is sol",
    "what's the sol price",
    "current sol price",
    "msol price",
    "what is the price of msol",
    "bsol price",
    "what is the price of bsol",
    "jitosol price",
    "show me sol price",
    "tell me the price of sol",
  ];

  priceTemplates.forEach(text => {
    data.push({
      text,
      intent: INTENTS.PRICE,
      entities: {},
    });
  });

  // ========== MARKET_DATA ==========
  const marketTemplates = [
    "market data for sol",
    "market data for solana",
    "show me market data",
    "sol market cap",
    "solana market data",
    "msol market data",
    "bsol market data",
    "show market data for sol",
  ];

  marketTemplates.forEach(text => {
    data.push({
      text,
      intent: INTENTS.MARKET_DATA,
      entities: {},
    });
  });

  // ========== PORTFOLIO_ANALYSIS ==========
  const portfolioAnalysisTemplates = [
    "analyze my portfolio",
    "check my portfolio",
    "show my portfolio",
    "what's in my portfolio",
    "portfolio overview",
    "my holdings",
    "show my holdings",
    "what do i have",
    "what assets do i have",
    "show my assets",
    "portfolio breakdown",
    "asset breakdown",
    "my balance",
    "what's my balance",
    "check my balance",
    "show balance",
    "how much do i have",
    "portfolio distribution",
    "asset distribution",
    "how is my portfolio distributed",
    "show my allocation",
    "asset allocation",
    "portfolio allocation",
    "what's my allocation",
    "how are my assets allocated",
  ];

  portfolioAnalysisTemplates.forEach(text => {
    data.push({
      text,
      intent: INTENTS.PORTFOLIO_ANALYSIS,
      entities: {},
    });
  });

  // ========== PORTFOLIO_RECOMMENDATION ==========
  const portfolioRecommendationTemplates = [
    "suggest improvements",
    "how can i improve my portfolio",
    "optimize my portfolio",
    "what should i do with my portfolio",
    "any recommendations",
    "portfolio recommendations",
    "how to optimize",
    "give me suggestions",
    "what should i change",
    "should i rebalance",
    "should i move from msol to bsol",
    "should i switch from bsol to msol",
    "which is better msol or bsol",
    "should i stake more",
    "what's the best strategy",
    "how can i maximize yields",
    "improve my returns",
    "better allocation",
    "portfolio advice",
    "investment advice",
    "what do you recommend",
    "any suggestions for my portfolio",
    "help me optimize",
    "how to get better yields",
    "increase my apy",
  ];

  portfolioRecommendationTemplates.forEach(text => {
    data.push({
      text,
      intent: INTENTS.PORTFOLIO_RECOMMENDATION,
      entities: {},
    });
  });

  return data;
};

// Export the dataset
export const trainingDataset = generateTrainingData();

// Add some typo variations
export const addTypoVariations = (data: TrainingExample[]): TrainingExample[] => {
  const withTypos = [...data];
  const typoMappings: Record<string, string[]> = {
    'stake': ['stak', 'stke', 'satke', 'steak'],
    'unstake': ['unstak', 'unstke', 'unstack'],
    'send': ['snd', 'sed', 'sned'],
    'sol': ['Sol', 'SOl', 'soL'],
    'msol': ['mSol', 'MSOL', 'msol', 'mSol'],
    'bsol': ['bSol', 'BSOL', 'bsol', 'bSol'],
  };

  // Add 10% typo variations
  const subset = data.filter((_, i) => i % 10 === 0);
  subset.forEach(example => {
    let text = example.text;
    Object.entries(typoMappings).forEach(([correct, typos]) => {
      if (text.includes(correct) && Math.random() > 0.5) {
        const typo = typos[Math.floor(Math.random() * typos.length)];
        text = text.replace(correct, typo);
      }
    });
    withTypos.push({ ...example, text });
  });

  return withTypos;
};

// Export full dataset with typos
export const fullTrainingDataset = addTypoVariations(trainingDataset);

console.log(`Generated ${trainingDataset.length} training examples (${fullTrainingDataset.length} with typos)`);
