import { reverse, sortBy } from 'lodash';
import { GameState } from '../constants';

type Props = {
  gameState: GameState;
  playerId: string;
}

export default function MobileScoreBoard({ playerId, gameState }: Props) {
  const sortedPlayers = reverse(sortBy(gameState.players, player => gameState.game?.scores?.[player.id] || 0));
  const nextHighestPlayer = sortedPlayers[0].id === playerId ? sortedPlayers[1] : sortedPlayers[0];


  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td>Score:</td>
            <td className="px-2">{gameState.game?.scores?.[playerId] || 0}</td>
          </tr>
          {nextHighestPlayer && (
            <tr>
              <td>{sortedPlayers[0]?.name}:</td>
              <td className="px-2">{gameState.game?.scores?.[nextHighestPlayer.id] || 0}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
