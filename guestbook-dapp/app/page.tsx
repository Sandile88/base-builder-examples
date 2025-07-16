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
import { useAccount } from 'wagmi';
import MessageCard from './components/MessageCard';
import MessageForm from './components/MessageForm';
import LoadingSpinner from './components/LoadingSpinner';
import { useGuestbook } from './hooks/useGuestbook';
import { useEffect, useState } from 'react';
import { Trash2, CheckSquare, Square } from 'lucide-react';

interface Message {
  id: number;
  author: string;
  title: string;
  text: string;
}


export default function App() {
  const { address, isConnected } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  return (
    <div className="flex flex-col min-h-screen font-sans dark:bg-background dark:text-white bg-white text-black">
      <header className="pt-4 pr-4">
        <div className="flex justify-end">
          <div className="wallet-container">
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
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        
      </main>
    </div>
  );
}
