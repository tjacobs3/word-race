import styled, { keyframes } from 'styled-components';
import { pulse } from 'react-animations';

const pulseAnimation = keyframes`${pulse}`;

const PulseDiv = styled.div`
  animation: 0.2s ${pulseAnimation};
`;

type Props = {
  letter?: string;
}

export default function Tile({ letter }: Props) {
  const Component = letter ? PulseDiv : 'div';

  return <Component className="cell mx-1">{letter}</Component>;
}
