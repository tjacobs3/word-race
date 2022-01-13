import _ from 'lodash';
import { Server, Socket } from "socket.io";

import Player from '../../rooms/player';
import RoomClient from '../../rooms/room_client';
import WordRace from './game';

import {
  ACTION__START_GAME,
  ACTION__SUBMIT_GUESS
} from './constants';

export default class WordRaceClient extends RoomClient {
  game?: WordRace;

  constructor(server: Server) {
    super(server);
  }

  connect(socket: Socket, playerId: string) {
    super.connect(socket, playerId);

    const player = this.players[playerId];

    this.sendGameState();

    this.registerGameAction(socket, ACTION__START_GAME, () => {
      this.performActionOnOwner(player, () => {
        this.game = new WordRace(Object.values(this.players), () => { });
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
        guesses: this.game.guesses,
        numGuesses: this.game.numGuesses
      }
    }

    return serializedGame;
  }
}

