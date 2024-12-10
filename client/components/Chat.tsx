'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useSearchParams } from 'next/navigation';
import { useToast } from './ui/use-toast';
import { Send, MessageCircle, ArrowLeft, UserCircle2, Clock, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Message {
  id: number;
  room_id: number;
  sender_id: number;
  sender_name: string;
  message: string;
  created_at: string;
}

interface User {
  uid: number;
  user_name: string;
  user_email: string;
}

export function Chat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const otherUserId = searchParams.get('userId');
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast({
            title: "Error",
            description: "Please login to continue",
            variant: "destructive"
          });
          return;
        }

        // Fetch current user
        const currentUserId = localStorage.getItem('uid');
        const currentUserResponse = await fetch(`${process.env.NEXT_PUBLIC_IP_ADD}/user/${currentUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!currentUserResponse.ok) {
          throw new Error('Failed to fetch current user');
        }
        const currentUserData = await currentUserResponse.json();
        setCurrentUser(currentUserData);

        // Fetch other user
        if (otherUserId) {
          const otherUserResponse = await fetch(`${process.env.NEXT_PUBLIC_IP_ADD}/user/${otherUserId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!otherUserResponse.ok) {
            throw new Error('Failed to fetch other user');
          }
          const otherUserData = await otherUserResponse.json();
          setOtherUser(otherUserData);

          // Create or get chat room
          const roomResponse = await fetch(`${process.env.NEXT_PUBLIC_IP_ADD}/chat/room`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ otherUserId })
          });
          if (!roomResponse.ok) {
            throw new Error('Failed to create/get chat room');
          }
          const roomData = await roomResponse.json();
          setRoomId(roomData.roomId);

          // Fetch messages
          const messagesResponse = await fetch(`${process.env.NEXT_PUBLIC_IP_ADD}/chat/messages/${roomData.roomId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!messagesResponse.ok) {
            throw new Error('Failed to fetch messages');
          }
          const messagesData = await messagesResponse.json();
          setMessages(Array.isArray(messagesData) ? messagesData : []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load chat data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [otherUserId, toast]);

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(`${process.env.NEXT_PUBLIC_IP_ADD}`, {
      auth: {
        token
      },
      path: '/socket.io'
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      newSocket.emit('join-chat', { roomId });
    });

    newSocket.on('new-message', (message: Message) => {
      setMessages(prev => Array.isArray(prev) ? [...prev, message] : [message]);
      scrollToBottom();
    });

    newSocket.on('typing', () => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-chat', { roomId });
      newSocket.close();
    };
  }, [roomId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket || !currentUser || !roomId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_IP_ADD}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId,
          message: message.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="flex flex-col items-center space-y-4">
          <MessageCircle className="w-12 h-12 text-violet-600" />
          <p className="text-violet-800 font-medium">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="text-center space-y-4">
          <UserCircle2 className="w-16 h-16 text-gray-400 mx-auto" />
          <p className="text-gray-600 font-medium">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4">
      <div className="w-full md:w-[60%] max-w-3xl h-[calc(100vh-6rem)] flex flex-col bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-violet-100">
        <div className="bg-white/95 backdrop-blur-sm shadow-sm p-4 border-b border-violet-100">
          <div className="flex items-center gap-4">
            <ArrowLeft 
              className="w-6 h-6 text-violet-600 cursor-pointer hover:text-violet-800 transition-colors hover:scale-110" 
              onClick={() => window.history.back()} 
            />
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-violet-200 ring-2 ring-violet-100">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.user_name}`} />
                  <AvatarFallback>{otherUser.user_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex flex-col">
                <h2 className="font-semibold text-lg bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {otherUser.user_name}
                </h2>
                {isTyping ? (
                  <p className="text-sm text-violet-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1">typing</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Online</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent hover:scrollbar-thumb-violet-300">
          {Array.isArray(messages) && messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end space-x-2 max-w-[80%]">
                {msg.sender_id !== currentUser?.uid && (
                  <Avatar className="w-8 h-8 ring-2 ring-violet-100">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_name}`} />
                    <AvatarFallback>{msg.sender_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-2xl p-4 shadow-sm hover:shadow-md ${
                    msg.sender_id === currentUser?.uid
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                      : 'bg-white border border-violet-100'
                  }`}
                >
                  <p className={`text-sm font-semibold mb-1 ${
                    msg.sender_id === currentUser?.uid ? 'text-violet-100' : 'text-violet-600'
                  }`}>
                    {msg.sender_name}
                  </p>
                  <p className="leading-relaxed">{msg.message}</p>
                  <div className={`flex items-center justify-end gap-1 mt-2 text-xs ${
                    msg.sender_id === currentUser?.uid ? 'text-violet-200' : 'text-gray-500'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>{new Date(msg.created_at).toLocaleTimeString()} GMT0</span>
                    {msg.sender_id === currentUser?.uid && (
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white/95 backdrop-blur-sm shadow-lg border-t border-violet-100">
          <form onSubmit={sendMessage} className="flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full bg-white/80 border-violet-200 focus:border-violet-400 focus:ring-violet-400 placeholder:text-gray-400"
            />
            <Button 
              type="submit" 
              disabled={!message.trim()}
              className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
