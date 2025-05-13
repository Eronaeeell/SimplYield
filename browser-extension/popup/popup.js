document.addEventListener('DOMContentLoaded', function () {
  // Listen for transaction events from background script
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'newTransaction') {
      // Process incoming transaction
      processIncomingTransaction(request.transaction);
    }
  });

  // Initialize UI after setting up listeners
  initializeUI();

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

  // Set default state
  let selectedPercentage = 50;
  let currentTransaction = null;

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
    mainView.classList.add('hidden');
    transactionAlert.classList.remove('hidden');

    // Update UI with transaction details
    amountElement.textContent = transaction.amount;
    tokenElement.textContent = transaction.token;

    // Store current transaction details
    currentTransaction = transaction;

    // Show browser notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'New Transaction Detected',
      message: `You received ${transaction.amount} ${transaction.token}. Would you like to stake it?`,
      priority: 2
    });
  }

  // Simulate new transaction for demonstration
  function simulateNewTransaction() {
    // Hide main view and show transaction alert
    mainView.classList.add('hidden');
    transactionAlert.classList.remove('hidden');

    // Random transaction amount between 0.1 and 10 SOL
    const amount = (Math.random() * 9.9 + 0.1).toFixed(2);
    const token = 'SOL';

    // Update UI
    amountElement.textContent = amount;
    tokenElement.textContent = token;

    // Store current transaction details
    currentTransaction = {
      amount: parseFloat(amount),
      token: token,
      timestamp: new Date()
    };
  }

  // Handle percentage button clicks
  percentageButtons.forEach(button => {
    button.addEventListener('click', function () {
      const percentage = parseInt(this.dataset.percentage);

      // Update selected percentage
      selectedPercentage = percentage;

      // Update UI
      percentageButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      customPercentage.value = percentage;
      percentageValue.textContent = percentage;
    });
  });

  // Handle custom percentage input
  customPercentage.addEventListener('input', function () {
    const percentage = parseInt(this.value);

    selectedPercentage = percentage;
    percentageValue.textContent = percentage;

    // Remove active state from buttons
    percentageButtons.forEach(btn => btn.classList.remove('active'));

    // Highlight matching button if exists
    percentageButtons.forEach(btn => {
      if (parseInt(btn.dataset.percentage) === percentage) {
        btn.classList.add('active');
      }
    });
  });

  // Handle stake now button
  stakeNowBtn.addEventListener('click', function () {
    if (!currentTransaction) return;

    const stakeAmount = (currentTransaction.amount * (selectedPercentage / 100)).toFixed(2);

    // Send to background for processing
    chrome.runtime.sendMessage({
      action: 'stake',
      amount: stakeAmount,
      token: currentTransaction.token
    });

    showNotification(`Successfully staked ${stakeAmount} ${currentTransaction.token}!`);

    hideTransactionAlert();
  });

  // Handle skip button
  skipBtn.addEventListener('click', function () {
    hideTransactionAlert();
  });

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
});
