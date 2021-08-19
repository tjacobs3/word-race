import express, { Request, Response } from 'express';
import { Server } from "socket.io";
import http from 'http';
import cors from 'cors';
import cookieSession from 'cookie-session';

import RoomClient from './src/rooms/room_client';
import HoldEmClient from './src/games/holdem/holdem_client';

const app = express();
const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(express.json());
app.use(cors({ origin }));
app.use(cookieSession({
  name: 'session',
  keys: ['sadfsadfgdg'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const games: { [index: string]: RoomClient; } = {};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.get('/', (req: Request, res: Response) => {
  req.session.test = (req.session.test || 0) + 1;
  res.send('Hello World!  ' + req.session.test);
});

app.post('/join_room', (req: Request, res: Response) => {
  const game = games[req.body.roomCode];

  if (!game) {
    res.status(404).json({ errors: ["Sorry, we couldn't find a game with that code."]});
    return;
  }

  const nameValidity = game.checkNameValidity(req.body.name || '');
  if (typeof nameValidity === 'string') {
    res.status(422).json({ errors: [nameValidity]});
    return;
  }

  const player = game.join(req.body.name);

  req.session.games = (req.session.games || {});
  req.session.games[game.roomCode] = player.id;

  res.json({ roomCode: game.roomCode, other: req.session.games });
});

app.post('/create', (req: Request, res: Response) => {
  const nameValidity = RoomClient.checkNameValidity(req.body.name);

  if (typeof nameValidity === 'string') {
    res.status(422).json({ errors: [nameValidity]});
    return;
  }

  const room = new HoldEmClient(io);
  games[room.roomCode] = room;

  const player = room.join(req.body.name);

  req.session.games = (req.session.games || {});
  req.session.games[room.roomCode] = player.id;

  res.json({ roomCode: room.roomCode, other: req.session.games });
});

app.post('/join', (req: Request, res: Response) => {
  const roomCode: string = req.body.roomCode;
  const room = games[roomCode];

  if (!room) {
    res.status(404).json({ errors: ["Sorry, we couldn't find a game with that code."]});
  }

  const playerId: string | null  = req.session.games?.[roomCode];
  const player = room.players[playerId]

  if (!player) {
    res.status(422).json({ errors: ["You haven't joined this game"]});
  }

  res.json({ playerId: player.id, secret: player.secret });
});

io
  .use((socket, next) => {
    const { playerId, secret, roomCode } = socket.handshake.query;

    if (typeof playerId !== "string" || typeof secret !== "string" || typeof roomCode !== "string") {
      return next(new Error('Authentication error'));
    }

    if (games[roomCode]?.players?.[playerId]?.secret !== secret) return next(new Error('Authentication error'));

    next();
  })
  .on('connection', (socket) => {
    const { playerId, roomCode } = socket.handshake.query;

    if (typeof playerId !== "string" || typeof roomCode !== "string") return;

    const game = games[roomCode];
    game.connect(socket, playerId);
  })


server.listen(3001, () => {
  console.log('listening on *:3001');
});
