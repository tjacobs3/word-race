import { nanoid } from "nanoid";
import { Socket } from "socket.io";

export default class Player {
  id: string;
  secret: string;
  name: string;
  socket?: Socket;
  ai: boolean;

  constructor(name: string) {
    this.ai = false;
    this.id = nanoid();
    this.secret = nanoid();
    this.name = name;
  }
}
