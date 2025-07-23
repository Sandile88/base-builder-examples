'use client';

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { 
  Transaction,
  LifecycleStatus,
  TransactionButton,
  TransactionSponsor,
  TransactionToast,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionToastAction,
 } from '@coinbase/onchainkit/transaction';
import { calls } from './calls';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'viem/chains';
import { useAccount } from 'wagmi';
import { useCallback } from 'react';

export default function App() {
  const { address, isConnected } = useAccount();

  const handleOnStatus = useCallback((status: LifecycleStatus) => {
    console.log('LifecycleStatus', status);
  }, []);

  return (
    <OnchainKitProvider
    apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
    chain={baseSepolia}
    config={{
      paymaster: process.env.PAYMASTER_ENDPOINT,
      appearance: {
      name: 'Tally App',        
      // logo: 'https://your-logo.com',
      mode: 'dark',                 
      theme: 'default',       
    },
    wallet: { 
      display: 'modal', 
      termsUrl: 'https://...', 
      privacyUrl: 'https://...', 
      supportedWallets: { 
        rabby: true, 
        trust: true, 
        frame: true, 
      }, 
      },
    }}
    >

    <div className="flex flex-col min-h-screen font-sans dark:bg-background dark:text-white bg-white text-black">
      <header className="pt-4 pr-4">
        <div className="flex justify-end">
            {isConnected && (
              <div className="flex items-center">

            <Wallet>
              <ConnectWallet>
                <Avatar className="h-6 w-6" />
                <Name />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownLink
                  icon="wallet"
                  href="https://keys.coinbase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wallet
                </WalletDropdownLink>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
            )}
        </div>
      </header>

      <main className="flex flex-grow items-center justify-center">
        <div className="w-full flex justify-center items-center">
          {!isConnected ? (
            <div className="text-center">
              <Wallet>
              <ConnectWallet>
                <Avatar className="h-6 w-6" />
                <Name />
              </ConnectWallet>
            </Wallet>
            </div>
          ) : (
            <div className="text-center">
              <Transaction
                isSponsored={true}
                calls={calls}
                onStatus={handleOnStatus}
                >
                <TransactionButton />
                <TransactionSponsor />
                <TransactionToast>
                  <TransactionToastIcon />
                  <TransactionToastLabel />
                  <TransactionToastAction />
                </TransactionToast>
              </Transaction>            
            </div>
          )}
        </div>
      </main>
    </div>
    </OnchainKitProvider>

  );
}
