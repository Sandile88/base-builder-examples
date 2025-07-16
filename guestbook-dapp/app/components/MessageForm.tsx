import React, { useEffect, useState } from 'react';
import { Send, Edit3 } from 'lucide-react';

interface MessageFormProps {
  onSubmit: (title: string, text: string) => Promise<boolean>;
  loading: boolean;
  editingMessage?: { id: number; title: string; text: string } | null;
  onCancel?: () => void;
}
