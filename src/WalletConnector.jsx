import { useEffect } from "react";

function WalletConnector() {
  useEffect(() => {
    const connectWallet = async () => {
      if (window.solana?.isPhantom) {
        try {
          const res = await window.solana.connect();
          const pubKey = res.publicKey.toString();

          // Send wallet address to extension via window.postMessage
          window.postMessage({
            source: "SimplYield",
            type: "PHANTOM_CONNECTED",
            publicKey: pubKey
          }, "*");

          console.log("Phantom wallet connected:", pubKey);
        } catch (err) {
          console.error("Phantom connection failed:", err);
        }
      } else {
        alert("Phantom wallet not found");
      }
    };

    connectWallet();
  }, []);

  return (
    <div>
      <h2>Connecting to Phantom...</h2>
    </div>
  );
}

export default WalletConnector;
