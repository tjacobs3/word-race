import HoldEm from '../../../src/games/holdem/holdem';
import TablePlayer from '../../../src/games/holdem/table_player';

describe('startNewRound', () => {
  let game: HoldEm, players: TablePlayer[];

  beforeEach(() => {
    players = [
      new TablePlayer('A'),
      new TablePlayer('B'),
      new TablePlayer('C'),
      new TablePlayer('D'),
    ]

    game = new HoldEm(jest.fn());
    game.addPlayer(players[0]);
    game.addPlayer(players[1]);
    game.addPlayer(players[2]);
    game.addPlayer(players[3]);
  });

  it('starts a new round for all players that have chips', () => {
    game.players[2].takeChips(game.players[2].chips);

    game.startNewRound();
    expect(game.currentRound.players).toEqual([
      expect.objectContaining({ tablePlayer: players[0] }),
      expect.objectContaining({ tablePlayer: players[1] }),
      expect.objectContaining({ tablePlayer: players[3] })
    ])
  });

  it('starts a new round for all players that are sitting', () => {
    game.players[2].stand();

    game.startNewRound();
    expect(game.currentRound.players).toEqual([
      expect.objectContaining({ tablePlayer: players[0] }),
      expect.objectContaining({ tablePlayer: players[1] }),
      expect.objectContaining({ tablePlayer: players[3] })
    ])
  });

  it('only makes eligible players the dealer', () => {
    game.players[1].takeChips(game.players[1].chips);
    game.dealerIndex = 1;
    game.startNewRound();

    expect(game.dealer).toEqual(expect.objectContaining(players[2]));
  });
});
