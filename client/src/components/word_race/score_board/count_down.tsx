import styled, { keyframes } from 'styled-components';
import { fadeIn } from 'react-animations';
import Timer from "./timer";

const fadeInAnimation = keyframes`${fadeIn}`;

const FadeInDiv = styled.div`
  animation: 1s ${fadeInAnimation};
`;

type Props = {
  nextWordAt?: Date;
  roundEndAt?: Date;
}

export default function CountDown({ nextWordAt, roundEndAt }: Props) {
  if (!nextWordAt && !roundEndAt) return <div></div>;

  const text = roundEndAt ? 'Round Ends In:' : 'Next Word In:';

  return (
    <FadeInDiv className="countdown mb-2">
      <div>{text}</div>
      <div className="time-left">
        <Timer toTime={nextWordAt || roundEndAt || new Date()} />
      </div>

    </FadeInDiv>
  );
}
