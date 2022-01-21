export const ACTION__START_GAME = 'start_game';
export const ACTION__SUBMIT_GUESS = 'submit_guess';
export const ACTION__SET_NAME = 'set_name';

export const CORRECT = 2;
export const WRONG_SPOT = 1;
export const INCORRECT = 0;

export type LetterGuess = {
  letter: string;
  result: number;
}
