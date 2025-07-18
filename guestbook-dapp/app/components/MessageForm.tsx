import React, { useEffect, useState } from 'react';
import { Send, Edit3 } from 'lucide-react';

interface MessageFormProps {
  onSubmit: (title: string, text: string) => Promise<boolean>;
  loading: boolean;
  editingMessage?: { id: number; title: string; text: string } | null;
  onCancel?: () => void;
}

const MessageForm: React.FC<MessageFormProps> = ({
  onSubmit,
  loading,
  editingMessage,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
    if (editingMessage) {
      setTitle(editingMessage.title);
      setText(editingMessage.text);
    } else {
      setTitle('');
      setText('');
    }
  }, [editingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!title.trim() && !text.trim()) || loading) return;

    const currentTitle = title;
    const currentText = text;

    setIsSubmitting(true);
    
     try {
      const success = await onSubmit(currentTitle, currentText);
      
      if (!success) {

        // keep the current values if submission failed
        setTitle(currentTitle);
        setText(currentText);
      } else {

        // clearing form only on success
        setTitle('');
        setText('');

        if (editingMessage) {
          onCancel?.();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <form onSubmit={handleSubmit} className="bg-[#0b3238]/60 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-[#2c5d66]/30">
      <div className="flex items-center space-x-2 mb-4">
        {editingMessage ? <Edit3 size={20} className="text-[#cde2eb]" /> : <Send size={20} className="text-[#cde2eb]" />}
        <h3 className="text-lg font-semibold text-[#cde2eb]">
          {editingMessage ? 'Edit Message' : 'Write a Message'}
        </h3>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[#6f99a5] mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for your message..."
          className="w-full px-4 py-2 bg-[#041416]/60 border border-[#2c5d66]/50 rounded-lg focus:ring-2 focus:ring-[#6f99a5] focus:border-[#cde2eb] outline-none transition-all text-[#cde2eb] placeholder-[#6f99a5]/70"
        />
      </div>

      <div>
        <label htmlFor="text" className="block text-sm font-medium text-[#6f99a5] mb-2">
          Message
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your message here..."
          rows={4}
          className="w-full px-4 py-2 bg-[#041416]/60 border border-gray-[#2c5d66]/50 rounded-lg focus:ring-2 focus:ring-[#6f99a5] focus:border-[#cde2eb] outline-none transition-all resize-none text-[#cde2eb] placeholder-[#6f99a5]/70"
        />
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={(!title.trim() && !text.trim()) || isSubmitting}
          className="flex items-center space-x-2 bg-[#2c5d66] hover:bg-[#6f99a5] disabled:bg-[#2c5d66]/50 text-[#cde2eb] px-6 py-2 rounded-lg transition-all duration-300 font-medium flex-1 border border-[#6f99a5]/30 hover:border-[#cde2eb]/50 disabled:border-[#2c5d66]/30"
        >
          {editingMessage ? <Edit3 size={16} /> : <Send size={16} />}
          <span>{isSubmitting ? 'Saving...' : (editingMessage ? 'Update' : 'Send')}</span>
        </button>
        
        {editingMessage && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-[#2c5d66]/50 text-[#6f99a5] rounded-lg hover:bg-[#041416]/60 hover:text-[#cde2eb] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default MessageForm;
