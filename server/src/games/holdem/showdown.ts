import _ from 'lodash';
import HandHelper from './hand_helper';
import Pot from './pot.js';
import RoundPlayer from './round_player';

export default class Showdown {
  roundPlayers: RoundPlayer[];
  currentActionIndex: number;
  communityCards: any[];
  pot: Pot;
  onShowdownComplete: () => void;
  completed: boolean;

  constructor(
    roundPlayers: RoundPlayer[],
    lastAggressivePlayer: RoundPlayer,
    communityCards: any[],
    pot: Pot,
    onShowdownComplete: () => void
  ) {
    this.roundPlayers = [...roundPlayers];
    this.currentActionIndex = 0;
    this.communityCards = communityCards;
    this.pot = pot;
    this.onShowdownComplete = onShowdownComplete;
    this.completed = false;

    if (this.roundPlayers.length === 1) {
      this.finishShowdown();
    } else {
      let lastAggressivePlayerIndex = this.roundPlayers.findIndex(({ id }) => {
        return id === lastAggressivePlayer.id;
      });

      for(let i = 0; i < lastAggressivePlayerIndex; i++) {
        this.roundPlayers.push(this.roundPlayers.shift());
      }
    }
  }

  get currentAction() {
    if (this.completed) return null;

    return this.roundPlayers[this.currentActionIndex];
  }

  canCurrentActionMuck() {
    const revealedPlayers = this.roundPlayers.filter(({ id, revealed }) => {
      return revealed && this.pot.betForPlayer(id) >= this.pot.betForPlayer(this.currentAction.id)
    });
    if (revealedPlayers.length === 0) return false;

    const currentWinners = HandHelper.chooseWinners(this.communityCards, revealedPlayers.concat(this.currentAction));

    return !currentWinners[0].find(({ id }) => id === this.currentAction.id);
  }

  reveal() {
    this.currentAction.revealed = true;
    this.currentAction.solvedHand = HandHelper.solveHand(_.concat(this.currentAction.hand, this.communityCards));
    this.progressAction();
  }

  muck() {
    this.progressAction();
  }

  progressAction() {
    this.currentActionIndex++;

    if (this.currentActionIndex === this.roundPlayers.length) this.finishShowdown();
  }

  finishShowdown() {
    let eligiblePlayers = this.roundPlayers;
    if (eligiblePlayers.length > 1) {
      eligiblePlayers = eligiblePlayers.filter(player => player.revealed);
    }

    const winners = HandHelper.chooseWinners(this.communityCards, eligiblePlayers);

    this.pot.distribute(winners);
    this.completed = true;

    this.onShowdownComplete();
  }
}

