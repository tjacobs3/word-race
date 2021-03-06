import styled, { keyframes } from 'styled-components';
import { fadeInUp } from 'react-animations';
import { Player } from '../constants';

const fadeInAnimation = keyframes`${fadeInUp}`;

const FadeInDiv = styled.h3`
  animation: 1s ${fadeInAnimation};
`;

type Props = {
  players: Player[];
  playerId: string;
}

export default function PlayerList({ players, playerId }: Props) {
  const playerList = players.map((player) => {
    return (
      <FadeInDiv key={player.id} className="my-3">
        <span className={player.id === playerId ? 'highlight-player' : ''}>
          {player.name}
        </span>
      </FadeInDiv>
    )
  });

  return <div>{playerList}</div>;
}
