let publicKey = null;
let lastSignature = null;

async function checkForNewTransactions() {
  if (!publicKey) return;

  const response = await fetch("https://api.mainnet-beta.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getSignaturesForAddress",
      params: [publicKey, { limit: 1 }]
    }),
  });

  const data = await response.json();
  const latest = data.result?.[0];

  if (latest && latest.signature !== lastSignature) {
    lastSignature = latest.signature;

    chrome.storage.local.set({ lastTxnSig: lastSignature });
    chrome.notifications.create("txnDetected", {
      type: "basic",
      iconUrl: "icon.png",
      title: "New Transaction Detected!",
      message: "Click to view it on SimplYield.",
      priority: 2
    });
  }
}

// Notification click
chrome.notifications.onClicked.addListener((id) => {
  if (id === "txnDetected") {
    chrome.storage.local.get("lastTxnSig", (data) => {
      const url = `https://simplyield.vercel.app/transaction/${data.lastTxnSig}`;
      chrome.tabs.create({ url });
    });
  }
});

// Listen for wallet address from content.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SET_PUBLIC_KEY") {
    publicKey = msg.publicKey;
    lastSignature = null;
    setInterval(checkForNewTransactions, 10000); // every 10 sec
    sendResponse({ status: "watching" });
  }
});
