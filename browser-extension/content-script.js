// Content script for SimplYield Extension
// This script detects wallet connections on Solana websites and relays them to the extension

// Configuration
const WALLET_CONNECTION_CHECK_INTERVAL = 5000; // Check every 5 seconds

// Listen for wallet connection events
function setupWalletConnectionListener() {
  console.log('SimplYield: Setting up wallet connection listener');
  
  // Check for Phantom or other Solana wallet objects
  function checkForWalletConnection() {
    // Check if any wallet is in window.solana
    if (window.solana && window.solana.isPhantom && window.solana.isConnected) {
      // Phantom wallet detected
      handlePhantomWallet();
    } 
    // Check for Solflare
    else if (window.solflare && window.solflare.isConnected) {
      handleSolflareWallet();
    }
    // Generic check for any solana wallet in window.solana
    else if (window.solana && window.solana.isConnected) {
      handleGenericSolanaWallet();
    }
  }
  
  // Handle Phantom wallet connection
  function handlePhantomWallet() {
    try {
      const publicKey = window.solana.publicKey.toString();
      console.log('SimplYield: Phantom wallet detected', publicKey);
      
      // Relay to extension
      chrome.runtime.sendMessage({
        action: 'walletConnectedFromWebsite',
        walletData: {
          publicKey: publicKey.slice(0, 4) + '...' + publicKey.slice(-4), // Shortened for display
          fullPublicKey: publicKey,
          label: 'Phantom'
        }
      }, (response) => {
        if (response && response.success) {
          console.log('SimplYield: Successfully relayed wallet connection to extension');
        } else {
          console.error('SimplYield: Failed to relay wallet connection', response);
        }
      });
    } catch (error) {
      console.error('SimplYield: Error handling Phantom wallet', error);
    }
  }
  
  // Handle Solflare wallet connection
  function handleSolflareWallet() {
    try {
      const publicKey = window.solflare.publicKey.toString();
      console.log('SimplYield: Solflare wallet detected', publicKey);
      
      // Relay to extension
      chrome.runtime.sendMessage({
        action: 'walletConnectedFromWebsite',
        walletData: {
          publicKey: publicKey.slice(0, 4) + '...' + publicKey.slice(-4), // Shortened for display
          fullPublicKey: publicKey,
          label: 'Solflare'
        }
      });
    } catch (error) {
      console.error('SimplYield: Error handling Solflare wallet', error);
    }
  }
  
  // Handle generic Solana wallet connection
  function handleGenericSolanaWallet() {
    try {
      const publicKey = window.solana.publicKey.toString();
      console.log('SimplYield: Generic Solana wallet detected', publicKey);
      
      // Relay to extension
      chrome.runtime.sendMessage({
        action: 'walletConnectedFromWebsite',
        walletData: {
          publicKey: publicKey.slice(0, 4) + '...' + publicKey.slice(-4), // Shortened for display
          fullPublicKey: publicKey,
          label: 'Solana Wallet'
        }
      });
    } catch (error) {
      console.error('SimplYield: Error handling generic Solana wallet', error);
    }
  }
  
  // Check for connected wallets when the page loads
  setTimeout(checkForWalletConnection, 2000);
  
  // Set up interval to periodically check for wallet connections
  setInterval(checkForWalletConnection, WALLET_CONNECTION_CHECK_INTERVAL);
  
  // Listen for Solana wallet connection events if possible
  if (window.solana) {
    window.solana.on && window.solana.on('connect', () => {
      console.log('SimplYield: Solana wallet connect event detected');
      checkForWalletConnection();
    });
  }
  
  // Observe DOM changes that might indicate wallet connection (in case direct events aren't available)
  const observer = new MutationObserver(mutations => {
    // If there are significant DOM changes, check if a wallet might have connected
    checkForWalletConnection();
  });
  
  // Start observing the document body for wallet-related UI changes
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style'] // Filter to attribute changes that might indicate UI changes
  });
}

// Initialize content script
function initialize() {
  console.log('SimplYield content script initialized');
  
  // Check if we're on a Solana-related website
  const isSolanaWebsite = checkIfSolanaWebsite();
  
  if (isSolanaWebsite) {
    setupWalletConnectionListener();
  } else {
    console.log('SimplYield: Not a Solana website, wallet detection disabled');
  }
}

// Check if we're on a Solana-related website
function checkIfSolanaWebsite() {
  const solanaRelatedDomains = [
    'solana.com',
    'solflare.com',
    'phantom.app',
    'solanaspaces.com',
    'magiceden.io',
    'solsea.io',
    'solanart.io',
    'raydium.io',
    'orca.so',
    'serum-dex.com',
    'mango.markets',
    'sol.net'
    // Add more Solana-related domains as needed
  ];
  
  const currentDomain = window.location.hostname;
  
  // Check if current domain is a Solana-related domain
  for (const domain of solanaRelatedDomains) {
    if (currentDomain.includes(domain)) {
      return true;
    }
  }
  
  // Check for Solana-related tokens in the page content
  const pageContent = document.documentElement.innerHTML.toLowerCase();
  const solanaKeywords = ['solana wallet', 'connect wallet', 'phantom wallet', 'solflare', 'sol token'];
  
  for (const keyword of solanaKeywords) {
    if (pageContent.includes(keyword)) {
      return true;
    }
  }
  
  // For demo purposes, consider any website potentially Solana-related
  // In a production extension, you might want to be more selective
  return true;
}

// Initialize the content script
initialize();