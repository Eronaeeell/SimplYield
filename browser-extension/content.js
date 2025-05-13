// Content script for SimplYield Extension
// Acts as a bridge between the webpage and extension

// Debug flag
const DEBUG = true;

// Helper function for logging
function log(...args) {
  if (DEBUG) console.log('[SimplYield Content]', ...args);
}

log('Content script initialized');

// Inject injected.js into the actual page context
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

// Check for existing Phantom wallet
log('Checking for existing Phantom wallet connection');
setTimeout(() => {
  requestPhantomAddress();
}, 1000); // Slight delay to make sure page has loaded


// Wait for Phantom to be injected
window.addEventListener("DOMContentLoaded", () => {
    if (window.solana?.isPhantom) {
      window.solana.connect({ onlyIfTrusted: true }).then((res) => {
        const address = res.publicKey.toString();
        chrome.runtime.sendMessage({ type: "store_wallet", address });
      });
    }
  });
  