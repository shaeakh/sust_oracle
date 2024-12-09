'use client'
import React, { useState, useEffect, useRef } from 'react';
import { socketClient, socketEvents } from '@/lib/socket';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [username] = useState(`User-${Math.floor(Math.random() * 1000)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = socketClient.getSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        await socketClient.initialize();
        setIsConnected(true);
        console.log('🟢 Chat socket initialized');
      } catch (error) {
        console.error('🔴 Chat socket initialization failed:', error);
        setIsConnected(false);
      }
    };

    initializeSocket();

    // Update connection status based on socket events
    const handleConnect = () => {
      console.log('🟢 Socket connected');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('🔴 Socket disconnected');
      setIsConnected(false);
    };

    const handleError = (error: any) => {
      console.error('🔴 Socket error:', error);
      setIsConnected(false);
    };

    const handleChatMessage = (message: Message) => {
      console.log('📩 Received message:', message);
      setMessages(prev => [...prev, message]);
    };

    // Register all event listeners
    socket?.on('connect', handleConnect);
    socket?.on('disconnect', handleDisconnect);
    socket?.on('connect_error', handleError);
    socket?.on('error', handleError);
    socketClient.on(socketEvents.CHAT_MESSAGE, handleChatMessage);

    // Set initial connection status
    if (socket?.connected) {
      setIsConnected(true);
    }

    return () => {
      // Clean up event listeners
      socket?.off('connect', handleConnect);
      socket?.off('disconnect', handleDisconnect);
      socket?.off('connect_error', handleError);
      socket?.off('error', handleError);
      socketClient.off(socketEvents.CHAT_MESSAGE, handleChatMessage);
    };
  }, [socket]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    const message: Message = {
      id: uuidv4(),
      user: username,
      text: newMessage.trim(),
      timestamp: Date.now(),
    };

    console.log('✉️ Sending message:', message);
    socketClient.emit(socketEvents.CHAT_MESSAGE, message);
    setNewMessage('');
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        Chat <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {!isConnected && <span className="text-sm text-red-500">(Disconnected)</span>}
      </h3>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded-lg max-w-[80%] ${
                message.user === username
                  ? 'ml-auto bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              <div className="text-xs opacity-75 mb-1">
                {message.user} • {new Date(message.timestamp).toLocaleTimeString()}
              </div>
              <div>{message.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          disabled={!isConnected}
        />
        <Button type="submit" disabled={!isConnected || !newMessage.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}