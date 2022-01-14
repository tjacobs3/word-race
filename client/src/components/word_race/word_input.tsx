import { useCallback, useEffect, useState } from 'react';

import WordGrid from './word_grid';
import { CORRECT, LetterGuess } from "./constants";
import { every, find } from 'lodash';

const DELETE = 46;
const BACKSPACE = 8;
const ENTER = 13;

type Props = {
  onSubmit: (word: string) => void;
  wordLength: number;
  previousGuesses: LetterGuess[][];
}

export default function WordInput({ previousGuesses, wordLength, onSubmit }: Props) {
  const [word, setWord] = useState('');
  const [couldNotSubmit, setCouldNotSubmit] = useState(false);

  const isFinished = !!find(previousGuesses, (guess) => {
    return every(guess, ({ result }) => result === CORRECT);
  });

  const handleUserKeyPress = useCallback((event:KeyboardEvent) => {
    const { key, keyCode } = event;
    if (isFinished) return;

    switch (keyCode) {
      case ENTER:
        if (word.length === wordLength) {
          onSubmit(word);
          setWord('');
        } else {
          setCouldNotSubmit(true);
          setTimeout(() => setCouldNotSubmit(false), 1000);
        }
        break;
      case DELETE:
      case BACKSPACE:
        if (word.length > 0) setWord(word.substring(0, word.length - 1));
        break;
      default:
        if (word.length >= wordLength) return;

        if(keyCode >= 65 && keyCode <= 90) {
          setWord(`${word}${key}`);
        }
    }
  }, [wordLength, word, onSubmit, isFinished]);

  useEffect(() => {
    window.addEventListener("keydown", handleUserKeyPress);
    return () => {
        window.removeEventListener("keydown", handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  const currentGuess = word.split('').map(letter => ({ letter }));

  return (
    <WordGrid
      couldNotSubmit={couldNotSubmit}
      previousGuesses={previousGuesses.concat([currentGuess])}
      wordLength={wordLength}
    />
  );
}
