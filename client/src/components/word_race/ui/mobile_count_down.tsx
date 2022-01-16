import styled, { keyframes } from 'styled-components';
import { fadeIn } from 'react-animations';
import Timer from "../score_board/timer";

const fadeInAnimation = keyframes`${fadeIn}`;

const FadeInDiv = styled.div`
  animation: 1s ${fadeInAnimation};
`;

type Props = {
  nextWordAt?: string;
  roundEndAt?: string;
}

export default function MobileCountDown({ nextWordAt, roundEndAt }: Props) {
  let nextWordAtDate, roundEndAtDate;

  try {
    if (nextWordAt) nextWordAtDate = new Date(nextWordAt);
    if (roundEndAt) roundEndAtDate = new Date(roundEndAt);
  } catch (error) {

  }

  if (!nextWordAtDate && !roundEndAtDate) return <div></div>;

  const text = roundEndAt ? 'Round Ends In: ' : 'Next Word In: ';

  return (
    <FadeInDiv className="text-end">
      {text}
      <Timer toTime={nextWordAtDate || roundEndAtDate || new Date()} />
    </FadeInDiv>
  );
}
