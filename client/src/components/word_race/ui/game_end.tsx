import styled, { keyframes } from 'styled-components';
import { fadeIn } from 'react-animations';
import { GameState } from '../constants';
import { sortBy } from 'lodash';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';

const fadeInAnimation = keyframes`${fadeIn}`;

const FadeInDiv = styled.h3`
  animation: 1.5s ${fadeInAnimation};
`;

type Props = {
  gameState: GameState;
  onStartNewGame?: () => void;
}

export default function GameEnd({ gameState, onStartNewGame }: Props) {
  const sortedPlayers = sortBy(gameState.players, player => gameState.game?.scores?.[player.id] || 0);

  const playerList = sortedPlayers.map((player, i) => {
    const score = gameState.game?.scores?.[player.id] || 0;

    return (
      <div className="game-results">
        <div className="player-card">
          <div className="score">{score}</div>
          <div className="player-info flex-grow-1">{player.name}</div>
          {i === 0 && (
            <div className="p-3 align-self-center text-warning">
              <FontAwesomeIcon icon={faTrophy} size="lg"/>
            </div>
          )}
        </div>
      </div>
    )
  });

  return (
    <FadeInDiv>
      <h4 className="text-center mb-3">Congratulations!</h4>
      {playerList}
      {onStartNewGame && (
        <div className="text-center mt-4">
          <button className="btn btn-light mb-5 start-button" onClick={onStartNewGame}>NEW GAME</button>
        </div>
      )}
    </FadeInDiv>);
}
