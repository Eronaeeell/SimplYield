// Listen for messages from your website
window.addEventListener("message", (event) => {
    if (event.source !== window) return;
  
    if (event.data.type === "PHANTOM_CONNECTED" && event.data.source === "SimplYield") {
      chrome.runtime.sendMessage({
        type: "SET_PUBLIC_KEY",
        publicKey: event.data.publicKey
      });
    }
  });
  