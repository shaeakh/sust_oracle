// app/api/socket/route.ts
import { Server as SocketServer } from 'socket.io';
import { createServer } from 'http';
import { NextRequest, NextResponse } from 'next/server';

let io: SocketServer | null = null;
let httpServer: any = null;

function setupSocketEvents(io: SocketServer) {
  io.on('connection', (socket) => {
    console.log('👤 Client connected:', socket.id);

    // Join a default room
    socket.join('chat-room');

    socket.on('chat:message', (message) => {
      console.log('📨 Server received chat message:', message);
      // Broadcast to all clients in the room
      io.to('chat-room').emit('chat:message', message);
      console.log('📤 Server broadcasted message to chat-room');
    });

    socket.on('story:update', (story) => {
      console.log('📖 Story update received:', story);
      socket.broadcast.emit('story:update', story);
    });

    socket.on('feedback:new', (feedback) => {
      console.log('👍 New feedback received:', feedback);
      io.emit('feedback:new', feedback);
    });

    socket.on('disconnect', () => {
      console.log('👋 Client disconnected:', socket.id);
      socket.leave('chat-room');
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('🚨 Socket error:', error);
    });
  });
}

export async function GET(request: NextRequest) {
  if (!io) {
    console.log('🔧 Initializing Socket.IO server...');
    
    httpServer = createServer();
    const port = parseInt(process.env.SOCKET_PORT || '5001', 10);
    
    io = new SocketServer(httpServer, {
      cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    setupSocketEvents(io);

    try {
      await new Promise((resolve) => {
        httpServer.listen(port, '0.0.0.0', () => {
          console.log(`🌐 Socket.IO server running on port ${port}`);
          resolve(true);
        });
      });
    } catch (error) {
      console.error('❌ Error starting socket server:', error);
      return NextResponse.json({ error: 'Failed to start socket server' }, { status: 500 });
    }
  }

  return NextResponse.json({ 
    success: true,
    message: 'Socket.IO server is running',
    port: process.env.SOCKET_PORT || '5001'
  });
}