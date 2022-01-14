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

export type GameState = {
  players: Player[];
  ownerId: string;
  game?: {
    guesses: Guesses,
    scores: { [index: string]: number },
    nextWordAt: string | undefined,
    roundEndAt: string | undefined,
    gameEnded: boolean,
    previousWords: string[],
  };
}
