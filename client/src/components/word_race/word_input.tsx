import { useCallback, useEffect, useState } from 'react';

import WordGrid from './word_grid';
import { LetterGuess } from "./constants";

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

  const handleUserKeyPress = useCallback((event:KeyboardEvent) => {
    const { key, keyCode } = event;

    switch (keyCode) {
      case ENTER:
        if (word.length === wordLength) {
          onSubmit(word);
          setWord('');
        }
        break;
      case DELETE:
      case BACKSPACE:
        if (word.length > 0) setWord(word.substring(0, word.length - 1));
        break;
      default:
        if (word.length >= wordLength) return;

        if(keyCode === 32 || (keyCode >= 65 && keyCode <= 90)){
          setWord(`${word}${key}`);
        }
    }
  }, [wordLength, word, onSubmit]);

  useEffect(() => {
    window.addEventListener("keydown", handleUserKeyPress);
    return () => {
        window.removeEventListener("keydown", handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  const currentGuess = word.split('').map(letter => ({ letter }));

  return (
    <WordGrid
      previousGuesses={previousGuesses.concat([currentGuess])}
      wordLength={wordLength}
    />
  );
}
