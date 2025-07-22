import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
// import guestbookAbi from '../../contracts/out/Guestbook.sol/Guestbook.json';
import {abi as guestbookAbi} from "@/contracts/out/Guestbook.sol/Guestbook.json";

interface Message {
  id: number;
  author: string;
  title: string;
  text: string;
}

// const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as  `0x${string}`;
console.log("GUESTBOOK ABI", guestbookAbi);

const CONTRACT_ADDRESS = "0x4F3fe5DE3E79c13a3390Def1e1B11824736cFd1A";

export const useGuestbook = () => {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<null | 'saving' | 'updating' | 'deleting'>(null);


  // creating contract instance for reading it
  const contract = publicClient && getContract({
    address: CONTRACT_ADDRESS,
    abi: guestbookAbi,
    client: publicClient,
  });

  // creating contract instance for writing
  const writeContract = walletClient && getContract({
    address: CONTRACT_ADDRESS,
    abi: guestbookAbi,
    client: walletClient,
  });

  const loadMessages = async () => {
    if (!contract || !isConnected) return;
    
    try {
      setLoading(true);
      const count = await contract.read.messageCount();
      const countNum = Number(count);

      const messagesData: Message[] = [];
      if (countNum > 0) {
        
        for (let i = 0; i < countNum; i++) {
          try {
            const messageData = await contract.read.messages([BigInt(i)]) as readonly [string, string, string];
            const [author, title, text] = messageData;
            if (author !== '0x0000000000000000000000000000000000000000') {
              messagesData.push({
                id: i,
                author,
                title,
                text
              });
            }
          } catch (error) {
            console.error(`Error loading message ${i}:`, error);
          }
        }
        
        setMessages(messagesData.reverse());
        setMessageCount(messagesData.length);

        // loading latest message
        try {
          const latestMessageData = await contract.read.readLatestMessage() as readonly [string, string];
          const [latestTitle, latestText] = latestMessageData;     

          const latestMessageObj = messagesData.find(msg => 
            msg.title === latestTitle && msg.text === latestText
          );
          if (latestMessageObj) {
            setLatestMessage(latestMessageObj);
          }

        } catch (error) {
          console.error('Error loading latest message:', error);
        }
      }

    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const writeMessage = async (title: string, text: string) => {
    if (!writeContract || !isConnected) return false;
    
    try {
      setLoading(true);
      setAction('saving')
      const hash = await writeContract.write.writeMessage([title, text]);
      
      // waiting for txn to be mined
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      
      // adding a short delay before loading messages
      await new Promise((res) => setTimeout(res, 300));
      await loadMessages();
      return true;

    } catch (error) {
      console.error('Error writing message:', error);
      return false;

    } finally {
      setLoading(false);
      setAction(null);
    }
  };

   const editMessage = async (id: number, title: string, text: string) => {
    if (!writeContract || !isConnected) return false;
    
    try {
      setLoading(true);
      setAction('updating')

      const hash = await writeContract.write.editMessage([BigInt(id), title, text]);
      
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      
      await new Promise((res) => setTimeout(res, 300));
      await loadMessages();
      return true;

    } catch (error) {
      console.error('Error editing message:', error);
      return false;

    } finally {
      setLoading(false);
      setAction(null);
    }
  };


  const deleteMessage = async (id: number) => {
    if (!writeContract || !isConnected) return false;
    
    try {
      setLoading(true);
      setAction('deleting')

      const hash = await writeContract.write.deleteMessage([BigInt(id)]);
      
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      
      await new Promise((res) => setTimeout(res, 300));
      await loadMessages();
      return true;

    } catch (error) {
      console.error('Error deleting message:', error);
      return false;

    } finally {
      setLoading(false);
      setAction(null);
    }
  };

 useEffect(() => {
  const timeout = setTimeout(() => {
    if (contract && isConnected) {
      loadMessages();
    }
  }, 500);

  return () => clearTimeout(timeout);
}, [contract, isConnected]);


  return {
    messages,
    messageCount,
    latestMessage,
    loading,
    action,
    writeMessage,
    editMessage,
    deleteMessage,
    loadMessages
  };
};