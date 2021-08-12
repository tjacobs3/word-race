import { every } from 'lodash';
import { customAlphabet } from 'nanoid';
import { Server, Socket } from "socket.io";

import Player from './player';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 5);

export default class RoomClient {
  server: Server;
  roomCode: string;
  ownerId: string;
  players: { [index: string]: Player; }

  constructor(server: Server) {
    this.server = server;
    this.roomCode = nanoid();
    this.ownerId = null;
    this.players = {};
  }

  nameFor(playerId: string): string {
    return this.players[playerId].name;
  }

  join(name: string): Player {
    const player = new Player(name);
    this.players[player.id] = player;

    if (Object.keys(this.players).length === 1) this.ownerId = player.id;

    return player;
  }

  connect(socket: Socket, playerId: string) {
    const player = this.players[playerId];
    this.players[playerId].socket = socket;
    socket.join(this.roomCode);

    socket.on('chat message', (text: string) => {
      this.emitToRoom('chat message', { playerName: player.name, text });
    });
  }

  // connectPlayer(socket: Socket, playerId: string, playerName: string) {
  //   this.disconnectExistingPlayerSocket(playerId);

  //   if (Object.keys(this.players).length === 0) this.ownerId = playerId;

  //   this.players[playerId] = new Player(playerName, socket);
  // }

  playerIsConnected(playerId: string): boolean {
    return !!this.players[playerId]?.socket?.connected;
  }

  canTerminateGame(): boolean {
    return every(this.players, player => !player.socket.connected);
  }

  disconnectExistingPlayerSocket(playerId: string) {
    if (!this.players[playerId]?.socket) return;

    this.players[playerId].socket.disconnect(true);
  }

  emitToPlayer(playerId: string, msg: string, payload: Object) {
    if (!this.players[playerId]?.socket) return;

    this.server.to(this.players[playerId].socket.id).emit(msg, payload);
  }

  emitToRoom(msg: string, payload: Object) {
    this.server.to(this.roomCode).emit(msg, payload);
  }

  sendSystemMessage(text: string) {
    this.emitToRoom('chat message', { playerName: "SYSTEM", text });
  }
}

