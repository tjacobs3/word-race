import styled, { keyframes } from 'styled-components';
import { pulse } from 'react-animations';
import { CORRECT, INCORRECT, LetterGuess, WRONG_SPOT } from '../constants';

const pulseAnimation = keyframes`${pulse}`;

const PulseDiv = styled.div`
  animation: 0.2s ${pulseAnimation};
`;

type Props = {
  letter?: LetterGuess;
}

export default function Tile({ letter }: Props) {
  const Component = letter ? PulseDiv : 'div';

  let resultClass = '';

  if (letter?.result === CORRECT) resultClass = 'correct';
  if (letter?.result === INCORRECT) resultClass = 'incorrect';
  if (letter?.result === WRONG_SPOT) resultClass = 'wrong-spot';

  return <Component className={`cell mx-1 ${resultClass}`}>{letter?.letter}</Component>;
}
