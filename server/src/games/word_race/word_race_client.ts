import _, { cloneDeep } from 'lodash';
import { Server, Socket } from "socket.io";

import Player from '../../rooms/player';
import RoomClient from '../../rooms/room_client';
import WordRace from './game';
import { msFromNow } from "../../helpers/time_helpers";

import {
  ACTION__SET_NAME,
  ACTION__START_GAME,
  ACTION__SUBMIT_GUESS,
  LetterGuess
} from './constants';

const MAX_PLAYERS: number = 6;
const START_GAME_TIMER = 60 * 1000;

export default class WordRaceClient extends RoomClient {
  game?: WordRace;
  quickPlay: boolean;
  gameStartAt?: Date;
  activeTimer: NodeJS.Timeout | undefined;

  constructor(server: Server, quickPlay?: boolean) {
    super(server, quickPlay);

    this.quickPlay = !!quickPlay;

    if (this.quickPlay) {
      this.gameStartAt = msFromNow(START_GAME_TIMER);
      this.activeTimer = setTimeout(this.automaticallyStartGame.bind(this), START_GAME_TIMER);
    }
  }

  join(): Player {
    const player = super.join();
    if (this.quickPlay) this.ownerId = null;

    return player;
  }

  canJoin(): boolean | string {
    if (this.game) return 'Sorry, this game has already been started.';
    if (Object.keys(this.players).length >= MAX_PLAYERS) return 'Sorry, this game is full.'

    return true;
  }

  automaticallyStartGame() {
    this.startGame();
    this.sendGameState();
  }

  startGame() {
    if (this.game && !this.game.gameEnded) return;

    this.game = new WordRace(Object.values(this.players), this.onGameAutoUpdated.bind(this));
  }

  connect(socket: Socket, playerId: string) {
    super.connect(socket, playerId);

    const player = this.players[playerId];
    const playerIndex = Object.keys(this.players).indexOf(playerId) || 0;

    this.registerGameAction(socket, ACTION__START_GAME, () => {
      this.performActionOnOwner(player, this.startGame.bind(this));
    });

    this.registerGameAction(socket, ACTION__SUBMIT_GUESS, (guess) => {
      this.game?.guess(player, guess);
    })

    socket.on(ACTION__SET_NAME, (name: string | undefined, callback: (response: { error: string | undefined }) => void) => {
      let error: string | undefined;
      let nameToUse: string | undefined;

      if (!name || name === '') {
        nameToUse = `Player ${playerIndex + 1}`;
      } else {
        const validCheck = this.checkNameValidity(name);
        if (typeof validCheck === 'string') {
          error = validCheck;
        } else {
          nameToUse = name;
        }
      }

      if (nameToUse) {
        player.name = nameToUse;
        this.sendGameState();
      }

      callback({ error });
    });

    socket.on('disconnect', () => {
      this.sendGameState();
    });

    if (Object.keys(this.players).length >= MAX_PLAYERS) {
      clearTimeout(this.activeTimer);
      this.startGame();
    }

    this.sendGameState();
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
      ownerId: this.ownerId,
      game: null,
      gameStartIn: null
    }

    if (this.gameStartAt) serializedGame.gameStartIn = this.gameStartAt.getTime() - Date.now();

    if (this.game) {
      serializedGame.game = {
        guesses: this.game.nextWordAt ? this.game.guesses : this.cleanGuesses(player),
        numGuesses: this.game.numGuesses,
        scores: this.game.scores,
        gameEnded: this.game.gameEnded,
        previousWords: this.game.previousWords,
        roundNumber: this.game.roundNumber
      }

      const currentTime = (new Date()).getTime();
      if (this.game.nextWordAt) serializedGame.game.nextWordIn = this.game.nextWordAt.getTime() - currentTime;
      if (this.game.roundEndAt) serializedGame.game.roundEndIn = this.game.roundEndAt.getTime() - currentTime;
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

