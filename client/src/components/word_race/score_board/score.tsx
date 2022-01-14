import styled, { keyframes } from 'styled-components';
import { flipInX } from 'react-animations';

const flipInXAnimation = keyframes`${flipInX}`;

const FlipDiv = styled.div`
  animation: 1s ${flipInXAnimation};
`;

type Props = {
  score?: number;
}

export default function Score({ score }: Props) {
  const ComponentType = (score && score !== 0) ? FlipDiv : 'div';

  console.log('SCORE', score && score !== 0)

  return <ComponentType className="score" key={score}>{score}</ComponentType>;
}
