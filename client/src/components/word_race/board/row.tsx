import { useEffect, useRef } from 'react';
import { LetterGuess } from '../constants';
import Tile from './tile';

type Props = {
  couldNotSubmit: boolean;
  wordLength: number;
  content?: LetterGuess[];
}

export default function Row({ couldNotSubmit, content, wordLength }: Props) {
  const rowEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (couldNotSubmit) {
      // Have to do this head-shake through directly manipulating the DOM. If I do this by changing the class
      // on the rendered div it will change the dom structure which causes all child animations to rerun as well
      rowEl.current?.classList.add('head-shake');
      setTimeout(() => rowEl.current?.classList.remove('head-shake'), 1000);
    }
  }, [couldNotSubmit])


  const tiles = [];

  for(let i = 0; i < wordLength; i++) {
    tiles.push(
      <Tile letter={content?.[i]} key={i} />
    );
  }

  return (
    <div className="my-2 d-flex" ref={rowEl}>
      {tiles}
    </div>
  );
}
