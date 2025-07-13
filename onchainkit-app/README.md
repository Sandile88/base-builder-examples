# Getting Started with Base + OnchainKit

This guide walks through how I deployed my first onchain app using [Base](https://www.base.org/) and [OnchainKit](https://docs.base.org/get-started/build-app). It includes what worked, what broke, and how I fixed it.

---

## What You'll Learn

- How to scaffold a Base onchain app with OnchainKit
- How to set up and deploy smart contracts using Foundry
- How to interact with the contract from the CLI
- How to connect your frontend to interact with deployed contracts

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

## Connecting Frontend to Contract

### 7. Add Transaction Component

In your `page.tsx` file, delete the existing content in the `main` tag and replace it with:

```tsx
import { Transaction } from '@coinbase/onchainkit/transaction';
import { calls } from './calls';

<main className="flex flex-grow items-center justify-center">
  <div className="w-full max-w-4xl p-4">
    <div className="mx-auto mb-6 w-1/3">
      <Transaction calls={calls} />
    </div>
  </div>
</main>
```

### 8. Define Contract Calls

Create a new `calls.ts` file in the same folder as your `page.tsx` file:

```ts
const counterContractAddress = '0xYourDeployedAddress' as `0x${string}`;
const counterContractAbi = [
  {
    type: 'function',
    name: 'increment',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

export const calls = [
  {
    address: counterContractAddress,
    abi: counterContractAbi,
    functionName: 'increment',
    args: [],
  },
];
```

**Note:** The `as 0x${string}` type assertion ensures TypeScript recognizes this as a valid Ethereum address format.

### 9. Configure OnchainKit Provider

Wrap your page content with the OnchainKit provider to ensure transactions happen on the correct network:

```tsx
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'wagmi/chains';

<OnchainKitProvider
  apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
  chain={baseSepolia}>
  {/* Your page content here */}
</OnchainKitProvider>
```

### 10. Test the Frontend Integration

1. Connect your wallet to the app
2. Click the "Transact" button
3. Approve the transaction
4. Verify the increment worked by calling the contract again:

```bash
# Remember to cd into contracts directory first
cd contracts
source .env
cast call $COUNTER_CONTRACT_ADDRESS "number()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

The count should have incremented by 1.

---

## What Worked

- Bootstrap with OnchainKit was smooth
- Foundry setup was clean after reloading `.bashrc`
- Base auto-verifies contracts on deploy (awesome!)
- Transaction component integration was straightforward

## What I Had to Fix

- Foundry command not found → fixed with `source ~/.bashrc`
- Deployment dry run only → added `--broadcast`
- Transaction component defaulted to Base mainnet → wrapped with `OnchainKitProvider` and specified `baseSepolia` chain
- TypeScript address type errors → added `as 0x${string}` type assertion