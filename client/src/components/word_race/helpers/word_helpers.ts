import { each, filter, max } from "lodash";
import { CORRECT, INCORRECT, LetterGuess, WRONG_SPOT } from "../constants";

function letterResults(guesses: LetterGuess[][]): { [index: string]: number | undefined } {
  const results: { [index: string]: number | undefined } = {};

  guesses.forEach((guess) => {
    guess.forEach((letterGuess) => {
      if (!results[letterGuess.letter]) results[letterGuess.letter] = letterGuess.result;

      if (results[letterGuess.letter] === WRONG_SPOT && letterGuess.result === CORRECT) {
        results[letterGuess.letter] = letterGuess.result;
      }
    });
  });

  return results;
}


export function guessesToButtonTheme(guesses: LetterGuess[][]): { class: string, buttons: string }[] {
  const results = letterResults(guesses);

  const incorrectButtons = {
    class: 'hg-incorrect',
    buttons: ''
  }

  const wrongSpotButtons = {
    class: 'hg-wrong-spot',
    buttons: ''
  }

  const correctButtons = {
    class: 'hg-correct',
    buttons: ''
  }

  each(results, (result, key) => {
    if (result === undefined) return;

    switch (result) {
      case INCORRECT:
        incorrectButtons.buttons += ` ${key}`;
        break;
      case WRONG_SPOT:
        wrongSpotButtons.buttons += ` ${key}`;
        break;
      case CORRECT:
        correctButtons.buttons += ` ${key}`;
    }
  });

  return filter([incorrectButtons, wrongSpotButtons, correctButtons], theme => theme.buttons.length > 0);
}

export function numMatching(guess: LetterGuess[], result: number): number {
  let count = 0;
  guess.forEach((letter) => {
    if (letter.result === result) count += 1;
  })

  return count;
}

export function findBestGuess(guesses: LetterGuess[][]): LetterGuess[] {
  const maxCorrect = max(guesses.map(guess => numMatching(guess, CORRECT)));
  const maxCorrectGuesses = guesses.filter(guess => numMatching(guess, CORRECT) === maxCorrect);

  const maxWrongSpot = max(maxCorrectGuesses.map(guess => numMatching(guess, WRONG_SPOT)));
  const maxWrongSpotGuesses = maxCorrectGuesses.filter(guess => numMatching(guess, WRONG_SPOT) === maxWrongSpot);

  return maxWrongSpotGuesses[maxWrongSpotGuesses.length - 1] || [];
}
