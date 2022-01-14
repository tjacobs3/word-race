import { every, find } from "lodash";
import { CORRECT, INCORRECT, LetterGuess, WRONG_SPOT } from "./constants";

export default function GuessAnalyzer(word: string, answer: string): LetterGuess[] {
  word = word.toUpperCase();

  const guess: LetterGuess[] = word.split('').map(letter => ({ letter, result: INCORRECT }));

  answer.split('').forEach((currentWordLetter, i) => {
    if (guess[i]?.letter === currentWordLetter) guess[i].result = CORRECT;
  });

  answer.split('').forEach((currentWordLetter, i) => {
    if (guess[i]?.result === CORRECT) return;

    const wrongSpotResult = find(guess, ({ letter, result }) => {
      return letter === currentWordLetter && result === INCORRECT
    });
    if (wrongSpotResult) wrongSpotResult.result = WRONG_SPOT;
  });

  return guess;
}

export function isCorrect(guesses: LetterGuess[][]) {
  return !!find(guesses, (guess) => {
    return every(guess, ({ result }) => result === CORRECT);
  });
}
