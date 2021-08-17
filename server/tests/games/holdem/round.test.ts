import Round from '../../../src/games/holdem/round';
import TablePlayer from '../../../src/games/holdem/table_player';

jest.useFakeTimers();

function waitForDeal() {
  jest.runAllTimers();
};

function waitForGameEnd() {
  jest.runAllTimers();
};

describe('a round with a normal amount of players', () => {
  let round: Round, tablePlayers: TablePlayer[];
  const onGameAutoUpdated = jest.fn();
  const smallBlindAmount = 1;
  const bigBlindAmount = 2

  function equalizeChips(amount) {
    tablePlayers.forEach(player => player.setChips(amount));
  }

  beforeEach(() => {
    tablePlayers = [
      new TablePlayer('a'),
      new TablePlayer('b'),
      new TablePlayer('c'),
      new TablePlayer('d'),
      new TablePlayer('e')
    ];

    equalizeChips(100);

    round = new Round(tablePlayers, { smallBlindAmount, bigBlindAmount, onGameAutoUpdated });
  });

  describe('round 0', () => {
    describe('startBettingRound', () => {
      it('auto deals two cards to each player', () => {
        round.players.forEach(player => expect(player.hand).toHaveLength(2));
      });

      it('auto places bets for only the blinds', () => {
        expect(round.players[0].currentBet).toEqual(0);
        expect(round.players[1].currentBet).toEqual(smallBlindAmount);
        expect(round.players[2].currentBet).toEqual(bigBlindAmount);
        expect(round.players[3].currentBet).toEqual(0);
        expect(round.players[4].currentBet).toEqual(0);
      });

      it('starts the action after the big blind', () => {
        expect(round.currentAction).toEqual(round.players[3]);
      });

      it('does not deal any community cards', () => {
        expect(round.communityCards).toHaveLength(0);
      });
    });
  });

  describe('round 1', () => {
    beforeEach(() => {
      // Do nothing to progress to round 1
      round.call();
      round.call();
      round.call();
      round.call();
      round.call();
    });

    describe('startBettingRound', () => {
      it('auto progresses to the correct round', () => {
        round.bettingRoundIndex = 1;
      });

      it('does not deal additional cards to the players', () => {
        round.players.forEach(player => expect(player.hand).toHaveLength(2));
      });

      it('does not auto place any bets', () => {
        round.players.forEach(player => expect(player.currentBet).toEqual(0));
      });

      it('starts the action after the dealer', () => {
        waitForDeal();
        expect(round.currentAction).toEqual(round.players[1]);
      });
    });
  });

  describe('acceptance testing', () => {
    it('example game with no edge cases', () => {
      round.call(); // Player 3 calls, increasing their bet to 2 to match the big blind
      round.raise(4); // Player 4 raises the current bet to 4
      round.call(); // Player 0 (the dealer) calls, increasing their bet to 4
      round.fold(); // Player 1 folds, leaving their small blind of 1 in the pot
      round.call(); // Player 2 calls, increasing their bet to 4
      round.fold(); // Player 3 folds

      // Total pot is 4 + 1 + 4 + 2 + 4 = 15
      // Player 0 and 3 have folded
      // The betting round should have progressed
      expect(round.pot.total).toEqual(15);
      expect(round.players[1].folded).toEqual(true);
      expect(round.players[3].folded).toEqual(true);
      expect(round.bettingRoundIndex).toEqual(1);
      expect(round.bettingRoundStarted).toEqual(false);

      // Start round 2
      waitForDeal();
      expect(round.communityCards).toHaveLength(3);

      round.check(); // Player 2 checks
      round.raise(4); // Player 4 raises to 4
      round.call(); // Player 0 calls to 4
      round.fold(); // Player 2 folds

      // Total pot is 4 + 0 + 4 + 15 = 23
      // Player 0, 2, and 3 have folded
      // The betting round should have progressed
      expect(round.pot.total).toEqual(23);
      expect(round.players[2].folded).toEqual(true);
      expect(round.bettingRoundIndex).toEqual(2);
      expect(round.bettingRoundStarted).toEqual(false);
    });

    it('everyone folds in the beginning such that big blind wins', () => {
      round.fold(); // Player 3 folds
      round.fold(); // Player 4 folds
      round.fold(); // Player 0 folds
      round.fold(); // Player 1 folds
      waitForGameEnd();

      // Total pot is only the small and big blind
      // All players have folded
      // The betting round should have progressed
      expect(tablePlayers[2].chips).toEqual(100 + smallBlindAmount);
      expect(round.players[0].folded).toEqual(true);
      expect(round.players[1].folded).toEqual(true);
      expect(round.players[3].folded).toEqual(true);
      expect(round.players[4].folded).toEqual(true);
      expect(round.isComplete).toEqual(true);
      expect(round.bettingRoundStarted).toEqual(false);
    });

    it('everyone goes all in', () => {
      round.raise(100); // Player 3 goes all in
      round.call(); // Player 4 calls
      round.call(); // Player 0 calls
      round.call(); // Player 1 calls
      round.call(); // Player 2 calls

      expect(round.bettingRoundStarted).toEqual(false);
      expect(round.pot.total).toEqual(100 * 5);

      round.startBettingRound(); // Deal
      // Since everyone is all in, immediately finishes the betting round
      expect(round.bettingRoundStarted).toEqual(false);
    });

    it('the last player to bet raises twice', () => {
      round.call(); // Player 3 calls
      round.call(); // Player 4 calls
      round.call(); // Player 0 calls
      round.call(); // Player 1 calls

      round.raise(4); // Player 2 raises to 4
      round.call(); // Player 3 calls
      round.call(); // Player 4 calls
      round.call(); // Player 0 calls

      round.raise(8); // Player 1 raises to 8
      round.call(); // Player 2 calls
      round.call(); // Player 3 calls
      round.call(); // Player 4 calls
      round.call(); // Player 0 calls

      // Total pot is only the small and big blind
      // All players have folded
      // The betting round should have progressed
      expect(round.pot.total).toEqual(8 * 5);
      expect(round.players[0].folded).toEqual(false);
      expect(round.players[1].folded).toEqual(false);
      expect(round.players[2].folded).toEqual(false);
      expect(round.players[3].folded).toEqual(false);
      expect(round.players[4].folded).toEqual(false);
      expect(round.bettingRoundIndex).toEqual(1);
      expect(round.bettingRoundStarted).toEqual(false);
    });

    it('starts the round with the correct minimum raise and tracks the correct min raise', () => {
      expect(round.minimumRaiseTo).toEqual(4);

      round.raise(8); // Player 3 raises to 8
      expect(round.minimumRaiseTo).toEqual(14); // Raise was from 2 to 8, so the minimum raise to is 8 + 6
      round.call(); // Player 4 calls
      round.call(); // Player 0 calls
      round.call(); // Player 1 calls
      round.call(); // Player 2 calls

      waitForDeal();
      expect(round.minimumRaiseTo).toEqual(2); // Resets the min raise to the big blind
    });

    it('enforces a minimum raise', () => {
      round.raise(3); // Player 3 raises to 3.  This is invalid because the min raise should be to 4
      expect(round.currentAction).toEqual(round.players[3]);
      round.raise(4); // Player 3 raises to 4. This is valid and should progress to player 4
      expect(round.currentAction).toEqual(round.players[4]);
      round.raise(60); // Player 4 raises to 60

      // Player 0 raises to 100.  Even though its not the minimum raise amount of 58,
      // it's still allowed since its "all in"
      round.raise(100); // Player 0 raises to 100

      round.call(); // Player 1 calls
      round.call(); // Player 2 calls
      round.call(); // Player 3 calls
      round.call(); // Player 4 calls

      // Round should be over
      expect(round.bettingRoundStarted).toEqual(false);
      expect(round.pot.total).toEqual(100 * 5);
    });

    it('limits calls to the players chip pool', () => {
      round.players[4].tablePlayer.takeChips(50); // Artificially set to 50 (100 - 50)

      round.raise(100); // Player 3 goes all in
      round.call(); // Player 4 calls

      expect(round.players[4].tablePlayer.chips).toEqual(0);
    });
  });
});
