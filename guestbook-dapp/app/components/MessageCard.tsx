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
    <div className={`bg-[#0b3238]/60 backdrop-blur-sm border hover:bg-[#0b3238]/80 rounded-xl p-6 transition-all duration-300 ${
      isLatest ? 'border-[#cde2eb]/50 bg-[#2c5d66]/20' : 'border-[#2c5d66]/30 hover:border-[#6f99a5]/50'
    }`}>
      {isLatest && (
        <div className="bg-[#cde2eb] text-[#041416] px-3 py-1 rounded-full text-xs font-medium inline-block mb-3">
          Latest Message
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <User size={16} className="text-[#6f99a5]" />
          <span className="text-sm text-[#6f99a5]">{formatAddress(message.author)}</span>
          {isOwner && (
            <span className="bg-[#2c5d66]/60 text-[#cde2eb] px-2 py-1 rounded-full text-xs font-medium  border border-[#6f99a5]/30">
              You
            </span>
          )}
        </div>
        
        {isOwner && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(message)}
              className="p-2 text-[#cde2eb] hover:bg-[#2c5d66]/60 rounded-lg transition-all duration-300 border border-transparent hover:border-[#6f99a5]/30"
              title="Edit message"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => onDelete(message.id)}
              className="p-2 text-[#6f99a5] hover:bg-[#041416]/60 hover:text-[#cde2eb] rounded-lg transition-all duration-300 border border-transparent hover:border-[#6f99a5]/30"
              title="Delete message"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {message.title && (
        <h3 className="text-lg font-semibold text-[#cde2eb] mb-2">{message.title}</h3>
      )}
      
      {message.text && (
        <p className="text-[#6f99a5] leading-relaxed">{message.text}</p>
      )}
    </div>
  );
};

export default MessageCard;