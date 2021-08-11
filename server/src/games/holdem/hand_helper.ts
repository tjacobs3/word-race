import { keys, reduce, includes, values, find, lowerCase, concat } from 'lodash';
import RoundPlayer from './round_player';

import PokerSolver from 'pokersolver';
const Hand = PokerSolver.Hand;

export default class HandHelper {
  static chooseWinners(communityCards, players: RoundPlayer[]) {
    let playerIdToHandMap: { [index: string]: any[] } = {};
    let winners = [];

    // Build pokersolve hands for each player
    players.map(player => {
      const hand = this.solveHand(concat(player.hand, communityCards));
      playerIdToHandMap[player.id] = hand;
      return hand;
    });

    // Build a tiered list of winners
    while (keys(playerIdToHandMap).length > 0) {
      const currentWinners = this.winnersForHands(players, playerIdToHandMap);
      winners.push(currentWinners);
      currentWinners.forEach((currentWinner) => { delete playerIdToHandMap[currentWinner.id] })
    }

    return winners;
  }

  // Returns the winning players for a set of hands
  static winnersForHands(players: RoundPlayer[], playerIdToHandMap: { [index: string]: any[] }) {
    const winners = Hand.winners(values(playerIdToHandMap));
    return reduce(playerIdToHandMap, (result, hand, id) => {
      if (includes(winners, hand)) {
        const player = find(players, player => player.id == id)
        result.push(player);
      }
      return result;
    }, []);
  }

  static solveHand(cards) {
    return Hand.solve(this.shuffleToPokerSolver(cards))
  }

  // Converts "shuffle" cards to "pokersolver" syntax
  static shuffleToPokerSolver(cards) {
    return cards.map((card) => {
      let value;
      switch(card.sort){
        case 10:
          value = 'T';
          break;
        case 11:
          value = 'J';
          break;
        case 12:
          value = 'Q';
          break;
        case 13:
          value = 'K';
          break;
        case 14:
          value = 'A';
          break;
        default:
          value = card.sort;
      }

      const suit = lowerCase(card.suit.substring(0, 1));

      return value + suit;
    });
  }
}
