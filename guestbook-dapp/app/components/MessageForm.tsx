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
  );
};

export default MessageForm;
