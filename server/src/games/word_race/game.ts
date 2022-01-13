import Player from "../../rooms/player";
import { find } from 'lodash';

const CORRECT = 2;
const WRONG_SPOT = 1;
const INCORRECT = 0;

type LetterGuess = {
  letter: string;
  result: number;
}

export default class WordRace {
  players: Player[];
  currentWord: string;
  guesses: { [index: string]: LetterGuess[][]; }
  numGuesses: 5;

  constructor(players: Player[], onGameAutoUpdated: () => void) {
    this.players = players;
    this.guesses = {};
    this.setNewWord();
  }

  guess(player: Player, word: string) {
    if (word.length !== this.currentWord.length) return;

    if (!this.guesses[player.id]) this.guesses[player.id] = [];

    word = word.toUpperCase();

    const guess: LetterGuess[] = word.split('').map(letter => ({ letter, result: INCORRECT }));

    this.currentWord.split('').forEach((currentWordLetter, i) => {
      if (guess[i]?.letter === currentWordLetter) guess[i].result = CORRECT;
    });

    this.currentWord.split('').forEach((currentWordLetter, i) => {
      if (guess[i]?.result === CORRECT) return;

      const wrongSpotResult = find(guess, ({ letter, result }) => {
        return letter === currentWordLetter && result === INCORRECT
      });
      if (wrongSpotResult) wrongSpotResult.result = WRONG_SPOT;
    });

    this.guesses[player.id].push(guess);
  }

  setNewWord() {
    this.currentWord = 'KITTY'.toUpperCase();
  }
}
