import Tile from './tile';

type Props = {
  wordLength: number;
  content?: string;
}

export default function Row({ content, wordLength }: Props) {
  const tiles = [];

  for(let i = 0; i < wordLength; i++) {
    const letter = (content || '')[i];

    tiles.push(
      <Tile letter={letter} key={`${i}${letter}`} />
    );
  }

  return (
    <div className="my-2 d-flex">
      {tiles}
    </div>
  );
}
