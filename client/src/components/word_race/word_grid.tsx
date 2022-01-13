import Row from './board/row';
import { LetterGuess } from './constants';

type Props = {
  wordLength: number;
  previousGuesses: LetterGuess[][];
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
