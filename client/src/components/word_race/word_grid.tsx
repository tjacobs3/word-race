import Row from './board/row';
import { LetterGuess } from './constants';

type Props = {
  wordLength: number;
  previousGuesses: LetterGuess[][];
  couldNotSubmit?: boolean;
}

export default function WordGrid({ couldNotSubmit, previousGuesses, wordLength }: Props) {
  const rows = [];

  for(let i = 0; i < 6; i++){
    rows.push(
      <Row
        couldNotSubmit={!!(couldNotSubmit && i === (previousGuesses.length - 1))}
        content={previousGuesses[i]}
        key={i}
        wordLength={wordLength}
      />
    );
  }

  return (
    <div>
      {rows}
    </div>
  );
}
