# SimplYield 🚀 - Your AI-Powered DeFi Assistant
Simplify your Solana experience with SimplYield — the next-level AI assistant that brings the world of decentralized finance (DeFi) to your fingertips. Whether you're staking SOL, tracking transactions, or monitoring your portfolio, SimplYield makes it fast, easy, and intuitive.

# 🌟 What is SimplYield?
SimplYield is an AI-powered assistant designed to simplify your DeFi experience. With its sleek web app and browser extension, you can connect your Solana wallet, manage your assets, and interact with the Solana blockchain seamlessly. No more complicated jargon or manual processes — SimplYield handles it all for you.
# Key features include:
💰 Stake / Unstake by AI Prompt

🤖 Ask general questions or around Web3 

⚡ Receive DeFi strats suggestion around staking and yielding 

🚀 Features
🔗 Solana Wallet Support (Phantom, Solflare, etc.)

🕊️ Send SOLANA to your lovely fellows

# 🚀 Getting Started with SimplYield
Dependencies: What You'll Need
* Node.js (version >= 18) — for running the app.
* npm or yarn — package managers to install dependencies.
* A Solana Wallet (like Phantom or Solflare) — to manage your assets.
* OpenRouter API Key — for enabling the AI chat functionality.

# Installing SimplYield
1.  Clone the repository:

    ```bash
    git clone https://github.com/Eronaeeell/SimplYield
    cd SimplYield
    ```

2.  Install dependencies:

    ```bash
    npm install  --legacy-peer-deps # or yarn install
    ```

3. Set up environment variables:
   (Create a .env.local file in the root directory -- Add your OpenRouter API key:)

    ```bash
    OPENROUTER_API_KEY=<your_openrouter_api_key>
    ```

4. Launch the app:

    ```bash
    npm run dev # or yarn dev
    ```
  (Open your browser and head to http://localhost:3000 to see it in action.)

# Using SimplYield
Once you’ve installed everything, here’s how to interact with the assistant:

1. Connect your Solana wallet (click "Connect Wallet").
   notes : set Wallet into DEVNET
   
2. Chat with the AI assistant — ask anything about your assets, transactions, or staking.

   If you wish to ***STAKE > SOL, mSOL , bSOL*** , prompt this
   ```bash
   Stake { amount } to sol      (native)       --SOL
   Stake { amount } sol to mSOL (liquid)       --mSOL
   Stake { amount } sol to bSOL (liquid)       --bSOL
   ```
   After check you can your Wallet , if you are using
   - _Solflare_ , check at STAKING part for NATIVE SOL and for LIQUID ( mSOL/bSOL ) , its on the main page
   - _Phantom_  , Go through the Solana and press it , there will be a page for the STAKING NATIVE , meanwhile for the LIQUID will showed up in the main page with the code bS01 ( bSOL )and mS0l ( mSOL )
   
   If you wish to ***UNSTAKE > SOL, mSOL , bSOL*** , prompt this 
   ```bash
   *SOL /step by step
   Unstake
   
   > Bot will reply with active accounts per number
   e.g.
   1. 1.0 SOL > 7gy7..019e
   2. 2.0 SOL > Gf8s..2eh7
   
   Unstake { number }
   ```
   
   ```bash
   *mSOL /step by step
   Unstake mSOL
   
   > Bot will reply with amount of mSOL stake available
   e.g. mSOL available 3.19 mSOL
   
   Unstake { amount } mSOL
   ```
   
   ```bash
   *bSOL /step by step
   Unstake bSOL
   
   > Bot will reply with amount of mSOL stake available
   e.g. bSOL available 4.49 bSOL
   
   Unstake { amount } bSOL
   ```

   All the UNSTAKE can be found in the smae place on when STAKE

   If you wish to _**SEND TRANSACTION **_, prompt this

   ```bash
   *Send Transaction

   Send { amount } to 78gf71jo083ndbfi22f234we
   
   
4. Track your portfolio — see your balances and staking status.

# 💡 Help & Troubleshooting
Common Issues:
* Wallet Connection: Make sure your Solana wallet (e.g., Phantom) is properly set up and connected. Refresh the page if the connection is lost.
* AI Chat Not Responding: Check that your OpenRouter API key is correctly added in the .env.local file. Without the key, the chat functionality won't work.
* If the chatbot respond with **ERROR : {OBJECT ; object }**__ , try to prompt it 1 more time

# 👨‍💻 Authors
* Twitter: @SimplYield
* GitHub: @SimplYield
