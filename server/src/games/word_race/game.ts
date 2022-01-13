import Player from "../../rooms/player";

export default class WordRace {
  players: Player[];
  currentWord: string;
  guesses: { [index: string]: string[]; }
  numGuesses: 5;

  constructor(players: Player[], onGameAutoUpdated: () => void) {
    this.players = players;
    this.guesses = {};
    this.setNewWord();
  }

  guess(player: Player, word: string) {
    if (word.length === this.currentWord.length) {
      if (!this.guesses[player.id]) this.guesses[player.id] = [];

      this.guesses[player.id].push(word);
    }
  }

  setNewWord() {
    this.currentWord = Math.random().toString(36).substr(5, 5)
  }
}
