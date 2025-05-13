<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', function () {
  // Elements
  const transactionAlert = document.getElementById('transaction-alert');
  const mainView = document.getElementById('main-view');
  const amountElement = document.getElementById('amount');
  const tokenElement = document.getElementById('token');
  const percentageValue = document.getElementById('percentage-value');
  const customPercentage = document.getElementById('custom-percentage');
  const percentageButtons = document.querySelectorAll('.percentage-btn');
  const stakeNowBtn = document.getElementById('stake-now');
  const skipBtn = document.getElementById('skip');
  const commandButtons = document.querySelectorAll('.command-btn');
  const walletStatusElement = document.querySelector('.wallet-status');
  const walletIdElement = document.querySelector('.wallet-id');
  const statusIndicator = document.querySelector('.status-indicator');
=======
document.addEventListener("DOMContentLoaded", function () {
  // Listen for transaction events from background script
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.action === "newTransaction") {
      // Process incoming transaction
      processIncomingTransaction(request.transaction);
    }

    // Initialize when DOM is loaded
    initializeUI();
  });

  // Elements
  const transactionAlert = document.getElementById("transaction-alert");
  const mainView = document.getElementById("main-view");
  const amountElement = document.getElementById("amount");
  const tokenElement = document.getElementById("token");
  const percentageValue = document.getElementById("percentage-value");
  const customPercentage = document.getElementById("custom-percentage");
  const percentageButtons = document.querySelectorAll(".percentage-btn");
  const stakeNowBtn = document.getElementById("stake-now");
  const skipBtn = document.getElementById("skip");
  const commandButtons = document.querySelectorAll(".command-btn");
>>>>>>> f39d2238f9b291124c09477e2bcc51ba72d204bc

  // Set default state
  let selectedPercentage = 50;
  let currentTransaction = null;
<<<<<<< HEAD
  let connectedWallet = null;
  let walletConnectedFromWebsite = false;

  // Initialize the popup
  function initialize() {
    // Check if wallet is connected when popup opens
    chrome.runtime.sendMessage({ action: 'popupOpened' }, function(response) {
      if (response && response.walletConnected) {
        connectedWallet = response.wallet;
        walletConnectedFromWebsite = response.walletConnectedFromWebsite;
        updateWalletDisplay();
        
        // For demo purpose, sometimes show transaction alert when popup opens
        if (Math.random() > 0.7) {
          simulateNewTransaction();
        }
      } else {
        // No wallet connected, update UI accordingly
        updateWalletDisplay(false);
      }
    });
    
    // Listen for messages from background script
    setupMessageListeners();
  }

  // Listen for messages from background script
  function setupMessageListeners() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.action === 'newTransaction') {
        // Process incoming transaction
        processIncomingTransaction(request.transaction);
      } else if (request.action === 'walletConnected') {
        // Update wallet connection status
        connectedWallet = request.wallet;
        walletConnectedFromWebsite = true;
        updateWalletDisplay();
      } else if (request.action === 'walletDisconnected') {
        // Update wallet connection status
        connectedWallet = null;
        walletConnectedFromWebsite = false;
        updateWalletDisplay(false);
      }
    });
  }

  // Update wallet display based on connection status
  function updateWalletDisplay(isConnected = true) {
    if (isConnected && connectedWallet) {
      walletIdElement.textContent = connectedWallet.publicKey || 'Connected';
      statusIndicator.style.backgroundColor = '#4CAF50'; // Green for connected
      
      // Add connected class to wallet status
      walletStatusElement.classList.add('connected');
      walletStatusElement.classList.remove('disconnected');
      
      // Add custom attribute for styling
      walletStatusElement.setAttribute('data-connection-source', 
        walletConnectedFromWebsite ? 'website' : 'extension');
    } else {
      walletIdElement.textContent = 'Not Connected';
      statusIndicator.style.backgroundColor = '#F44336'; // Red for disconnected
      
      // Add disconnected class to wallet status
      walletStatusElement.classList.add('disconnected');
      walletStatusElement.classList.remove('connected');
      
      // Remove custom attribute
      walletStatusElement.removeAttribute('data-connection-source');
    }
  }

  // Process real incoming transaction from the blockchain
  function processIncomingTransaction(transaction) {
    // Hide main view and show transaction alert
    mainView.classList.add('hidden');
    transactionAlert.classList.remove('hidden');

    // Update UI with transaction details
    amountElement.textContent = transaction.amount;
    tokenElement.textContent = transaction.token;

    // Store current transaction details
    currentTransaction = transaction;
  }

  // Simulate new transaction for demonstration
  function simulateNewTransaction() {
    // Hide main view and show transaction alert
    mainView.classList.add('hidden');
    transactionAlert.classList.remove('hidden');

    // Random transaction amount between 0.1 and 10 SOL
    const amount = (Math.random() * 9.9 + 0.1).toFixed(2);
    const token = 'SOL';
=======

  // Initialize UI
  function initializeUI() {
    // For demo purpose, sometimes show transaction alert when popup opens
    if (Math.random() > 0.5) {
      simulateNewTransaction();
    }
  }

  // Process real incoming transaction from the blockchain
  function processIncomingTransaction(transaction) {
    // Hide main view and show transaction alert
    mainView.classList.add("hidden");
    transactionAlert.classList.remove("hidden");

    // Update UI with transaction details
    amountElement.textContent = transaction.amount;
    tokenElement.textContent = transaction.token;

    // Store current transaction details
    currentTransaction = transaction;

    // Show browser notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "New Transaction Detected",
      message: `You received ${transaction.amount} ${transaction.token}. Would you like to stake it?`,
      priority: 2,
    });
  }

  // Simulate new transaction for demonstration
  function simulateNewTransaction() {
    // Hide main view and show transaction alert
    mainView.classList.add("hidden");
    transactionAlert.classList.remove("hidden");

    // Random transaction amount between 0.1 and 10 SOL
    const amount = (Math.random() * 9.9 + 0.1).toFixed(2);
    const token = "SOL";
>>>>>>> f39d2238f9b291124c09477e2bcc51ba72d204bc

    // Update UI
    amountElement.textContent = amount;
    tokenElement.textContent = token;

    // Store current transaction details
    currentTransaction = {
      amount: parseFloat(amount),
      token: token,
<<<<<<< HEAD
      timestamp: new Date()
=======
      timestamp: new Date(),
>>>>>>> f39d2238f9b291124c09477e2bcc51ba72d204bc
    };
  }

  // Handle percentage button clicks
<<<<<<< HEAD
  percentageButtons.forEach(button => {
    button.addEventListener('click', function () {
=======
  percentageButtons.forEach((button) => {
    button.addEventListener("click", function () {
>>>>>>> f39d2238f9b291124c09477e2bcc51ba72d204bc
      const percentage = parseInt(this.dataset.percentage);

      // Update selected percentage
      selectedPercentage = percentage;

      // Update UI
<<<<<<< HEAD
      percentageButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
=======
      percentageButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
>>>>>>> f39d2238f9b291124c09477e2bcc51ba72d204bc

      // Update slider
      customPercentage.value = percentage;
      percentageValue.textContent = percentage;
    });
  });

  // Handle custom percentage input
<<<<<<< HEAD
  customPercentage.addEventListener('input', function () {
=======
  customPercentage.addEventListener("input", function () {
>>>>>>> f39d2238f9b291124c09477e2bcc51ba72d204bc
    const percentage = parseInt(this.value);

    // Update selected percentage
    selectedPercentage = percentage;

    // Update UI
    percentageValue.textContent = percentage;

    // Remove active class from all percentage buttons
<<<<<<< HEAD
    percentageButtons.forEach(btn => btn.classList.remove('active'));

    // Add active class to matching percentage button, if any
    percentageButtons.forEach(btn => {
      if (parseInt(btn.dataset.percentage) === percentage) {
        btn.classList.add('active');
      }
    });
  });

  // Handle stake now button
  stakeNowBtn.addEventListener('click', function () {
    if (!currentTransaction) return;

    // Calculate stake amount
    const stakeAmount = (currentTransaction.amount * (selectedPercentage / 100)).toFixed(2);

    // Send message to background script to process staking
    chrome.runtime.sendMessage({
      action: 'stake',
      amount: stakeAmount,
      token: currentTransaction.token
    });

    // Show success notification
    showNotification(`Successfully staked ${stakeAmount} ${currentTransaction.token}!`);

    // Reset UI
    hideTransactionAlert();
  });

  // Handle skip button
  skipBtn.addEventListener('click', function () {
    hideTransactionAlert();
  });

  // Handle wallet click for connection options
  walletStatusElement.addEventListener('click', function() {
    if (!connectedWallet) {
      // Show wallet connection options
      showWalletConnectionOptions();
    } else {
      // Show wallet details/disconnect options
      showWalletDetails();
=======
    percentageButtons.forEach((btn) => btn.classList.remove("active"));

    // Add active class to matching percentage button, if any
    percentageButtons.forEach((btn) => {
      if (parseInt(btn.dataset.percentage) === percentage) {
        btn.classList.add("active");
      }
    });
  });

  // Handle stake now button
  stakeNowBtn.addEventListener("click", function () {
    if (!currentTransaction) return;

    // Calculate stake amount
    const stakeAmount = (
      currentTransaction.amount *
      (selectedPercentage / 100)
    ).toFixed(2);

    // Send message to background script to process staking
    chrome.runtime.sendMessage({
      action: "stake",
      amount: stakeAmount,
      token: currentTransaction.token,
    });

    // Show success notification
    showNotification(
      `Successfully staked ${stakeAmount} ${currentTransaction.token}!`
    );

    // Reset UI
    hideTransactionAlert();
  });

  // Handle skip button
  skipBtn.addEventListener("click", function () {
    hideTransactionAlert();
  });

  // Handle command buttons
  commandButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const command = this.textContent.trim();
      processCommand(command);
    });
  });

  // Process commands
  function processCommand(command) {
    console.log(`Processing command: ${command}`);

    if (command.includes("Stake")) {
      const amount = command.match(/\d+(\.\d+)?/);
      if (amount) {
        simulateStake(parseFloat(amount[0]));
      }
    } else if (command.toLowerCase().includes("portfolio")) {
      console.log("Show portfolio command processed");
    } else if (command.includes("Swap")) {
      console.log("Swap command processed");
    } else if (command.toLowerCase().includes("balance")) {
      console.log("Balance check command processed");
    }
  }

  // Simulate staking
  function simulateStake(amount) {
    console.log(`Simulating staking ${amount} SOL`);
    showNotification(`Successfully staked ${amount} SOL!`);
  }

  // Show notification
  function showNotification(message) {
    console.log(`Notification: ${message}`);
    alert(message);
  }

  // Hide transaction alert and show main view
  function hideTransactionAlert() {
    transactionAlert.classList.add("hidden");
    mainView.classList.remove("hidden");
    currentTransaction = null;

    selectedPercentage = 50;
    customPercentage.value = 50;
    percentageValue.textContent = 50;
    percentageButtons.forEach((btn) => btn.classList.remove("active"));

    percentageButtons.forEach((btn) => {
      if (parseInt(btn.dataset.percentage) === 50) {
        btn.classList.add("active");
      }
    });
  }

  let walletAddress = null;

  document.addEventListener("DOMContentLoaded", async function () {
    const connectView = document.getElementById("connect-view");
    const mainView = document.getElementById("main-view");
    const walletId = document.querySelector(".wallet-id");
    const connectBtn = document.getElementById("connect-wallet");

    async function checkWalletConnection() {
      try {
        const resp = await window.solana.connect({ onlyIfTrusted: true });
        walletAddress = resp.publicKey.toString();
        walletId.textContent = formatWalletAddress(walletAddress);
        showMainView();
      } catch (err) {
        showConnectView();
      }
    }

    connectBtn.addEventListener("click", async () => {
      try {
        const resp = await window.solana.connect();
        walletAddress = resp.publicKey.toString();
        walletId.textContent = formatWalletAddress(walletAddress);
        showMainView();
      } catch (err) {
        console.error("User rejected wallet connection.");
      }
    });

    function formatWalletAddress(addr) {
      return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    }

    function showConnectView() {
      connectView.classList.remove("hidden");
      mainView.classList.add("hidden");
    }

    function showMainView() {
      connectView.classList.add("hidden");
      mainView.classList.remove("hidden");
>>>>>>> f39d2238f9b291124c09477e2bcc51ba72d204bc
    }

    // Listen for disconnect event
    window.solana.on("disconnect", () => {
      showConnectView();
    });

    // Initial check
    checkWalletConnection();
  });
<<<<<<< HEAD

  // Show wallet connection options
  function showWalletConnectionOptions() {
    // In a real implementation, this would show a modal with connection options
    // For now, just show an alert
    alert('Wallet will be automatically connected from the website.\n\nPlease connect your wallet on a Solana website first.');
  }

  // Show wallet details and option to disconnect
  function showWalletDetails() {
    // In a real implementation, this would show a modal with wallet details
    // For now, just show a confirm dialog
    const shouldDisconnect = confirm(`Connected wallet: ${connectedWallet.publicKey}\n\nDisconnect wallet?`);
    
    if (shouldDisconnect) {
      // Send message to background script to disconnect wallet
      chrome.runtime.sendMessage({ action: 'disconnectWallet' });
    }
  }

  // Handle command buttons
  commandButtons.forEach(button => {
    button.addEventListener('click', function () {
      const command = this.textContent.trim();
      processCommand(command);
    });
  });

  // Process commands
  function processCommand(command) {
    console.log(`Processing command: ${command}`);

    if (command.includes('Stake')) {
      const amount = command.match(/\d+(\.\d+)?/);
      if (amount) {
        simulateStake(parseFloat(amount[0]));
      }
    } else if (command.toLowerCase().includes('portfolio')) {
      console.log('Show portfolio command processed');
    } else if (command.includes('Swap')) {
      console.log('Swap command processed');
    } else if (command.toLowerCase().includes('balance')) {
      console.log('Balance check command processed');
    }
  }

  // Simulate staking
  function simulateStake(amount) {
    console.log(`Simulating staking ${amount} SOL`);
    showNotification(`Successfully staked ${amount} SOL!`);
  }

  // Show notification
  function showNotification(message) {
    console.log(`Notification: ${message}`);
    // In a real implementation, this would show a toast notification
    // For now, just use alert
    alert(message);
  }

  // Hide transaction alert and show main view
  function hideTransactionAlert() {
    transactionAlert.classList.add('hidden');
    mainView.classList.remove('hidden');
    currentTransaction = null;

    selectedPercentage = 50;
    customPercentage.value = 50;
    percentageValue.textContent = 50;
    percentageButtons.forEach(btn => btn.classList.remove('active'));

    percentageButtons.forEach(btn => {
      if (parseInt(btn.dataset.percentage) === 50) {
        btn.classList.add('active');
      }
    });
  }

    
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
if (connectWalletBtn) {
  connectWalletBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: "https://simpl-yield.vercel.app/" }); // Replace with your deployed URL if needed
  });
}
  
document.getElementById('connect-wallet-btn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      window.postMessage({ type: 'REQUEST_PHANTOM_ADDRESS' }, '*');
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'phantomAddressDetected') {
      const walletAddress = message.address;
      console.log('Wallet from content script:', walletAddress);
  
      // Update popup display if needed
      const walletId = document.querySelector('.wallet-id');
      const statusIndicator = document.querySelector('.status-indicator');
      const walletStatus = document.querySelector('.wallet-status');
  
      walletId.textContent = walletAddress;
      statusIndicator.style.backgroundColor = '#4CAF50';
      walletStatus.classList.add('connected');
      walletStatus.classList.remove('disconnected');
    }
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'phantomAddressDetected') {
      const walletId = document.querySelector('.wallet-id');
      const statusIndicator = document.querySelector('.status-indicator');
      const walletStatus = document.querySelector('.wallet-status');
  
      walletId.textContent = message.address;
      statusIndicator.style.backgroundColor = '#4CAF50';
      walletStatus.classList.add('connected');
      walletStatus.classList.remove('disconnected');
    }
  });
  
  chrome.storage.local.get("walletAddress", (result) => {
    const addr = result.walletAddress;
    document.getElementById("wallet-address").innerText = addr
      ? "Wallet: " + addr
      : "Not connected";
  });
  
  document.addEventListener("DOMContentLoaded", async () => {
    const connectWalletBtn = document.getElementById("connect-wallet-btn");
    const walletIdSpan = document.getElementById("wallet-id");
  
    // Check if Phantom is installed
    const isPhantomInstalled = window?.solana?.isPhantom;
  
    if (!isPhantomInstalled) {
      walletIdSpan.textContent = "Phantom Not Installed";
      connectWalletBtn.disabled = true;
      return;
    }
  
    // Function to shorten wallet address (e.g., 8xzt...cs7S)
    const shortenAddress = (address) => {
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };
  
    // Connect to Phantom
    connectWalletBtn.addEventListener("click", async () => {
      try {
        const resp = await window.solana.connect(); // Triggers Phantom popup
        const publicKey = resp.publicKey.toString();
        walletIdSpan.textContent = shortenAddress(publicKey);
      } catch (err) {
        console.error("Wallet connection failed:", err);
        walletIdSpan.textContent = "Connection Failed";
      }
    });
  
    // Auto-detect if already connected (e.g., page reload)
    if (window.solana.isConnected) {
      const publicKey = window.solana.publicKey.toString();
      walletIdSpan.textContent = shortenAddress(publicKey);
    }
  });
  


 });
  // Initialize the popup
  initialize();
});
=======
});
>>>>>>> f39d2238f9b291124c09477e2bcc51ba72d204bc
