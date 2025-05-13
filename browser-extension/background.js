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
let walletConnectedFromWebsite = false;

// Initialize extension
function initialize() {
  console.log('SimplYield Extension Initialized');
  
  // Check if we already have a connected wallet from storage
  checkForWalletConnection();
  
  // Set badge to indicate extension is active
  chrome.action.setBadgeBackgroundColor({ color: '#8A8FFF' });
  updateBadgeStatus();
  
  // Start monitoring if we have a wallet connected
  if (connectedWallet) {
    startMonitoring();
  }

  // Listen for website wallet connections
  setupWebsiteConnectionListener();
}

// Update badge based on wallet connection status
function updateBadgeStatus() {
  if (connectedWallet) {
    chrome.action.setBadgeText({ text: 'ON' });
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
  }
}

// Listen for wallet connections from websites
function setupWebsiteConnectionListener() {
  // Listen for messages from content scripts about wallet connections
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'walletConnectedFromWebsite') {
      handleWebsiteWalletConnection(request.walletData);
      sendResponse({ success: true });
    } else if (request.action === 'checkWalletConnection') {
      // Allow popup to check if wallet is connected
      sendResponse({ 
        connected: !!connectedWallet,
        wallet: connectedWallet,
        fromWebsite: walletConnectedFromWebsite
      });
    } else if (request.action === 'disconnectWallet') {
      disconnectWallet();
      sendResponse({ success: true });
    }
    return true;
  });
}

// Handle wallet connection from website
function handleWebsiteWalletConnection(walletData) {
  console.log('Wallet connected from website:', walletData);
  
  // Save wallet data
  walletConnectedFromWebsite = true;
  connectedWallet = {
    publicKey: walletData.publicKey,
    fullPublicKey: walletData.fullPublicKey || walletData.publicKey,
    label: walletData.label || 'Wallet',
    connectedAt: new Date().toISOString()
  };
  
  // Update wallet addresses for monitoring
  config.walletAddresses = [connectedWallet.fullPublicKey];
  
  // Save to storage
  chrome.storage.local.set({ 
    connectedWallet: connectedWallet,
    walletConnectedFromWebsite: true
  });
  
  // Start monitoring if not already
  if (!isMonitoring) {
    startMonitoring();
  }
  
  // Update badge status
  updateBadgeStatus();
  
  // Notify popup if open
  chrome.runtime.sendMessage({
    action: 'walletConnected',
    wallet: connectedWallet
  });
}

// Disconnect wallet
function disconnectWallet() {
  console.log('Disconnecting wallet');
  
  // Clear wallet data
  connectedWallet = null;
  walletConnectedFromWebsite = false;
  config.walletAddresses = [];
  
  // Update storage
  chrome.storage.local.remove(['connectedWallet', 'walletConnectedFromWebsite']);
  
  // Update badge
  updateBadgeStatus();
  
  // Notify popup if open
  chrome.runtime.sendMessage({
    action: 'walletDisconnected'
  });
  
  // Stop monitoring if active
  if (isMonitoring) {
    stopMonitoring();
  }
}

// Check if the user has connected a wallet
function checkForWalletConnection() {
  chrome.storage.local.get(['connectedWallet', 'walletConnectedFromWebsite'], function(result) {
    walletConnectedFromWebsite = result.walletConnectedFromWebsite || false;
    
    if (result.connectedWallet) {
      connectedWallet = result.connectedWallet;
      config.walletAddresses = [connectedWallet.fullPublicKey || connectedWallet.publicKey];
      console.log('Wallet found in storage:', connectedWallet.publicKey);
      
      // Start monitoring since we have a wallet
      startMonitoring();
      
      // Update badge
      updateBadgeStatus();
    } else if (!walletConnectedFromWebsite) {
      console.log('No wallet connected. Waiting for connection from website...');
    }
  });
}

// Stop monitoring for transactions
function stopMonitoring() {
  if (!isMonitoring) return;
  
  isMonitoring = false;
  console.log('Stopping transaction monitoring');
  
  // Clear any active polling intervals or timers here if needed
}

// Start monitoring for transactions
function startMonitoring() {
  if (isMonitoring) return;
  
  isMonitoring = true;
  console.log('Starting transaction monitoring for wallet:', connectedWallet.publicKey);
  
  // Initial check
  checkForNewTransactions();
  
  // Set up polling interval
  setInterval(checkForNewTransactions, config.pollInterval);
}

// Check for new transactions
async function checkForNewTransactions() {
  if (!connectedWallet) return;
  
  try {
    if (walletConnectedFromWebsite) {
      // Use real blockchain data if connected from website
      await fetchRealTransactions();
    } else {
      // In a real extension, this would make an RPC call to Solana
      // For demo purposes, we'll simulate new transactions occasionally
      if (Math.random() > 0.7) {  // 30% chance of new transaction
        simulateNewTransaction();
      }
    }
  } catch (error) {
    console.error('Error checking for transactions:', error);
  }
}

// Fetch real transactions from blockchain
async function fetchRealTransactions() {
  // In a real implementation, this would use @solana/web3.js to query the blockchain
  // This is a placeholder for the actual implementation
  console.log('Fetching real transactions for wallet:', connectedWallet.publicKey);
  
  // For demo, still simulate transactions
  if (Math.random() > 0.8) {  // 20% chance
    simulateNewTransaction(true);  // Mark as real transaction
  }
}

// Simulate a new transaction (for demo purposes)
function simulateNewTransaction(isReal = false) {
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
    recipient: connectedWallet.fullPublicKey || connectedWallet.publicKey,
    isReal: isReal  // Flag to indicate if this is a real transaction
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
  
  // Handle unstaking request
  if (request.action === 'unstake') {
    unstakeTokens(request.amount, request.token);
    sendResponse({ success: true });
  }
  
  // Fetch portfolio data
  if (request.action === 'getPortfolio') {
    fetchPortfolioData().then(data => {
      sendResponse({ success: true, portfolio: data });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;  // Indicates async response
  }
  
  // Fetch transaction history
  if (request.action === 'getTransactionHistory') {
    fetchTransactionHistory().then(data => {
      sendResponse({ success: true, transactions: data });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;  // Indicates async response
  }
  
  // Clear notification badge when popup is opened
  if (request.action === 'popupOpened') {
    // Only change to ON if there are no pending notifications
    if (chrome.action.getBadgeText({}) === '!') {
      chrome.action.setBadgeText({ text: 'ON' });
    }
    
    sendResponse({ 
      success: true, 
      walletConnected: !!connectedWallet,
      wallet: connectedWallet,
      walletConnectedFromWebsite: walletConnectedFromWebsite
    });
    return true;  // Indicates async response
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

// Simulate unstaking tokens
function unstakeTokens(amount, token) {
  console.log(`Unstaking ${amount} ${token}`);
  
  // Create a transaction record
  const transaction = {
    id: 'unstake_' + Math.random().toString(36).substring(2, 15),
    type: 'unstake',
    amount: amount,
    token: token,
    timestamp: new Date().toISOString(),
    status: 'completed'
  };
  
  // Store in history
  storeTransaction(transaction);
  
  return { success: true };
}

// Fetch portfolio data
async function fetchPortfolioData() {
  // In a real extension, this would fetch data from the blockchain
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Example portfolio data
      resolve({
        walletBalance: 12.45,
        stakedBalance: 7.5,
        rewards: 0.25,
        totalValue: 20.2,
        token: 'SOL'
      });
    }, 500);
  });
}

// Fetch transaction history
async function fetchTransactionHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['transactionHistory'], function(result) {
      resolve(result.transactionHistory || []);
    });
  });
}

// Initialize extension when installed or updated
chrome.runtime.onInstalled.addListener(function() {
  initialize();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "store_wallet") {
    chrome.storage.local.set({ walletAddress: message.address });
  }
});


// Initialize when browser starts
initialize();