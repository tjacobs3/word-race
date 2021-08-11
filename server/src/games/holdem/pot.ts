import { each, pickBy, min } from 'lodash';
import RoundPlayer from './round_player';

/**
 * The general idea for this is to track how much each player has individually bet
 * as { id => amount }, example, if player with id '1' bets 100 and player '2' bets 300 then store the bets
 * as { '1' => 200, '2' => 300 }.
 *
 * When it comes time to distribute, generate sub pots calculated by who has put in what money
 * Example, bets is { '1' => 50, '2' => 100, '3' => 100 }.  Since '1' has only put in 50, we need to make two pots
 * where 1 2 3 are in for 150, and then 2 3 are in for the remaing 100
 *
 * Then each of those subPots are fed a list of winners and it will divvy up the total from the subpot to
 * the eligible winners
 */

class SubPot {
  playerIds: string[];
  total: number;

  constructor(playerIds: string[], total: number) {
    this.playerIds = playerIds;
    this.total = total;
  }

  distribute(rankedPlayers: RoundPlayer[][]) {
    each(rankedPlayers, (winners) => {
      const eligibleWinners = winners.filter(({ id }) => this.playerIds.includes(id));
      if (this.total === 0 || eligibleWinners.length === 0) return;

      const amountForEachPlayer = Math.floor(this.total / eligibleWinners.length);
      each(eligibleWinners, (player) => {
        this.giveAmountToPlayer(player, amountForEachPlayer);
        this.total -= amountForEachPlayer;
      });

      each(eligibleWinners, (player) => {
        if (this.total === 0) return;

        this.giveAmountToPlayer(player, 1);
        this.total -= 1;
      });
    });
  }

  giveAmountToPlayer(player: RoundPlayer, amount: number) {
    player.giveChips(amount);
    player.winnings += amount;
  }
}

export default class Pot {
  bets: { [index: string]: number };
  savedTotal: number;

  constructor() {
    this.bets = {};
  }

  // returns the total even after divvying up the winnings
  get cachedTotal() {
    if (this.savedTotal) return this.savedTotal;

    return this.total;
  }

  get total() {
    let runningTotal = 0;
    Object.keys(this.bets).forEach((id) => {
      runningTotal += this.bets[id] || 0;
    });

    return runningTotal;
  }

  placeBet(id: string, amount: number) {
    this.bets[id] = (this.bets[id] || 0) + amount;
  }

  betForPlayer(id: string) {
    return this.bets[id] || 0;
  }

  // A 2d list of ranked list of players. Anyone tied should appear in the same list
  // Ex, Player 1 and Player 2 tie, Player 3 comes in second, Player 4 in last
  // [[P1, P2], [P3], [P4]]
  distribute(rankedPlayers: RoundPlayer[][]) {
    this.savedTotal = this.total; // Save the total so it can be read out after distributing winnings

    const x = this.createSubPots(this.bets);

    each(x, (subPot) => {
      subPot.distribute(rankedPlayers);
    });

    this.bets = {};
  }

  createSubPots(bets: { [index: string]: number }): SubPot[] {
    bets = pickBy(bets, bet => bet > 0);
    if (Object.keys(bets).length == 0) return [];

    const minBet = min(Object.values(bets));
    const eligiblePlayerIds = Object.keys(bets);
    let subPotTotal = 0;

    each(Object.keys(bets), (id) => {
      bets[id] -= minBet;
      subPotTotal += minBet;
    });

    const subPot = new SubPot(eligiblePlayerIds, subPotTotal);
    const subPots = this.createSubPots(bets);

    subPots.push(subPot);

    return subPots;
  }
}
