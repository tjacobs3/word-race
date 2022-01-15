import { each, filter } from "lodash";
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





// buttonTheme: [
//   {
//     class: "hg-red",
//     buttons: "Q W E R T Y q w e r t y"
//   },
//   {
//     class: "hg-highlight",
//     buttons: "Q q"
//   }
// ]
