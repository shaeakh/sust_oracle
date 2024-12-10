// app/api/socket/route.ts
import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseServerIO } from '@/lib/socket';
 

export const dynamic = 'force-dynamic';

export async function GET(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      socket.on('join-chat', ({ userId, otherUserId }) => {
        const roomId = [userId, otherUserId].sort().join('-');
        socket.join(roomId);
        console.log(`User ${userId} joined chat room ${roomId}`);
      });

      socket.on('chat-message', (message) => {
        const roomId = [message.sender, message.recipient].sort().join('-');
        socket.to(roomId).emit('chat-message', message);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }

  return new Response('Socket is running', {
    status: 200,
  });
}