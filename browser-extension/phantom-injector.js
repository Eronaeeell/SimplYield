(async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect();
        alert(`Connected wallet: ${resp.publicKey.toString()}`);
      } catch (err) {
        alert('Connection to Phantom was rejected.');
      }
    } else {
      alert('Phantom wallet not found. Please install it from https://phantom.app');
    }
  })();
  