import { LetterGuess } from '../constants';
import Tile from './tile';

type Props = {
  wordLength: number;
  content?: LetterGuess[];
}

export default function Row({ content, wordLength }: Props) {
  const tiles = [];

  for(let i = 0; i < wordLength; i++) {
    tiles.push(
      <Tile letter={content?.[i]} key={i} />
    );
  }

  return (
    <div className="my-2 d-flex">
      {tiles}
    </div>
  );
}
