import styled, { keyframes } from 'styled-components';
import { fadeInUp } from 'react-animations';
import { Player } from '../constants';

const fadeInAnimation = keyframes`${fadeInUp}`;

const FadeInDiv = styled.h3`
  animation: 1s ${fadeInAnimation};
`;

type Props = {
  players: Player[]
}

export default function PlayerList({ players }: Props) {
  const playerList = players.map((player) => {
    return (
      <FadeInDiv key={player.id}>{player.name}</FadeInDiv>
    )
  });

  return <div>{playerList}</div>;
}
