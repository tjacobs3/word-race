import Showdown from '../../../src/games/holdem/showdown';
import Pot from '../../../src/games/holdem/pot';
import TablePlayer from '../../../src/games/holdem/table_player';
import RoundPlayer from '../../../src/games/holdem/round_player';

describe('Showdown', () => {
  let showdown: Showdown, pot: Pot, players: RoundPlayer[], communityCards: any[], onShowdownComplete: () => void;

  beforeEach(() => {
    pot = new Pot();
    onShowdownComplete = jest.fn();

    players = [
      new RoundPlayer(new TablePlayer('0')),
      new RoundPlayer(new TablePlayer('1')),
      new RoundPlayer(new TablePlayer('2'))
    ];

    players.forEach(player => player.tablePlayer.setChips(0));

    players[0].hand = [{ suit: 'Club', sort: 3}, { suit: 'Heart', sort: 3}]
    players[1].hand = [{ suit: 'Club', sort: 4}, { suit: 'Heart', sort: 4}]
    players[2].hand = [{ suit: 'Club', sort: 5}, { suit: 'Heart', sort: 5}]

    communityCards = [
      { suit: 'Heart', sort: 10 },
      { suit: 'Diamond', sort: 11,},
      { suit: 'Heart', sort: 9 },
      { suit: 'Club', sort: 6 },
      { suit: 'Diamond', sort: 8 }
    ]
  });

  describe('one player in the showdown', () => {
    beforeEach(() => {
      pot.bets = { [players[0].id]: 200, [players[1].id]: 100, [players[2].id]: 50 };
      showdown = new Showdown([players[0]], null, communityCards, pot, onShowdownComplete);
    });

    it('auto distributes to the one player', () => {
      expect(players[0].chips).toEqual(350);
      expect(players[0].winnings).toEqual(350);
    });
  });

  describe('currentAction', () => {
    it('returns nothing when the showdown is complete', () => {
      pot.bets = { [players[0].id]: 100, [players[1].id]: 100 };
      showdown = new Showdown([players[0], players[1]], players[0], communityCards, pot, onShowdownComplete);

      showdown.reveal();
      showdown.reveal();

      expect(showdown.currentAction).toEqual(null);
    });
  });

  describe('canCurrentActionMuck', () => {
    beforeEach(() => {
      pot.bets = { [players[0].id]: 100, [players[1].id]: 100, [players[2].id]: 100 };
      showdown = new Showdown(players, players[1], communityCards, pot, onShowdownComplete);
    });

    it('follows these rules', () => {
      // First player cannot muck
      expect(showdown.canCurrentActionMuck()).toEqual(false);
      showdown.reveal();

      // Second player has a better hand, so they cannot muck
      expect(showdown.canCurrentActionMuck()).toEqual(false);
      showdown.reveal();

      // Last player has a worse hand so they can muck
      expect(showdown.canCurrentActionMuck()).toEqual(true);
    });
  })

  describe('multiple players in the showdown', () => {
    describe('last aggressive actor is supplied', () => {
      it('starts with the player that last took an action', () => {
        showdown = new Showdown(players, players[2], communityCards, new Pot(), onShowdownComplete);
        expect(showdown.roundPlayers).toEqual([players[2], players[0], players[1]]);
      });

      describe('last aggressive player is to the left of the dealer', () => {
        beforeEach(() => {
          pot = new Pot();
          pot.bets = { [players[0].id]: 200, [players[1].id]: 200, [players[2].id]: 50 };
          showdown = new Showdown(players, players[1], communityCards, pot, onShowdownComplete);
        });

        it('starts with the player next to the dealer', () => {
          expect(showdown.roundPlayers).toEqual([players[1], players[2], players[0]]);
        });

        it('chooses a winner between all revealed hands', () => {
          showdown.reveal();
          showdown.reveal();
          showdown.reveal();

          expect(players[0].tablePlayer.chips).toEqual(0);
          expect(players[0].winnings).toEqual(0);
          expect(players[1].tablePlayer.chips).toEqual(300);
          expect(players[1].winnings).toEqual(300);
          expect(players[2].tablePlayer.chips).toEqual(150);
          expect(players[2].winnings).toEqual(150);
        });

        it('doesn\'t include users that muck', () => {
          showdown.muck(); // 1 muck
          showdown.muck(); // 2 muck
          showdown.reveal(); // 0 wins

          expect(players[0].tablePlayer.chips).toEqual(450);
          expect(players[0].winnings).toEqual(450);
          expect(players[1].tablePlayer.chips).toEqual(0);
          expect(players[1].winnings).toEqual(0);
          expect(players[2].tablePlayer.chips).toEqual(0);
          expect(players[2].winnings).toEqual(0);
        });

        it('calls the onShowdownComplete function when done', () => {
          showdown.reveal();
          showdown.reveal();
          showdown.reveal();

          expect(onShowdownComplete).toHaveBeenCalled();
        });
      });
    });
  });
});
