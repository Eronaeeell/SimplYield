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
  const connectWalletBtn = document.getElementById('connect-wallet-btn');
  const walletIdElement = document.getElementById('wallet-id');
  const walletStatusContainer = document.querySelector('.wallet-status');
  const connectWalletContainer = document.querySelector('.connect-wallet');

  // State variables
  let selectedPercentage = 50;
  let currentTransaction = null;
  let walletConnected = false;
  let walletAddress = null;

  // Initialize UI when popup loads
  initializeUI();

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'newTransaction') {
      processIncomingTransaction(request.transaction);
    } else if (request.action === 'updateWalletStatus') {
      updateWalletStatus(request.walletAddress);
    }

    return true; // keep message channel open
  });

  // ========== Initialization ==========
  function initializeUI() {
    checkWalletStatus();

    // For demo purpose, simulate transaction sometimes
    if (Math.random() > 0.5 && walletConnected) {
      simulateNewTransaction();
    }
  }

  function checkWalletStatus() {
    chrome.storage.local.get(['walletConnected', 'walletAddress'], function (result) {
      if (result.walletConnected && result.walletAddress) {
        updateWalletStatus(result.walletAddress);
      }
    });
  }

  function updateWalletStatus(address) {
    if (!address) return;

    walletConnected = true;
    walletAddress = address;

    const formatted = `${address.slice(0, 4)}...${address.slice(-4)}`;
    walletIdElement.textContent = formatted;
    walletStatusContainer.querySelector('.status-indicator').style.backgroundColor = 'var(--success-color)';
    connectWalletContainer.classList.add('hidden');
  }

  // ========== Event Listeners ==========
  connectWalletBtn.addEventListener('click', function () {
    chrome.tabs.create({ url: 'http://simpl-yield.vercel.app' });
  });

  percentageButtons.forEach(button => {
    button.addEventListener('click', function () {
      const percentage = parseInt(this.dataset.percentage);
      selectedPercentage = percentage;

      percentageButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      customPercentage.value = percentage;
      percentageValue.textContent = percentage;
    });
  });

  customPercentage.addEventListener('input', function () {
    const percentage = parseInt(this.value);
    selectedPercentage = percentage;
    percentageValue.textContent = percentage;

    percentageButtons.forEach(btn => btn.classList.remove('active'));
    percentageButtons.forEach(btn => {
      if (parseInt(btn.dataset.percentage) === percentage) {
        btn.classList.add('active');
      }
    });
  });

  stakeNowBtn.addEventListener('click', function () {
    if (!currentTransaction) return;

    const stakeAmount = (currentTransaction.amount * (selectedPercentage / 100)).toFixed(2);

    chrome.runtime.sendMessage({
      action: 'stake',
      amount: stakeAmount,
      token: currentTransaction.token
    });

    showNotification(`Successfully staked ${stakeAmount} ${currentTransaction.token}!`);
    hideTransactionAlert();
  });

  skipBtn.addEventListener('click', function () {
    hideTransactionAlert();
  });

  commandButtons.forEach(button => {
    button.addEventListener('click', function () {
      const command = this.textContent.trim();
      processCommand(command);
    });
  });

  // ========== Core Functions ==========
  function processIncomingTransaction(transaction) {
    mainView.classList.add('hidden');
    transactionAlert.classList.remove('hidden');

    amountElement.textContent = transaction.amount;
    tokenElement.textContent = transaction.token;
    currentTransaction = transaction;

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'New Transaction Detected',
      message: `You received ${transaction.amount} ${transaction.token}. Would you like to stake it?`,
      priority: 2
    });
  }

  function simulateNewTransaction() {
    mainView.classList.add('hidden');
    transactionAlert.classList.remove('hidden');

    const amount = (Math.random() * 9.9 + 0.1).toFixed(2);
    const token = 'SOL';

    amountElement.textContent = amount;
    tokenElement.textContent = token;

    currentTransaction = {
      amount: parseFloat(amount),
      token: token,
      timestamp: new Date()
    };
  }

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

  function simulateStake(amount) {
    console.log(`Simulating staking ${amount} SOL`);
    showNotification(`Successfully staked ${amount} SOL!`);
  }

  function showNotification(message) {
    console.log(`Notification: ${message}`);
    alert(message);
  }

  chrome.storage.local.get(['walletAddress'], function(result) {
    const walletAddressElement = document.getElementById('walletAddress');
  
    if (result.walletAddress) {
      walletAddressElement.textContent = result.walletAddress;
    } else {
      walletAddressElement.textContent = 'No wallet connected';
    }
  });
});
