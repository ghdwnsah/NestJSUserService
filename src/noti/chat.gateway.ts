import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  interface ChatSession {
    userId: string;
    messages: { from: string; message: string; read: boolean }[];
  }
  
  @WebSocketGateway({ namespace: 'chat', cors: true })
  export class ChatGateway {
    @WebSocketServer()
    server: Server;
  
    // 메모리 기반 세션 저장소 (실서비스에서는 DB 또는 Redis)
    private sessions: Record<string, ChatSession> = {};
  
    handleConnection(client: Socket) {
      const { userId, role } = client.handshake.query as { userId: string; role: string };
      console.log(`${role} connected: ${userId}`);
  
      if (role === 'admin') {
        client.join('admins');
      } else {
        client.join('clients'); 
        client.join(`user-${userId}`);
        if (!this.sessions[userId]) {
          this.sessions[userId] = {
            userId,
            messages: [],
          };
        }
      }
    }
  
    @SubscribeMessage('chat')
    handleChat(@MessageBody() message: string, @ConnectedSocket() client: Socket) {
      const { userId, role } = client.handshake.query as { userId: string; role: string };
  
      if (role === 'admin') {
        // Admin 메시지 → 모든 클라이언트에게
        const payload = { from: 'Admin', message, read: false };
        Object.keys(this.sessions).forEach((user) => {
          this.sessions[user].messages.push({ ...payload, read: false });
          this.server.to(`user-${user}`).emit('chat', payload);
        });
      } else {
        // Client 메시지 → 관리자에게
        const payload = { from: userId, message, read: false };
        this.sessions[userId].messages.push(payload);
        this.server.to('admins').emit('chat', payload);
      }
    }
  
    @SubscribeMessage('markAsRead')
    markAsRead(@MessageBody() senderId: string, @ConnectedSocket() client: Socket) {
    const { userId, role } = client.handshake.query as { userId: string; role: string };
    if (this.sessions[userId]) {
        this.sessions[userId].messages.forEach((msg) => {
        if (msg.from === senderId) msg.read = true;
        });

        // 관리자에게 읽음 처리된 상태 보내기
        this.server.to('admins').emit('readUpdate', { userId });
    }
    }
  }