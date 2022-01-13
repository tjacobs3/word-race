type Props = {
  wordLength: number;
  content?: string;
}

export default function Row({ content, wordLength }: Props) {
  const tiles = [];

  for(let i = 0; i < wordLength; i++) {
    const letter = (content || '')[i];

    tiles.push(
      <div className="cell mx-1" key={`${i}${letter}`}>
        {letter}
      </div>
    );
  }


  return (
    <div className="my-2 d-flex">
      {tiles}
    </div>
  );
}
