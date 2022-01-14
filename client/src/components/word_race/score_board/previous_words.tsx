import styled, { keyframes } from 'styled-components';
import { fadeIn } from 'react-animations';

const fadeInAnimation = keyframes`${fadeIn}`;

const FadeDiv = styled.div`
  animation: 0.5s ${fadeInAnimation};
`;

type Props = {
  previousWords: string[];
}

export default function PreviousWords({ previousWords }: Props) {
  if (previousWords.length === 0) return null;

  return (
    <FadeDiv className='previous-words my-1'>
      <div>Previous Word:</div>
      <div className='previous-word'>{previousWords[previousWords.length - 1]}</div>
    </FadeDiv>
  );
}
