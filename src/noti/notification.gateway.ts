import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({ namespace: 'notifications', cors: true })
  export class NotificationGateway {
    @WebSocketServer()
    server: Server;
  
    handleConnection(client: Socket) {
      const userId = client.handshake.query.userId;
      if (userId) {
        client.join(`user-${userId}`);
        console.log(`User ${userId} connected with socket ID ${client.id}`);
      }
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('ack')
    handleAck(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
      console.log(`Ack from ${client.id}:`, data);
    }
  
    sendNotificationToUser(userId: string, payload: object) {
      this.server.to(`user-${userId}`).emit('notification', payload);
    }
  
    sendNotificationToAll(payload: object) {
      this.server.emit('notification', payload);
    }
  }
  