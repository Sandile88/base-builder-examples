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
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'viem/chains';

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
    <OnchainKitProvider
    apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
    chain={baseSepolia}>
    <div className="flex flex-col min-h-screen font-sans bg-gradient-to-br from-[#041416] via-[#0b3238] to-[#2c5d66]">
      <header className="bg-[#041416]/80 backdrop-blur-sm border-b border-[#2c5d66]/30 pt-2 pr-4">
        <div className="flex justify-end">
          <div className="wallet-container mb-2">
            <Wallet>
              <ConnectWallet className="flex items-center space-x-2 bg-[#2c5d66] hover:bg-[#6f99a5] text-[#cde2eb] px-6 py-3 rounded-lg transition-all duration-300 font-medium border border-[#6f99a5]/30 hover:border-[#cde2eb]/50">
                <Avatar className="h-6 w-6" />
                <Name />
              </ConnectWallet>
              <WalletDropdown className="bg-[#0b3238] border border-[#2c5d66]/30 rounded-lg shadow-xl">
                <Identity className="px-4 pt-3 pb-2 text-[#cde2eb]" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address className="text-[#6f99a5]" />
                  <EthBalance className="text-[#6f99a5]" />
                </Identity>
                <WalletDropdownLink
                  icon="wallet"
                  href="https://keys.coinbase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wallet
                </WalletDropdownLink>
                <WalletDropdownDisconnect className="text-[#6f99a5] hover:bg-[#041416]/60 hover:text-[#cde2eb]" />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 py- w-full">
          {!isConnected ? (

            <div className="text-center py-16">
              <div className="rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-[#cde2eb] mb-2">Welcome to the Guestbook</h2>
                <p className="text-[#6f99a5] mb-6">
                  Connect your wallet to start reading and writing messages on the blockchain.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 h-full">
              <div className="lg:w-1/2 w-full space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className="bg-[#0b3238]/60 backdrop-blur-sm rounded-xl border border-[#2c5d66]/30 p-6 hover:bg-[#0b3238]/80 transition-all duration-300">
                    <div>
                      <p className="text-sm text-[#6f99a5]">Total Messages</p>
                      <p className="text-2xl font-bold text-[#cde2eb]">{messageCount}</p>
                    </div>
                  </div>

                  <div className="bg-[#0b3238]/60 backdrop-blur-sm rounded-xl border border-[#2c5d66]/30 p-6 hover:bg-[#0b3238]/80 transition-all duration-300">
                    <div>
                      <p className="text-sm text-[#6f99a5]">Your Messages</p>
                      <p className="text-2xl font-bold text-[#cde2eb]">{userMessages.length}</p>
                    </div>
                  </div>

                  <div className="bg-[#0b3238]/60 backdrop-blur-sm rounded-xl border border-[#2c5d66]/30 p-6 hover:bg-[#0b3238]/80 transition-all duration-300">
                    <div>
                      <p className="text-sm text-[#6f99a5]">Connected</p>
                      <p className="text-lg font-bold text-[#cde2eb]">
                        {address ? formatAddress(address) : '0x000...0000'}
                      </p>
                    </div>
                  </div>
                </div>

                <MessageForm
                  onSubmit={handleSubmit}
                  loading={loadingAction !== null}
                  editingMessage={editingMessage}
                  onCancel={handleCancelEdit}
                />
              </div>

              <div className="lg:w-1/2 w-full">
                <div className="h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#cde2eb] mb-4">All Messages</h2>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={toggleBulkDeleteMode}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 border ${
                          bulkDeleteMode
                            ? 'bg-[#041416]/60 text-[#cde2eb] border-[#6f99a5]/50 hover:bg-[#041416]/80'
                            : 'bg-[#2c5d66]/60 text-[#cde2eb] border-[#6f99a5]/30 hover:bg-[#2c5d66]/80'
                        }`}
                      >
                        {bulkDeleteMode ? 'Cancel' : 'Select Multiple'}
                      </button>
                      {bulkDeleteMode && (
                        <>
                          <button
                            onClick={handleSelectAll}
                            className="px-3 py-1 bg-[#2c5d66] text-[#cde2eb] rounded-lg text-sm font-medium hover:bg-[#6f99a5] transition-all duration-300 border border-[#6f99a5]/30"
                          >
                            {selectedMessages.length === userMessages.length ? 'Deselect All' : 'Select All'}
                          </button>
                          {selectedMessages.length > 0 && (
                            <button
                              onClick={handleBulkDelete}
                              disabled={isDeletingBulk}
                              className="flex items-center space-x-1 px-3 py-1  bg-[#041416] text-[#cde2eb] rounded-lg text-sm font-medium hover:bg-[#0b3238] disabled:bg-[#041416]/50 transition-all duration-300 border border-[#6f99a5]/30"
                            >
                              <Trash2 size={14} />
                              <span>
                                {isDeletingBulk ? 'Deleting...' : `Delete ${selectedMessages.length}`}
                              </span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Search messages by title or text..."
                    className="bg-[#041416]/60 w-full mb-4 px-4 py-2 border border-[#2c5d66]/50 rounded-lg focus:ring-2 focus:ring-[#6f99a5] focus:border-[#cde2eb] focus:outline-none transition-all text-[#cde2eb] placeholder-[#6f99a5]/70"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                 {checkingMessages || loadingAction ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <LoadingSpinner />
                    <p className="text-[#6f99a5] text-sm">
                      {checkingMessages
                        ? 'Checking for messages...'
                        : getLoadingText()}
                    </p>
                  </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[#6f99a5]">No messages yet. Be the first to write one!</p>
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[#6f99a5]">No messages found matching &quot;{searchQuery}&quot;</p>
                      <p className="text-[#6f99a5]/70 text-sm mt-2">Try adjusting your search terms</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-hidden hover:overflow-y-auto transition-all duration-200 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-[#2c5d66] scrollbar-track-[#041416] hover:scrollbar-thumb-[#6f99a5]">
                      {loadingAction === 'saving' ? (
                        <div className="flex justify-center py-8">
                          <LoadingSpinner />
                        </div>
                      ) : (
                        filteredMessages.map((message) => (
                          <div key={message.id} className="relative">

                            {bulkDeleteMode &&
                              address &&
                              message.author.toLowerCase() === address.toLowerCase() && (
                                <div className="absolute top-2 left-2 z-10">
                                  <button
                                    onClick={() => handleMessageSelect(message.id)}
                                    className="p-1 rounded hover:bg-[#2c5d66]/60 transition-all duration-300"
                                  >
                                    {selectedMessages.includes(message.id) ? (
                                      <CheckSquare size={20} className="text-[#cde2eb]" />
                                    ) : (
                                      <Square size={20} className="text-[#6f99a5]" />
                                    )}
                                  </button>
                                </div>
                              )}

                            <MessageCard
                              key={message.id}
                              message={message}
                              currentAccount={address || ''}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              isLatest={message.id === latestMessage?.id}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    </OnchainKitProvider>
  );
}
