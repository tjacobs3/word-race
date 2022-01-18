export const ACTION__START_GAME = 'start_game';
export const ACTION__SUBMIT_GUESS = 'submit_guess';

export const CORRECT = 2;
export const WRONG_SPOT = 1;
export const INCORRECT = 0;

export type LetterGuess = { letter: string, result?: number };
export type Guesses = { [index: string]: LetterGuess[][]; }

export type Player = {
  id: string;
  name: string;
}

interface BaseWordRaceGameState {
  guesses: Guesses,
  scores: { [index: string]: number },
  gameEnded: boolean,
  previousWords: string[],
  roundNumber: number
}

interface WordRaceGameState extends BaseWordRaceGameState {
  nextWordAt: Date | undefined,
  roundEndAt: Date | undefined,
}

interface IncomingWordRaceGameState extends BaseWordRaceGameState {
  nextWordIn: number | undefined,
  roundEndIn: number | undefined,
}

export interface GameState {
  players: Player[];
  ownerId: string;
  game?: WordRaceGameState;
}

export interface IncomingGameState {
  players: Player[];
  ownerId: string;
  game?: IncomingWordRaceGameState;
}
