import Player from "../../rooms/player";
import { every, filter, find, max } from 'lodash';
import { LetterGuess } from "./constants";
import GuessAnalyzer, { isCorrect, numCorrectLetters } from './guess_analyzer';
import { msFromNow } from "../../helpers/time_helpers";
import { generateWord, wordIsValid } from "../../helpers/word_helpers";

const CATCH_UP_TIMER = 30 * 1000;
const NEW_ROUND_TIMER = 10 * 1000;
const POINTS_TO_WIN = 10;

export default class WordRace {
  players: Player[];
  currentWord: string;
  guesses: { [index: string]: LetterGuess[][]; }
  numGuesses: number;
  scores: { [index: string]: number };
  onGameAutoUpdated: () => void;
  nextWordAt: Date | undefined;
  roundEndAt: Date | undefined;
  activeTimer: NodeJS.Timeout | undefined;
  gameEnded: boolean;
  showGameEnd: boolean;
  previousWords: string[];
  roundNumber: number;

  constructor(players: Player[], onGameAutoUpdated: () => void) {
    this.players = players;
    this.scores = {};
    this.gameEnded = false;
    this.numGuesses = 6;
    this.previousWords = [];
    this.setNewWord();
    this.onGameAutoUpdated = onGameAutoUpdated;
    this.roundNumber = 0;
  }

  guess(player: Player, word: string) {
    if (word.length !== this.currentWord.length) return;
    if (this.isPlayerFinished(player)) return;
    if ((this.roundEndAt && (new Date()) > this.roundEndAt) || this.nextWordAt) return;
    if (this.gameEnded) return;
    if (!wordIsValid(word)) return;

    this.guessesForPlayer(player).push(GuessAnalyzer(word, this.currentWord));
    this.scoreGuess(player);
  }

  private guessesForPlayer(player: Player): LetterGuess[][] {
    if (!this.guesses[player.id]) this.guesses[player.id] = [];

    return this.guesses[player.id];
  }

  private scoreGuess(player: Player) {
    if (isCorrect(this.guessesForPlayer(player))) {
      const pointsScored = this.isFirstCorrect(player) ? 2 : 1;
      this.addScore(player, pointsScored);
    }

    if (this.allPlayersFinished()) {
      this.endRound();
    } else if(this.isPlayerFinished(player)) {
      this.endRoundLater();
    }
  }

  private allPlayersWrong(): boolean {
    return every(this.players, player => !isCorrect(this.guessesForPlayer(player)));
  }

  private playersWithMostCorrectLetters(): Player[] {
    const playerScores = this.players.map(player => numCorrectLetters(this.guessesForPlayer(player)));
    const highestScore = max(playerScores);

    return this.players.filter(player => numCorrectLetters(this.guessesForPlayer(player)) === highestScore);
  }

  private isFirstCorrect(player: Player): boolean {
    const otherPlayers = filter(this.players, otherPlayer => otherPlayer.id !== player.id);
    return !find(otherPlayers, player => isCorrect(this.guessesForPlayer(player)));
  }

  private allPlayersFinished(): boolean {
    return every(this.players, this.isPlayerFinished.bind(this));
  }

  private setNewWord() {
    this.currentWord = generateWord().toUpperCase();
    console.log('NEW WORD IS ', this.currentWord);
    this.guesses = {};
  }

  private isPlayerFinished(player: Player): boolean {
    return (this.guessesForPlayer(player).length >= this.numGuesses) || isCorrect(this.guessesForPlayer(player));
  }

  private addScore(player: Player, points: number) {
    this.scores[player.id] = (this.scores[player.id] || 0) + points;
  }

  private endRoundLater() {
    if (this.roundEndAt) return;

    this.nextWordAt = null;
    this.roundEndAt = msFromNow(CATCH_UP_TIMER);

    this.startTimer(CATCH_UP_TIMER, this.endRound.bind(this));
  }

  private startNewRoundLater() {
    if (this.nextWordAt) return;

    this.nextWordAt = msFromNow(NEW_ROUND_TIMER);
    this.roundEndAt = null;

    this.startTimer(NEW_ROUND_TIMER, this.startNewRound.bind(this));
  }

  private startTimer(timer: number, callback: () => void) {
    clearTimeout(this.activeTimer);

    this.activeTimer = setTimeout(callback, timer);
  }

  private anyPlayerWon(): boolean {
    return !!find(this.players, player => ((this.scores[player.id] || 0) >= POINTS_TO_WIN));
  }

  private endRound() {
    this.nextWordAt = null;
    this.roundEndAt = null;
    this.previousWords.push(this.currentWord);

    if (this.anyPlayerWon()) {
      this.gameEnded = true;
    } else {
      if (this.allPlayersWrong()) {
        this.playersWithMostCorrectLetters().forEach(player => this.addScore(player, 1));
      }

      this.startNewRoundLater();
    }

    this.onGameAutoUpdated();
  }

  private startNewRound() {
    this.nextWordAt = null;
    this.roundEndAt = null;
    this.roundNumber += 1;
    this.setNewWord();
    this.onGameAutoUpdated();
  }
}
