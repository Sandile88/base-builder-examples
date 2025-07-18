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
  const [checkingMessages, setCheckingMessages] = useState(true);


  const {
    messages,
    messageCount,
    latestMessage,
    loading,
    action: loadingAction,
    writeMessage,
    editMessage,
    deleteMessage,
    loadMessages
  } = useGuestbook();

  // loading messages after connecting
  useEffect(() => {
    if (isConnected) {
      setCheckingMessages(true);
      const load = async () => {
        await loadMessages();
        setCheckingMessages(false);
      };
      load();
    }
  }, [isConnected]);

  const handleSubmit = async (title: string, text: string) => {
    try {
      if (editingMessage) {
        const success = await editMessage(editingMessage.id, title, text);
        if (success) {
          await loadMessages();
          setEditingMessage(null);
        }
        return success;
      } else {
        return await writeMessage(title, text);
      }
    } finally {
    }
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setBulkDeleteMode(false);
    setSelectedMessages([]);
  };

  const handleDelete = async (id: number) => {
    try {
      const success = await deleteMessage(id);
      if (success) {
        if (editingMessage?.id === id) {
          setEditingMessage(null);
        }
        await loadMessages();
      }
      return success;
    } finally {
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const handleMessageSelect = (messageId: number) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSelectAll = () => {
    const userMessageIds = userMessages.map(msg => msg.id);
    if (selectedMessages.length === userMessageIds.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(userMessageIds);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMessages.length === 0) return;

    setIsDeletingBulk(true);
    const deletePromises = selectedMessages.map(id => deleteMessage(id));

    try {
      await Promise.all(deletePromises);
      setSelectedMessages([]);
      setBulkDeleteMode(false);
      await loadMessages();
    } catch (error) {
      console.error('Error deleting messages:', error);
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const toggleBulkDeleteMode = () => {
    setBulkDeleteMode(!bulkDeleteMode);
    setSelectedMessages([]);
    if (editingMessage) {
      setEditingMessage(null);
    }
  };
  
  const userMessages = messages.filter(msg =>
    address && msg.author.toLowerCase() === address.toLowerCase()
  );

   const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const filteredMessages = messages.filter(
    msg =>
      msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLoadingText = () => {
    switch (loadingAction) {
      case 'saving':
        return 'Saving message...';
      case 'updating':
        return 'Updating message...';
      case 'deleting':
        return 'Deleting message...';
      default:
        return '';
    }
  };


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
