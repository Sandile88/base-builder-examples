import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
import guestbookAbi from '../../contracts/out/Guestbook.sol/Guestbook.json';

interface Message {
  id: number;
  author: string;
  title: string;
  text: string;
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const useGuestbook = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);

  // creating contract instance for reading it
  const contract = publicClient && getContract({
    address: CONTRACT_ADDRESS,
    abi: guestbookAbi.abi,
    client: publicClient,
  });

  // creating contract instance for writing
  const writeContract = walletClient && getContract({
    address: CONTRACT_ADDRESS,
    abi: guestbookAbi.abi,
    client: walletClient,
  });

}