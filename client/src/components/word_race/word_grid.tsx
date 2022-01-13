import Row from './board/row';

type Props = {
  wordLength: number;
  previousGuesses: string[];
}

export default function WordGrid({ previousGuesses, wordLength }: Props) {
  const rows = [];

  for(let i = 0; i < 5; i++){
    rows.push(<Row content={previousGuesses[i]} key={i} wordLength={wordLength} />);
  }

  return (
    <div className="game-grid">
      {rows}
    </div>
  );
}
