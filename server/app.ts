import express, { Request, Response } from 'express';
import { Server } from "socket.io";
import http from 'http';
import cors from 'cors';
import cookieSession from 'cookie-session';

import RoomClient from './src/rooms/room_client';
import WordRaceClient from './src/games/word_race/word_race_client';

const app = express();
app.enable('trust proxy'); // Needed for heroku

function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

app.use(requireHTTPS);


const origin = process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000';
app.use(express.json());
app.use(cors({ origin, credentials: true }));

const cookieOptions: any = {
  name: 'session',
  keys: [process.env.COOKIE_KEY || 'asdfsadfij'],
  maxAge: 24 * 60 * 60 * 1000 //  24 hours
}

if (process.env.NODE_ENV === 'production') {
  cookieOptions.sameSite = 'none';
  cookieOptions.secure = true;
}

app.use(cookieSession(cookieOptions));

const games: { [index: string]: RoomClient; } = {};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

function terminateGameLater(roomCode) {
  setTimeout(() => terminateGame(roomCode), 10000);
}

function terminateGame(roomCode) {
  if (!games[roomCode]) return;

  if (games[roomCode].canTerminateGame()) {
    delete games[roomCode];
  }
}

app.get('/', (req: Request, res: Response) => {
  req.session.test = (req.session.test || 0) + 1;
  res.send('Hello World!  ' + req.session.test);
});

app.post('/join_room', (req: Request, res: Response) => {
  const game = games[(req.body.roomCode || '').toUpperCase()];

  if (!game) {
    res.status(404).json({ errors: ["Sorry, we couldn't find a game with that code."]});
    return;
  }

  const canJoinResult = game.canJoin();
  if (typeof canJoinResult === 'string') {
    res.status(422).json({ errors: [canJoinResult]});
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

  const room = new WordRaceClient(io);
  games[room.roomCode] = room;

  const player = room.join(req.body.name);

  req.session.games = (req.session.games || {});
  req.session.games[room.roomCode] = player.id;

  res.json({ roomCode: room.roomCode, other: req.session.games });
});

app.post('/join', (req: Request, res: Response) => {
  const roomCode: string = (req.body.roomCode || '').toUpperCase();
  const room = games[roomCode];

  if (!room) {
    res.status(404).json({ errors: ["Sorry, we couldn't find a game with that code."]});
    return;
  }

  const playerId: string | null  = req.session.games?.[roomCode];
  const player = room.players[playerId]

  if (!player) {
    res.status(422).json({ errors: ["You haven't joined this game"]});
    return;
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

    socket.on('disconnect', () => {
      terminateGameLater(roomCode);
    });
  })


server.listen(process.env.PORT || 3001, () => {
  console.log('listening on *:3001');
});
