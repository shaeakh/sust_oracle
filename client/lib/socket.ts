// lib/socket.ts
import io from 'socket.io-client';

class SocketClient {
  private static instance: SocketClient;
  private socket: any = null;
  private initialized = false;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  private constructor() {}

  static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  async initialize() {
    if (this.initialized && this.socket?.connected) {
      console.log('🔄 Socket already initialized and connected');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      try {
        console.log('🔌 Initializing socket connection...');
        
        fetch('/api/socket')
          .then(async (response) => {
            const data = await response.json();
            console.log('🌐 Socket API Response:', data);

            const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
            console.log('🔗 Connecting to socket server at:', socketUrl);
            
            if (this.socket) {
              console.log('🔄 Cleaning up existing socket connection');
              this.socket.removeAllListeners();
              this.socket.disconnect();
            }

            this.socket = io(socketUrl, {
              transports: ['websocket', 'polling'],
              reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
              reconnectionDelay: 1000,
              forceNew: true,
              timeout: 10000,
              autoConnect: true,
              reconnection: true,
              auth: {
                username: `User-${Math.floor(Math.random() * 1000)}`
              }
            });

            this.socket.on('connect', () => {
              console.log('✅ Socket Connected Successfully!');
              console.log('🆔 Socket ID:', this.socket.id);
              this.initialized = true;
              this.reconnectAttempts = 0;
              resolve();
            });

            this.socket.on('connect_error', (error: any) => {
              console.error('❌ Socket Connection Error:', error);
              this.reconnectAttempts++;
              this.initialized = false;
              if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
                reject(error);
              }
            });

            this.socket.on('disconnect', (reason: string) => {
              console.log('⚠️ Socket Disconnected:', reason);
              this.initialized = false;
              if (reason === 'io server disconnect') {
                // Server disconnected us, try to reconnect
                this.socket.connect();
              }
            });

            this.socket.on('error', (error: any) => {
              console.error('🚨 Socket Error:', error);
              this.initialized = false;
            });

            // Debug incoming events
            this.socket.onAny((eventName: string, ...args: any[]) => {
              console.log(`📥 Received event: ${eventName}`, args);
            });
          })
          .catch(error => {
            console.error('❌ Failed to initialize socket API route:', error);
            this.initialized = false;
            reject(error);
          });
      } catch (error) {
        console.error('❌ Socket Initialization Failed:', error);
        this.initialized = false;
        reject(error);
      }
    });
  }

  getSocket() {
    return this.socket;
  }

  emit(event: string, data: any) {
    if (!this.socket || !this.initialized) {
      console.warn('⚠️ Socket not initialized. Cannot emit event:', event);
      return;
    }

    if (!this.socket.connected) {
      console.warn('⚠️ Socket not connected. Cannot emit event:', event);
      return;
    }

    console.log('📤 Emitting event:', event, 'with data:', data);
    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized. Cannot register listener for event:', event);
      return;
    }

    console.log('👂 Registering listener for event:', event);
    this.socket.on(event, (data: any) => {
      console.log(`📥 Received ${event}:`, data);
      callback(data);
    });
  }

  off(event: string, callback?: (data: any) => void) {
    if (!this.socket) return;
    
    console.log('🔕 Removing listener for event:', event);
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.removeAllListeners(event);
    }
  }

  disconnect() {
    if (!this.socket) return;
    
    console.log('👋 Disconnecting socket');
    this.socket.disconnect();
    this.initialized = false;
  }
}

export const socketClient = SocketClient.getInstance();

export const socketEvents = {
  STORY_UPDATE: 'story:update',
  CHAT_MESSAGE: 'chat:message',
  FEEDBACK: 'feedback:new',
  USER_JOIN: 'user:join',
  USER_LEAVE: 'user:leave',
};