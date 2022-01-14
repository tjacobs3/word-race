import _, { cloneDeep } from 'lodash';
import { Server, Socket } from "socket.io";

import Player from '../../rooms/player';
import RoomClient from '../../rooms/room_client';
import WordRace from './game';

import {
  ACTION__START_GAME,
  ACTION__SUBMIT_GUESS,
  LetterGuess
} from './constants';

const MAX_PLAYERS = 6;

export default class WordRaceClient extends RoomClient {
  game?: WordRace;

  constructor(server: Server) {
    super(server);
  }

  canJoin(): boolean | string {
    if (this.game) return 'Sorry, this game has already been started.';
    if (Object.keys(this.players).length >= MAX_PLAYERS) return 'Sorry, this game is full.'

    return true;
  }

  connect(socket: Socket, playerId: string) {
    super.connect(socket, playerId);

    const player = this.players[playerId];

    this.sendGameState();

    this.registerGameAction(socket, ACTION__START_GAME, () => {
      this.performActionOnOwner(player, () => {
        if (this.game && !this.game.gameEnded) return;

        this.game = new WordRace(Object.values(this.players), this.onGameAutoUpdated.bind(this));
      });
    });

    this.registerGameAction(socket, ACTION__SUBMIT_GUESS, (guess) => {
      this.game?.guess(player, guess);
    })

    socket.on('disconnect', () => {
      this.sendGameState();
    });
  }

  registerGameAction(socket, action, callback) {
    socket.on(action, (...args) => {
      callback(...args);
      this.sendGameState();
    });
  }

  performActionOnOwner(player: Player, callback: () => void) {
    if (player.id !== this.ownerId) return;

    callback();
    this.sendGameState();
  }

  sendGameState() {
    _.each(this.players, (player, playerId) => {
      this.emitToPlayer(playerId, 'gameState', this.serializeGameState(player))
    });
  }

  serializeGameState(player: Player) {
    const serializedGame = {
      players: Object.values(this.players).map(({ id, name }) => ({ id, name })),
      game: null
    }

    if (this.game) {
      serializedGame.game = {
        guesses: this.cleanGuesses(player),
        numGuesses: this.game.numGuesses,
        scores: this.game.scores,
        nextWordAt: this.game.nextWordAt?.toJSON(),
        roundEndAt: this.game.roundEndAt?.toJSON(),
        gameEnded: this.game.gameEnded
      }
    }

    return serializedGame;
  }

  onGameAutoUpdated() {
    this.sendGameState();
  }

  private cleanGuesses(forPlayer: Player): { [index: string]: LetterGuess[][] } {
    const cleanedGuesses: { [index: string]: LetterGuess[][] } = {};
    if (!this.game) return cleanedGuesses;

    this.game.players.map((player) => {
      cleanedGuesses[player.id] = cloneDeep<LetterGuess[][]>(this.game.guesses[player.id] || []);

      if (forPlayer.id !== player.id) {
        cleanedGuesses[player.id].forEach((guess) => {
          guess.forEach((letterGuess) => {
            letterGuess.letter = '';
          });
        });
      }
    });

    return cleanedGuesses;
  }
}

