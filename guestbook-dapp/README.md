# Getting Started with Guestbook dApp on Base + OnchainKit

This is a simple Guestbook decentralized app (dApp) built on the Base testnet using OnchainKit and Foundry. The dApp implements basic CRUD operations — users can create, read, update, and delete messages onchain.

This guide walks through how I set it up, what worked, and what's left to fix.

**Note:** The website is still under development and is currently running on localhost. I am working through deployment issues with Vercel/Netlify, and will share the live link once resolved.

## What You'll Learn

- How to scaffold a Base onchain app with OnchainKit
- How to set up and deploy a Guestbook smart contract using Foundry
- How to interact with the Guestbook contract using CLI and frontend
- Deployment tips and lessons learned

## Step-by-Step Walkthrough

### 1. Scaffold Project with OnchainKit

```bash
npm create onchain@latest
```

Follow the prompts, optionally input a CDP API key.

After setup:

```bash
cd guestbook-app
npm install
npm run dev
```

Your frontend will be running locally at http://localhost:3000.

### 2. Set Up Smart Contract Environment (Foundry)

In the contracts/ folder:

```bash
mkdir contracts && cd contracts
```

Install Foundry:

```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
```

Verify installation:

```bash
forge --version
```

Initialize the project:

```bash
forge init --no-git
```

### 3. Connect to Base Sepolia Testnet

In `contracts/.env`:

```env
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
PRIVATE_KEY="your_private_key"
```

💡 **Note on Private Keys:** If you already have a Base project created, you likely already have your private key stored in the keystore. You don't necessarily have to set it up again unless you want to start on a clean slate. If you want to use a new key, you can delete the existing one found in `./foundry/keystore` because you'll usually face an error that lets you know that a keystore already exists.

💡 Use [visualkey.link](https://visualkey.link) to generate a dev key and fund it with test ETH via the [Base Sepolia Faucet](https://faucet.quicknode.com/base/sepolia).

Load environment:

```bash
source .env
```

### 4. Write and Deploy the Guestbook Contract

The contract includes basic CRUD logic:

```solidity
function writeMessage(string memory title, string memory content) public
function readMessage(uint256 index) public view returns (string memory, string memory)
function editMessage(uint256 index, string memory newTitle, string memory newContent) public
function deleteMessage(uint256 index) public
```
To deploy:

```bash
forge create ./src/Guestbook.sol:Guestbook --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer --broadcast
```

Save the deployed address in your `.env` file in your contracts folder:

```env
CONTRACT_ADDRESS="0xYourDeployedContractAddress"
```

### 5. Interact with the Contract via CLI

Verify deployment on BaseScan.

Use cast to interact with your contract:

```bash
cast call $GUESTBOOK_CONTRACT_ADDRESS "messageCount()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

Write a message:

```bash
cast send $CONTRACT_ADDRESS "writeMessage(string,string)" "Hello" "This is a test message" --keystore ~/.foundry/keystores/deployer --rpc-url $BASE_SEPOLIA_RPC_URL
```

## Connecting Frontend to Contract

### 6. Use the OnchainKit Provider

Wrap your app with:

```tsx
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { baseSepolia } from "wagmi/chains";

<OnchainKitProvider
  chain={baseSepolia}
  apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}>
  {/* Your components here */}
</OnchainKitProvider>
```

## What Worked

- The OnchainKit scaffolding was smooth and quick to get started
- Foundry + Base testnet deployment was seamless
- I was able to successfully call and test the contract via cast
- Frontend interaction with the contract works as expected on localhost

## What I'm Still Fixing

- **Live deployment:** I'm still figuring out the deployment of the frontend via Vercel or Netlify
- The issue is mostly with environmental variables and connecting to the Base network from production
- For now, everything works well on localhost:3000

## Contract ABI

If you want to verify or interact with the contract manually, you can extract the ABI using:

```bash
forge inspect ./src/Guestbook.sol:Guestbook abi --json
```