import Pot from '../../../src/games/holdem/pot';

import TablePlayer from '../../../src/games/holdem/table_player';
import RoundPlayer from '../../../src/games/holdem/round_player';

describe('pot', () => {
  let players: RoundPlayer[], pot: Pot;

  function zeroOutChips() {
    players.forEach(player => player.tablePlayer.setChips(0));
  }

  beforeEach(() => {
    players = [
      new RoundPlayer(new TablePlayer('0')),
      new RoundPlayer(new TablePlayer('1')),
      new RoundPlayer(new TablePlayer('2')),
      new RoundPlayer(new TablePlayer('3')),
    ];

    zeroOutChips();

    pot = new Pot();
  });

  it('distributes to the winner', () => {
    pot.placeBet(players[0].id, 50);
    pot.placeBet(players[2].id, 50);
    pot.placeBet(players[3].id, 50);

    pot.distribute([[players[0]], [players[1]], [players[2]]]);
    expect(players[0].chips).toEqual(150);
    expect(players[1].chips).toEqual(0);
    expect(players[2].chips).toEqual(0);
    expect(players[3].chips).toEqual(0);
  });

  it('distributes as much as possible to the first winner, then the remainder to the second winner', () => {
    pot.placeBet(players[0].id, 50);
    pot.placeBet(players[1].id, 150);
    pot.placeBet(players[2].id, 150);

    pot.distribute([[players[0]], [players[1]], [players[2]]]);
    expect(players[0].chips).toEqual(150);
    expect(players[1].chips).toEqual(200);
    expect(players[2].chips).toEqual(0);
    expect(players[3].chips).toEqual(0);
  });

  it('splits a pot', () => {
    pot.placeBet(players[0].id, 100);
    pot.placeBet(players[1].id, 100);
    pot.placeBet(players[2].id, 100);

    pot.distribute([[players[0], players[1]], [players[2]]]);
    expect(players[0].chips).toEqual(150);
    expect(players[1].chips).toEqual(150);
    expect(players[2].chips).toEqual(0);
    expect(players[3].chips).toEqual(0);
  });

  it('splits a pot that has multiple winners', () => {
    pot.placeBet(players[0].id, 100);
    pot.placeBet(players[1].id, 100);
    pot.placeBet(players[2].id, 50);
    pot.placeBet(players[3].id, 50);

    pot.distribute([[players[2], players[3]], [players[0], players[1]]]);
    expect(players[0].chips).toEqual(50);
    expect(players[1].chips).toEqual(50);
    expect(players[2].chips).toEqual(100);
    expect(players[3].chips).toEqual(100);
  });

  it('splits a pot that has multiple winners but the first winner cant take it all', () => {
    players.push(new RoundPlayer(new TablePlayer('4')));
    zeroOutChips();

    pot.placeBet(players[0].id, 1);
    pot.placeBet(players[1].id, 2);
    pot.placeBet(players[2].id, 3);
    pot.placeBet(players[3].id, 4);
    pot.placeBet(players[4].id, 4);

    pot.distribute([[players[1], players[3]], [players[4]]]);
    expect(players[0].chips).toEqual(0);
    expect(players[1].chips).toEqual(5);
    expect(players[2].chips).toEqual(0);
    expect(players[3].chips).toEqual(9);
    expect(players[4].chips).toEqual(0);
  });

  it('splits a pot with uneven distribution', () => {
    players.push(new RoundPlayer(new TablePlayer('4')));
    zeroOutChips();

    pot.placeBet(players[0].id, 25);
    pot.placeBet(players[1].id, 25);
    pot.placeBet(players[2].id, 25);
    pot.placeBet(players[3].id, 25);
    pot.placeBet(players[4].id, 1);

    pot.distribute([[players[0], players[1], players[2]]]);
    expect(players[0].chips).toEqual(34);
    expect(players[1].chips).toEqual(34);
    expect(players[2].chips).toEqual(33);
    expect(players[3].chips).toEqual(0);
  });

  it('splits a third users money with 2 people who tied', () => {
    pot.placeBet(players[0].id, 100);
    pot.placeBet(players[1].id, 100);
    pot.placeBet(players[2].id, 50);

    pot.distribute([[players[0], players[1]]]);
    expect(players[0].chips).toEqual(125);
    expect(players[1].chips).toEqual(125);
    expect(players[2].chips).toEqual(0);
  });

  describe('cachedTotal', () => {
    it('returns the pot total even after distribution', () => {
      pot.placeBet(players[0].id, 50);
      pot.placeBet(players[2].id, 50);
      pot.placeBet(players[3].id, 50);

      pot.distribute([[players[0]], [players[1]], [players[2]]]);
      expect(pot.cachedTotal).toEqual(150);
    });
  })
});
