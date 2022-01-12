import { useState } from 'react';

type Props = {
  onSubmit: (word: string) => void;
}

export default function WordInput({ onSubmit }: Props) {
  const [word, setWord] = useState('');

  return (
    <div>
      <input onChange={e => setWord(e.target.value)} />
      <button onClick={() => onSubmit(word)}>Guess!</button>
    </div>
  );
}
