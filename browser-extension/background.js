// Background script for SimplYield Extension
// This script monitors Solana transactions and detects incoming payments

// Configuration
const config = {
  pollInterval: 30000,  // Poll for new transactions every 30 seconds
  solanaRpcUrl: 'https://api.mainnet-beta.solana.com',  // Solana RPC endpoint
  walletAddresses: []   // Will be populated when user connects wallet
};

// Store for transactions to avoid duplicates
let processedTransactions = new Set();
let connectedWallet = null;
let isMonitoring = false;

// Initialize extension
function initialize() {
  console.log('SimplYield Extension Initialized');
  checkForWalletConnection();
  
  // Set badge to indicate extension is active
  chrome.action.setBadgeBackgroundColor({ color: '#8A8FFF' });
  chrome.action.setBadgeText({ text: 'ON' });
  
  // Start monitoring if we have a wallet connected
  if (connectedWallet) {
    startMonitoring();
  }
}

// Check if the user has connected a wallet
function checkForWalletConnection() {
  chrome.storage.local.get(['connectedWallet'], function(result) {
    if (result.connectedWallet) {
      connectedWallet = result.connectedWallet;
      config.walletAddresses.push(connectedWallet.publicKey);
      console.log('Wallet found:', connectedWallet.publicKey);
    } else {
      // For demo purposes, use a placeholder wallet address
      // In a real extension, we would prompt the user to connect their wallet
      const demoWallet = {
        publicKey: '8xzt...cs7S',  // Truncated for display
        fullPublicKey: '8xztcS7Vnm1xLBYZM487F7TTYmarnkJ5Tz7qs9XmcS7S'  // Example address
      };
      
      connectedWallet = demoWallet;
      config.walletAddresses.push(demoWallet.fullPublicKey);
      
      // Save to storage for future use
      chrome.storage.local.set({ connectedWallet: demoWallet });
      console.log('Demo wallet set:', demoWallet.publicKey);
    }
  });
}

// Start monitoring for transactions
function startMonitoring() {
  if (isMonitoring) return;
  
  isMonitoring = true;
  console.log('Starting transaction monitoring');
  
  // Initial check
  checkForNewTransactions();
  
  // Set up polling interval
  setInterval(checkForNewTransactions, config.pollInterval);
}

// Check for new transactions
async function checkForNewTransactions() {
  if (!connectedWallet) return;
  
  try {
    // In a real extension, this would make an RPC call to Solana
    // For demo purposes, we'll simulate new transactions occasionally
    if (Math.random() > 0.7) {  // 30% chance of new transaction
      simulateNewTransaction();
    }
  } catch (error) {
    console.error('Error checking for transactions:', error);
  }
}

// Simulate a new transaction (for demo purposes)
function simulateNewTransaction() {
  // Generate a random transaction ID
  const txId = 'tx_' + Math.random().toString(36).substring(2, 15);
  
  // Check if we've already processed this transaction
  if (processedTransactions.has(txId)) {
    return;
  }
  
  // Create a random transaction amount between 0.1 and 10 SOL
  const amount = (Math.random() * 9.9 + 0.1).toFixed(2);
  
  // Create transaction object
  const transaction = {
    id: txId,
    amount: amount,
    token: 'SOL',
    timestamp: new Date().toISOString(),
    sender: '5' + Math.random().toString(36).substring(2, 10),  // Random sender address
    recipient: connectedWallet.fullPublicKey || connectedWallet.publicKey
  };
  
  // Mark as processed
  processedTransactions.add(txId);
  
  // Store in history
  storeTransaction(transaction);
  
  // Show notification to user
  notifyUser(transaction);
  
  console.log('New transaction detected:', transaction);
}

// Store transaction in history
function storeTransaction(transaction) {
  chrome.storage.local.get(['transactionHistory'], function(result) {
    let history = result.transactionHistory || [];
    
    // Add new transaction to the beginning of the array
    history.unshift(transaction);
    
    // Limit history to 100 transactions
    if (history.length > 100) {
      history = history.slice(0, 100);
    }
    
    // Save updated history
    chrome.storage.local.set({ transactionHistory: history });
  });
}

// Notify user of new transaction
function notifyUser(transaction) {
  // Show notification badge on extension icon
  chrome.action.setBadgeText({ text: '!' });
  
  // Send message to popup if it's open
  chrome.runtime.sendMessage({
    action: 'newTransaction',
    transaction: transaction
  });
  
  // Create system notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'New Transaction Detected',
    message: `You received ${transaction.amount} ${transaction.token}`,
    priority: 2
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Handle staking request
  if (request.action === 'stake') {
    stakeTokens(request.amount, request.token);
    sendResponse({ success: true });
  }
  
  // Clear notification badge when popup is opened
  if (request.action === 'popupOpened') {
    chrome.action.setBadgeText({ text: 'ON' });
    sendResponse({ success: true });
  }
  
  return true;  // Indicates async response
});

// Simulate staking tokens
function stakeTokens(amount, token) {
  console.log(`Staking ${amount} ${token}`);
  
  // In a real extension, this would send a transaction to the Solana blockchain
  // For demo purposes, we'll just simulate a successful stake
  
  // Create a transaction record
  const transaction = {
    id: 'stake_' + Math.random().toString(36).substring(2, 15),
    type: 'stake',
    amount: amount,
    token: token,
    timestamp: new Date().toISOString(),
    status: 'completed'
  };
  
  // Store in history
  storeTransaction(transaction);
  
  return { success: true };
}

// Initialize extension when installed or updated
chrome.runtime.onInstalled.addListener(function() {
  initialize();
});

// Initialize when browser starts
initialize();