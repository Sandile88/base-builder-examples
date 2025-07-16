import React from 'react';
import { Edit3, Trash2, User } from 'lucide-react';

interface Message {
  id: number;
  author: string;
  title: string;
  text: string;
}

interface MessageCardProps {
  message: Message;
  currentAccount: string;
  onEdit: (message: Message) => void;
  onDelete: (id: number) => void;
  isLatest?: boolean;
}

const MessageCard: React.FC<MessageCardProps> = ({
  message,
  currentAccount,
  onEdit,
  onDelete,
  isLatest = false
  
}) => {
  const isOwner = message.author.toLowerCase() === currentAccount.toLowerCase();
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow ${
      isLatest ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    }`}>
      {isLatest && (
        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium inline-block mb-3">
          Latest Message
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <User size={16} className="text-gray-500" />
          <span className="text-sm text-gray-600">{formatAddress(message.author)}</span>
          {isOwner && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              You
            </span>
          )}
        </div>
        
        {isOwner && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(message)}
              className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
              title="Edit message"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => onDelete(message.id)}
              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete message"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {message.title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{message.title}</h3>
      )}
      
      {message.text && (
        <p className="text-gray-600 leading-relaxed">{message.text}</p>
      )}
    </div>
  );
};

export default MessageCard;