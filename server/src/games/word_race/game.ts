import Player from "../../rooms/player";
import { every } from 'lodash';
import { LetterGuess } from "./constants";
import GuessAnalyzer, { isCorrect } from './guess_analyzer';

const CATCH_UP_TIMER = 30 * 1000;
const NEW_ROUND_TIMER = 3 * 1000;

export default class WordRace {
  players: Player[];
  currentWord: string;
  guesses: { [index: string]: LetterGuess[][]; }
  numGuesses: 5;
  scores: { [index: string]: number };
  onGameAutoUpdated: () => void;
  nextWordAt: Date | undefined;
  roundEndAt: Date | undefined;

  constructor(players: Player[], onGameAutoUpdated: () => void) {
    this.players = players;
    this.scores = {};
    this.setNewWord();
    this.onGameAutoUpdated = onGameAutoUpdated;
  }

  guess(player: Player, word: string) {
    if (word.length !== this.currentWord.length) return;
    if (this.isPlayerFinished(player)) return;

    this.guessesForPlayer(player).push(GuessAnalyzer(word, this.currentWord));
    this.scoreGuess(player);
  }

  private guessesForPlayer(player: Player): LetterGuess[][] {
    if (!this.guesses[player.id]) this.guesses[player.id] = [];

    return this.guesses[player.id];
  }

  private scoreGuess(player: Player) {
    if (isCorrect(this.guessesForPlayer(player))) this.addScore(player, 2);

    if (this.allPlayersFinished()) this.startNewRoundInTime(NEW_ROUND_TIMER);
  }

  private allPlayersFinished(): boolean {
    return every(this.players, this.isPlayerFinished.bind(this));
  }

  private setNewWord() {
    this.currentWord = 'KITTY'.toUpperCase();
    this.guesses = {};
  }

  private isPlayerFinished(player: Player): boolean {
    return (this.guessesForPlayer(player).length >= this.numGuesses) || isCorrect(this.guessesForPlayer(player));
  }

  private addScore(player: Player, points: number) {
    this.scores[player.id] = (this.scores[player.id] || 0) + points;
  }

  private startNewRoundInTime(timer: number) {
    const currentDateObj = new Date();
    const numberOfMlSeconds = currentDateObj.getTime();
    const addMlSeconds = timer;
    this.nextWordAt = new Date(numberOfMlSeconds + addMlSeconds);

    setTimeout(this.startNewRound.bind(this), timer);
  }

  private startNewRound() {
    this.nextWordAt = null;
    this.roundEndAt = null;
    this.setNewWord();
    this.onGameAutoUpdated();
  }
}
