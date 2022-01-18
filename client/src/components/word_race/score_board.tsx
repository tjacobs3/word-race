import { cloneDeep } from 'lodash';
import Row from './board/row';
import { GameState, LetterGuess } from './constants';
import { findBestGuess } from './helpers/word_helpers';
import Score from './score_board/score';

type Props = {
  gameState: GameState;
}

export default function ScoreBoard({ gameState }: Props) {
  const players = gameState.players.map((player) => {
    const playerGuesses = gameState.game?.guesses?.[player.id];
    let lastGuess: LetterGuess[] | undefined;

    if (playerGuesses) {
      if (gameState.game?.nextWordAt) {
        lastGuess = findBestGuess(playerGuesses);
      } else {
        lastGuess = cloneDeep(playerGuesses[playerGuesses.length - 1] || []);
        lastGuess.forEach((guess) => guess.letter = '');
      }
    }

    return (
      <div className="player-card mb-2" key={player.id}>
        <Score score={gameState.game?.scores?.[player.id] || 0} />
        <div className="player-info">
          <div className="player-name">
            {player.name}
          </div>
          <div className="player-guess">
            <Row wordLength={5} content={lastGuess} />
          </div>
        </div>
      </div>
    );
  });



  return (
    <div className="scoreboard d-none d-sm-block">
      {players}
    </div>
  );
}
