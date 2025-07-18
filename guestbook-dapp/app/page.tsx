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
        <div className="max-w-7xl mx-auto px-4 py- w-full">
          {!isConnected ? (

            <div className="text-center py-16">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to the Guestbook</h2>
                <p className="text-gray-600 mb-6">
                  Connect your wallet to start reading and writing messages on the blockchain.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 h-full">
              <div className="lg:w-1/2 w-full space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div>
                      <p className="text-sm text-gray-600">Total Messages</p>
                      <p className="text-2xl font-bold text-gray-800">{messageCount}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div>
                      <p className="text-sm text-gray-600">Your Messages</p>
                      <p className="text-2xl font-bold text-gray-800">{userMessages.length}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div>
                      <p className="text-sm text-gray-600">Connected</p>
                      <p className="text-lg font-bold text-gray-800">
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
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">All Messages</h2>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={toggleBulkDeleteMode}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          bulkDeleteMode
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {bulkDeleteMode ? 'Cancel' : 'Select Multiple'}
                      </button>
                      {bulkDeleteMode && (
                        <>
                          <button
                            onClick={handleSelectAll}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                          >
                            {selectedMessages.length === userMessages.length ? 'Deselect All' : 'Select All'}
                          </button>
                          {selectedMessages.length > 0 && (
                            <button
                              onClick={handleBulkDelete}
                              disabled={isDeletingBulk}
                              className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:bg-red-300 transition-colors"
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
                    className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                 {checkingMessages || loadingAction ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <LoadingSpinner />
                    <p className="text-gray-500 text-sm">
                      {checkingMessages
                        ? 'Checking for messages...'
                        : getLoadingText()}
                    </p>
                  </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No messages yet. Be the first to write one!</p>
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No messages found matching "{searchQuery}"</p>
                      <p className="text-gray-400 text-sm mt-2">Try adjusting your search terms</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-hidden hover:overflow-y-auto transition-all duration-200 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
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
                                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                                  >
                                    {selectedMessages.includes(message.id) ? (
                                      <CheckSquare size={20} className="text-blue-500" />
                                    ) : (
                                      <Square size={20} className="text-gray-400" />
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
  );
}
