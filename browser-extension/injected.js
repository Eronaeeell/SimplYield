// This script is injected into the page content to interact with the Phantom wallet API
(function() {
    // Debug flag
    const DEBUG = true;
    
    // Helper function for logging
    function log(...args) {
      if (DEBUG) console.log('[SimplYield Injected]', ...args);
    }
    
    log('Script initialized and waiting for messages');
    
    // Listen for message from content script
    window.addEventListener('message', async (event) => {
      if (event.source !== window) return;
      
      if (event.data.type === 'GET_PHANTOM_ADDRESS') {
        log('Received request for Phantom address');
        
        try {
          // Check if Phantom wallet is available
          if (!window.solana) {
            log('Phantom not found: window.solana is undefined');
            window.postMessage({
              type: 'PHANTOM_ADDRESS_RESULT',
              error: 'Phantom wallet not detected on this page'
            }, '*');
            return;
          }
          
          if (!window.solana.isPhantom) {
            log('Detected wallet is not Phantom');
            window.postMessage({
              type: 'PHANTOM_ADDRESS_RESULT',
              error: 'Detected wallet is not Phantom'
            }, '*');
            return;
          }
          
          log('Phantom wallet detected', window.solana);
          
          // Check if already connected
          const isConnected = window.solana.isConnected;
          log('Wallet connection status:', isConnected);
          
          if (!isConnected) {
            // Connect to wallet if not already connected
            log('Attempting to connect to wallet...');
            try {
              await window.solana.connect();
              log('Connection successful');
            } catch (connErr) {
              log('Connection failed:', connErr);
              window.postMessage({
                type: 'PHANTOM_ADDRESS_RESULT',
                error: 'User rejected connection or Phantom not trusted: ' + connErr.message
              }, '*');
              return;
            }
          }
          
          // Get address from connected wallet
          if (!window.solana.publicKey) {
            log('No public key available after connection');
            window.postMessage({
              type: 'PHANTOM_ADDRESS_RESULT',
              error: 'No public key available after connection'
            }, '*');
            return;
          }
          
          const address = window.solana.publicKey.toString();
          log('Got wallet address:', address);
          
          // Send address back to content script
          window.postMessage({
            type: 'PHANTOM_ADDRESS_RESULT',
            address: address,
          }, '*');
          
        } catch (err) {
          // Handle unexpected errors
          log('Unexpected error:', err);
          window.postMessage({
            type: 'PHANTOM_ADDRESS_RESULT',
            error: 'Error connecting to Phantom: ' + err.message,
          }, '*');
        }
      }
    });
    
    // Announce that the script is ready
    window.postMessage({
      type: 'SIMPLYYIELD_INJECTED_READY'
    }, '*');
  })();