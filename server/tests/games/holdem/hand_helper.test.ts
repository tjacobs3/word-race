import _ from 'lodash';
import Shuffle from 'shuffle';

import HandHelper from '../../../src/games/holdem/hand_helper';
import TablePlayer from '../../../src/games/holdem/table_player';
import RoundPlayer from '../../../src/games/holdem/round_player';

describe('chooseWinners', () => {
  let cards, player1: RoundPlayer, player2: RoundPlayer, player3: RoundPlayer;

  beforeEach(() => {
    cards = Shuffle.playingCards();

    player1 = new RoundPlayer(new TablePlayer('123'));
    player2 = new RoundPlayer(new TablePlayer('456'));
    player3 = new RoundPlayer(new TablePlayer('789'));
  });

  it('chooses the best hand with singular winner', () => {
    const communityCards = cards.slice(0, 5); // 2C through 6C
    player1.hand = cards.slice(5, 7); // 7C, 8C
    player2.hand = cards.slice(7, 9); // 9C, 10C
    player3.hand = cards.slice(9, 11); // 11C, 12C
    const players = [player1, player2, player3];

    const winners = HandHelper.chooseWinners(communityCards, players);
    expect(winners.length).toEqual(2);
    expect(winners[0][0].id).toEqual(player1.id);
    expect(winners[1].length).toEqual(2);
    expect(winners[1].sort()).toEqual([player2, player3].sort());
  });

  it('chooses multiple hands when there are multiple winners', () => {
    const communityCards = [
      cards[0], // 2C
      cards[2], // 4C
      cards[5], // 7C
      cards[14], // 3D
      cards[16], // 5D
    ];
    player1.hand = cards.slice(37, 39); // KH, AH
    player2.hand = cards.slice(50, 52); // KS, AS
    const players = [player1, player2];

    const winners = HandHelper.chooseWinners(communityCards, players);
    expect(winners.length).toEqual(1);
    expect(winners[0].sort()).toEqual(players.sort());
  });

  it('chooses multiple hands when winners are identical', () => {
    const communityCards = cards.slice(0, 5); // 2C, 6C
    player1.hand = cards.slice(7, 9); // 9C, 10C
    player2.hand = cards.slice(9, 11); // 11C, 12C
    const players = [player1, player2];

    const winners = HandHelper.chooseWinners(communityCards, players);
    expect(winners.length).toEqual(1);
    expect(winners[0].sort()).toEqual(players.sort());
  });
});
