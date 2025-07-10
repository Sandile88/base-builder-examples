# Getting Started with Base + OnchainKit

This guide walks through how I deployed my first onchain app using [Base](https://www.base.org/) and [OnchainKit](https://docs.base.org/get-started/build-app). It includes what worked, what broke, and how I fixed it.

---

## What You'll Learn

- How to scaffold a Base onchain app with OnchainKit
- How to set up and deploy smart contracts using Foundry
- How to interact with the contract from the CLI

---

## Step-by-Step Walkthrough

### 1. Scaffold Project with OnchainKit

```bash
npm create onchain@latest
```

You'll be prompted for a CDP API key (optional, but recommended).
**{Information on this is provided down below under Step 4}**

After setup:

```bash
cd onchainkit-app
npm install
npm run dev
```

You'll see the starter UI running on your local dev server.

### 2. Set Up Smart Contract Environment (Foundry)

Create your contracts folder:

```bash
mkdir contracts && cd contracts
```

Install Foundry:

```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
forge --version
```

Initialize your project:

```bash
forge init --no-git
```

### 3. Connect to Base Sepolia

In `contracts/.env`:

```env
BASE_RPC_URL="https://mainnet.base.org"
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
```

Load env vars:

```bash
source .env
```

### 4. Secure Private Key

Use [visualkey.link](https://visualkey.link) to generate a test key.

Store your key:

```bash
cast wallet import deployer --interactive
```

Make sure the deployer wallet has Base Sepolia ETH (use [this faucet](https://portal.cdp.coinbase.com/products/faucet)).

### 5. Deploy Your Contract

Deploy to Base Sepolia:

```bash
forge create ./src/Counter.sol:Counter --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer --broadcast
```

Save the contract address to `.env`:

```env
COUNTER_CONTRACT_ADDRESS="0xYourDeployedAddress"
```

### 6. Verify and Interact with Contract

Check the deployment on [Basescan](https://sepolia.basescan.org/)

Call the contract:

```bash
cast call $COUNTER_CONTRACT_ADDRESS "number()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

It should return `0`.

---

## What Worked

- Bootstrap with OnchainKit was smooth
- Foundry setup was clean after reloading `.bashrc`
- Base auto-verifies contracts on deploy (awesome!)

## What I Had to Fix

- Foundry command not found → fixed with `source ~/.bashrc`
- Deployment dry run only → added `--broadcast`
