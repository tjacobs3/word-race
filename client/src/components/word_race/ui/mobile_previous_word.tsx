import styled, { keyframes } from 'styled-components';
import { fadeIn } from 'react-animations';

const fadeInAnimation = keyframes`${fadeIn}`;

const FadeDiv = styled.div`
  animation: 0.5s ${fadeInAnimation};
`;

type Props = {
  previousWords: string[];
}

export default function MobilePreviousWord({ previousWords }: Props) {
  if (previousWords.length === 0) return null;

  return (
    <FadeDiv>
      <div>Previous Word: {previousWords[previousWords.length - 1]}</div>
    </FadeDiv>
  );
}
