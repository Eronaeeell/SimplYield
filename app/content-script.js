console.log("SimplYield Extension Content Script loaded");

// Listen for wallet connection events on the page
document.addEventListener('walletConnected', function(event) {
  if (event.detail && event.detail.walletAddress) {
    // Forward the wallet address to our extension background script
    chrome.runtime.sendMessage({
      action: 'walletConnected',
      walletAddress: event.detail.walletAddress
    });
  }
});

// Set up a listener for mutations to detect wallet connection through DOM changes
const observer = new MutationObserver(function(mutations) {
  // This is a simplified approach. In practice, you would look for specific DOM elements
  // that indicate a wallet connection on the SimplYield website
  const walletElements = document.querySelectorAll('.wallet-address, .connected-wallet');
  
  walletElements.forEach(element => {
    const walletAddress = element.textContent.trim();
    if (walletAddress && walletAddress.length > 30) { // Simple check for address-like string
      chrome.runtime.sendMessage({
        action: 'walletConnected',
        walletAddress: walletAddress
      });
    }
  });
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

// Alternative approach: Listen for messages explicitly sent from website
window.addEventListener('message', function(event) {
  // Only accept messages from our target origin
  if (event.origin !== 'http://simpl-yield.vercel.app') return;
  
  if (event.data && event.data.type === 'WALLET_CONNECTED' && event.data.walletAddress) {
    chrome.runtime.sendMessage({
      action: 'walletConnected',
      walletAddress: event.data.walletAddress
    });
  }
});