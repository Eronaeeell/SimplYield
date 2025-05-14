
// Function to notify the extension about wallet connection
function notifyExtension(walletAddress) {
    // Method 1: Create and dispatch a custom event
    const walletEvent = new CustomEvent('walletConnected', {
      detail: {
        walletAddress: walletAddress
      }
    });
    document.dispatchEvent(walletEvent);
    
    // Method 2: Use postMessage for broader compatibility
    window.postMessage({
      type: 'WALLET_CONNECTED',
      walletAddress: walletAddress
    }, 'http://simpl-yield.vercel.app');
  }
  
  // Example of how to use this after connecting to Phantom Wallet
  async function connectPhantomWallet() {
    try {
      // Check if Phantom is installed
      const isPhantomInstalled = window.phantom?.solana?.isPhantom;
      
      if (isPhantomInstalled) {
        // Connect to Phantom wallet
        const connection = await window.phantom.solana.connect();
        const walletAddress = connection.publicKey.toString();
        
        console.log('Connected to wallet:', walletAddress);
        
        // Notify our extension
        notifyExtension(walletAddress);
        
        return walletAddress;
      } else {
        console.error('Phantom wallet is not installed');
        return null;
      }
    } catch (error) {
      console.error('Error connecting to Phantom wallet:', error);
      return null;
    }
  }
  
  // Example button click handler
  document.addEventListener('DOMContentLoaded', function() {
    const connectButton = document.getElementById('connect-wallet-button');
    
    if (connectButton) {
      connectButton.addEventListener('click', async function() {
        const walletAddress = await connectPhantomWallet();
        
        if (walletAddress) {
          // Update UI to show connected wallet
          document.querySelector('.wallet-address').textContent = walletAddress;
        }
      });
    }
    
    // Check if wallet is already connected on page load
    const isConnected = window.phantom?.solana?.isConnected;
    
    if (isConnected) {
      const publicKey = window.phantom.solana.publicKey.toString();
      notifyExtension(publicKey);
    }
  });