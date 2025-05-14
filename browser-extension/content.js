// Unified Content Script for SimplYield Extension
// Detects and interacts with Solana wallets across websites

// Configuration
const DEBUG = true;
const WALLET_CONNECTION_CHECK_INTERVAL = 5000; // Check every 5 seconds

// Helper function for logging
function log(...args) {
  if (DEBUG) console.log('[SimplYield Content]', ...args);
}

log('Content script initialized');

// Inject injected.js into the actual page context for direct wallet interaction
function injectScript() {
  log('Injecting script into page');
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = () => {
    log('Injected script loaded and will self-remove');
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

// Inject the script immediately
injectScript();

// Send message to request Phantom wallet address
function requestPhantomAddress() {
  log('Requesting Phantom address from page');
  window.postMessage({ type: 'GET_PHANTOM_ADDRESS' }, '*');
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

// Detect and handle wallet connections
function setupWalletConnectionListener() {
  log('Setting up wallet connection listener');
  
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
      log('Phantom wallet detected', publicKey);
      
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
          log('Successfully relayed wallet connection to extension');
        } else {
          log('Failed to relay wallet connection', response);
        }
      });
      
      // Also save to session storage for immediate access
      sessionStorage.setItem('phantomAddress', publicKey);
    } catch (error) {
      log('Error handling Phantom wallet', error);
    }
  }
  
  // Handle Solflare wallet connection
  function handleSolflareWallet() {
    try {
      const publicKey = window.solflare.publicKey.toString();
      log('Solflare wallet detected', publicKey);
      
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
      log('Error handling Solflare wallet', error);
    }
  }
  
  // Handle generic Solana wallet connection
  function handleGenericSolanaWallet() {
    try {
      const publicKey = window.solana.publicKey.toString();
      log('Generic Solana wallet detected', publicKey);
      
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
      log('Error handling generic Solana wallet', error);
    }
  }
  
  // Check for connected wallets when the page loads
  setTimeout(checkForWalletConnection, 2000);
  
  // Set up interval to periodically check for wallet connections
  setInterval(checkForWalletConnection, WALLET_CONNECTION_CHECK_INTERVAL);
  
  // Listen for Solana wallet connection events if possible
  if (window.solana) {
    window.solana.on && window.solana.on('connect', () => {
      log('Solana wallet connect event detected');
      checkForWalletConnection();
    });
  }
  
  // Observe DOM changes that might indicate wallet connection
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

// Listen for response from injected.js
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  // Handle announcement from injected script
  if (event.data.type === 'SIMPLYYIELD_INJECTED_READY') {
    log('Injected script is ready');
  }
  
  // Handle response from GET_PHANTOM_ADDRESS request
  else if (event.data.type === 'PHANTOM_ADDRESS_RESULT') {
    if (event.data.address) {
      log('Received Phantom address:', event.data.address);
      
      // Forward to both popup and background script
      chrome.runtime.sendMessage({
        action: 'phantomAddressDetected',
        address: event.data.address,
      });
      
      // Store in session storage for immediate access
      sessionStorage.setItem('phantomAddress', event.data.address);
    } else {
      log('Phantom address error:', event.data.error);
      chrome.runtime.sendMessage({
        action: 'phantomAddressError',
        error: event.data.error,
      });
    }
  }
  
  // Handle request to get Phantom address
  else if (event.data.type === 'REQUEST_PHANTOM_ADDRESS') {
    log('Received request to get Phantom address');
    requestPhantomAddress();
  }
});

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log('Received message from extension:', message);
  
  if (message.action === 'requestPhantomAddress') {
    requestPhantomAddress();
    sendResponse({ status: 'requested' });
  }
});

// Initialize the content script
function initialize() {
  log('SimplYield content script initialized');
  
  // Check if we're on a Solana-related website
  const isSolanaWebsite = checkIfSolanaWebsite();
  
  if (isSolanaWebsite) {
    log('Solana website detected, setting up wallet listeners');
    setupWalletConnectionListener();
    
    // Also check for Phantom wallet using DOMContentLoaded approach
    window.addEventListener("DOMContentLoaded", () => {
      if (window.solana?.isPhantom) {
        window.solana.connect({ onlyIfTrusted: true }).then((res) => {
          const address = res.publicKey.toString();
          chrome.runtime.sendMessage({ type: "store_wallet", address });
        }).catch(err => {
          log('Error connecting to trusted Phantom wallet', err);
        });
      }
    });
    
    // Check for existing Phantom wallet after a slight delay
    setTimeout(() => {
      requestPhantomAddress();
    }, 1000);
  } else {
    log('Not a Solana website, wallet detection disabled');
  }
}

function sendWalletAddressToExtension() {
    if (window.solana && window.solana.isPhantom) {
      const provider = window.solana;
  
      // Connect to Phantom and get the wallet address
      provider.request({ method: 'getAccounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            const walletAddress = accounts[0];
  
            // Send wallet address to the background script
            chrome.runtime.sendMessage({
              type: 'walletAddress',
              address: walletAddress
            });
          } else {
            console.log("No accounts found");
          }
        })
        .catch(err => {
          console.error('Error getting accounts:', err);
        });
    } else {
      console.log('Phantom wallet is not available');
    }
  }
  
  // Call the function when the page loads or after user logs in
  sendWalletAddressToExtension();

// Start the extension
initialize();