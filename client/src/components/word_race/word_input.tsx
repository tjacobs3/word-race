import { useCallback, useEffect, useMemo, useState } from 'react';
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

import WordGrid from './word_grid';
import { CORRECT, LetterGuess } from "./constants";
import { every, find } from 'lodash';
import AllWordsDictionary from './assets/all_words.json';
import React from 'react';
import { guessesToButtonTheme } from './helpers/word_helpers';

const DELETE = 46;
const BACKSPACE = 8;
const ENTER = 13;
const ENTER_STRING = '{ent}';
const BACKSPACE_STRING = '{backspace}';

const AllWords = AllWordsDictionary as any;

const KEYBOARD_LAYOUT = {
  default: [
    "Q W E R T Y U I O P",
    "A S D F G H J K L",
    `${ENTER_STRING} Z X C V B N M ${BACKSPACE_STRING}`
  ]
}
const KEYBOARD_DISPLAY = {
  [ENTER_STRING]: "ENTER",
  [BACKSPACE_STRING]: "⌫"
}

type Props = {
  alignChildren?: React.ReactNode;
  children?: React.ReactNode;
  onSubmit: (word: string) => void;
  wordLength: number;
  previousGuesses: LetterGuess[][];
}

export default function WordInput({ alignChildren, children, previousGuesses, wordLength, onSubmit }: Props) {
  const [word, setWord] = useState('');
  const [couldNotSubmit, setCouldNotSubmit] = useState(false);

  const isFinished = !!find(previousGuesses, (guess) => {
    return every(guess, ({ result }) => result === CORRECT);
  });

  const buttonThemes = useMemo(() => guessesToButtonTheme(previousGuesses), [previousGuesses]);

  const handleKey = useCallback((key: string) => {
    if (isFinished) return;

    switch (key) {
      case ENTER_STRING:

        if (word.length === wordLength && !!AllWords[word]) {
          onSubmit(word);
          setWord('');
        } else {
          setCouldNotSubmit(true);
          setTimeout(() => setCouldNotSubmit(false), 1000);
        }
        break;
      case BACKSPACE_STRING:
        if (word.length > 0) setWord(word.substring(0, word.length - 1));
        break;
      default:
        if (word.length >= wordLength) return;
        setWord(`${word}${key}`.toLowerCase());
    }
  }, [wordLength, word, onSubmit, isFinished]);


  const handleUserKeyPress = useCallback((event:KeyboardEvent) => {
    const { key, keyCode } = event;

    let keyString;

    switch (keyCode) {
      case ENTER:
        keyString = ENTER_STRING;
        break;
      case DELETE:
      case BACKSPACE:
        keyString = BACKSPACE_STRING;
        break;
      default:
        if(keyCode >= 65 && keyCode <= 90) keyString = key;
    }



    if (keyString) handleKey(keyString);
  }, [handleKey]);

  useEffect(() => {
    window.addEventListener("keydown", handleUserKeyPress);
    return () => {
        window.removeEventListener("keydown", handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  const currentGuess = word.split('').map(letter => ({ letter }));

  return (
    <React.Fragment>
      <div className="flex-grow-1 position-relative mt-2">
        <div className="position-relative">
          <WordGrid
            couldNotSubmit={couldNotSubmit}
            previousGuesses={previousGuesses.concat([currentGuess])}
            wordLength={wordLength}
          />
          {alignChildren}
        </div>
        {children}
      </div>
      <Keyboard
        layoutName="default"
        layout={KEYBOARD_LAYOUT}
        theme={"hg-theme-default word-race"}
        buttonTheme={buttonThemes}
        display={KEYBOARD_DISPLAY}
        onKeyPress={handleKey}
      />
    </React.Fragment>

  );
}
