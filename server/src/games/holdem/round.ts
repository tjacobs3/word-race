import _ from 'lodash';
import Shuffle from 'shuffle';

import Pot from './pot';
import Showdown from './showdown';
import RoundPlayer from './round_player';
import TablePlayer from './table_player';

export const ROUND_STATE__STARTED = 'started';
export const ROUND_STATE__SHOWDOWN = 'showdown';
export const ROUND_STATE__OVER = 'over';
export const AUTO_DEAL_TIMER = 3000;

interface ActionItem {
  playerId: string;
  id: number;
  action: string;
  data?: Object
}

export default class Round {
  players: RoundPlayer[];
  communityCards: any[];
  bettingRoundIndex: number;
  bettingRoundActionHistory: ActionItem[];
  actionCounter: number;
  bettingRoundStarted: boolean;
  currentActionIndex: number;
  smallBlindAmount: number;
  bigBlindAmount: number;
  onRoundComplete: () => void;
  onGameAutoUpdated: () => void;
  deck: any;
  pot: Pot;
  state: string;
  lastBettingRoundAggressiveAction?: RoundPlayer;
  minimumRaise: number;
  showdown?: Showdown;


  constructor(
    tablePlayers: TablePlayer[],
    options: {
      smallBlindAmount?: number,
      bigBlindAmount?: number,
      onRoundComplete?: () => void,
      onGameAutoUpdated?: () => void
    } = {}
  ) {
    this.players = tablePlayers.map(tablePlayer => new RoundPlayer(tablePlayer));
    this.communityCards = [];
    this.bettingRoundIndex = 0;
    this.bettingRoundActionHistory = [];
    this.actionCounter = 0;
    this.bettingRoundStarted = false;
    this.currentActionIndex = 1; // Always start to the left of the dealer
    this.smallBlindAmount = options.smallBlindAmount || 1;
    this.bigBlindAmount = options.bigBlindAmount || 2;
    this.onRoundComplete = options.onRoundComplete;
    this.onGameAutoUpdated = options.onGameAutoUpdated;
    this.deck = Shuffle.shuffle();
    this.pot = new Pot();
    this.state = ROUND_STATE__STARTED;
    this.lastBettingRoundAggressiveAction = null;
    this.minimumRaise = 0;

    // Finally, auto deal the cards to the players
    this.startBettingRound();
  }

  get dealer() {
    return this.playerAtIndex(0);
  }

  get smallBlind() {
    if (this.bettingRoundIndex !== 0) return {};

    return this.playerAtIndex(1);
  }

  get bigBlind() {
    if (this.bettingRoundIndex !== 0) return {};

    return this.playerAtIndex(2);
  }

  get minimumRaiseTo() {
    return this.maxCurrentBet + this.minimumRaise;
  }

  get currentAction() {
    return this.playerAtIndex(this.currentActionIndex);
  }

  get maxCurrentBet() {
    return _.max(this.players.map(player => player.currentBet));
  }

  get isComplete() {
    return this.state === ROUND_STATE__OVER;
  }

  get nonFoldedPlayers() {
    return _.reject(this.players, 'folded');
  }

  get playersThatCanTakeAnAction() {
    return _.filter(this.nonFoldedPlayers, player => player.canTakeAction());
  }

  player(id: string) {
    return this.players.find(player => player.id === id);
  }

  call() {
    this.currentAction.callTo(this.maxCurrentBet);

    this.logAction('call', { bet: this.currentAction.currentBet });
    this.progressAction();
  }

  check() {
    this.logAction('check', {});
    this.progressAction();
  }

  fold() {
    this.currentAction.folded = true;
    this.logAction('fold', {});
    this.progressAction();
  }

  raise(amount: number, isBlind = false) {
    const raiseBy = amount - this.currentAction.currentBet;
    const isAllIn = raiseBy === this.currentAction.chips;

    // Verify raise amount
    if (!isBlind && !isAllIn) {  // Blinds and All In don't have to meet these requirements
      if (amount < this.minimumRaiseTo) return; // Didn't meet the minimum raise
      if (raiseBy > this.currentAction.chips) return; // Trying to raise by more chips than they have
    }

    if (!isBlind) this.minimumRaise = amount - this.maxCurrentBet;
    this.currentAction.raiseBet(raiseBy);

    if (this.bettingRoundIndex === 3) this.lastBettingRoundAggressiveAction = this.currentAction;

    if (!isBlind) this.logAction('raise', { bet: this.currentAction.currentBet });
    this.progressAction(!isBlind);
  }

  progressAction(countsAsAction = true) {
    if (countsAsAction) this.currentAction.takenAction = true;

    this.currentActionIndex++;

    // If all other players have folded, immediately end the round
    if (this.nonFoldedPlayers.length === 1) {
      this.endBettingRound();
      return;
    }

    // If we've gone around the table, end the betting round
    if (this.currentAction.takenAction && this.currentAction.currentBet == this.maxCurrentBet) {
      this.endBettingRound();
      return;
    }

    if (!this.currentAction.canTakeAction()) {
      this.progressAction();
      return;
    }
  }

  playerAtIndex(i: number) {
    return this.players[i % this.players.length];
  }

  dealCardsToPlayers() {
    this.players.forEach((player) => {
      player.hand = this.deck.draw(2);
    });
  }

  addCommunityCards(num: number) {
    this.communityCards = this.communityCards.concat(this.deck.draw(num));
  }

  startingIndex(): number | null {
    let index = null;

    this.players.forEach((player, i) => {
      if (i > 0 && !player.folded && player.chips > 0 && (index === null || i < index)) index = i;
    });

    return index;
  }

  startBettingRound() {
    this.currentActionIndex = this.startingIndex();
    this.minimumRaise = this.bigBlindAmount;

    this.bettingRoundStarted = true;

    if (this.bettingRoundIndex === 0) {
      this.dealCardsToPlayers();
      this.raise(this.smallBlindAmount, true);
      this.raise(this.bigBlindAmount, true);
    }

    if (this.bettingRoundIndex === 1) this.addCommunityCards(3);
    if (this.bettingRoundIndex === 2) this.addCommunityCards(1);
    if (this.bettingRoundIndex === 3) this.addCommunityCards(1);

    // If no one can take an action, immediately progress to the next betting round
    if (this.currentActionIndex === null || this.playersThatCanTakeAnAction.length === 1) {
      this.endBettingRound();
      return;
    }
  }

  endBettingRound() {
    this.bettingRoundStarted = false;

    this.players.forEach((player) => {
      this.pot.placeBet(player.id, player.currentBet);
      player.resetCurrentBet();
      player.takenAction = false;
    });
    this.bettingRoundIndex++;

    // Detect end game states
    if (this.bettingRoundIndex > 3 || this.nonFoldedPlayers.length === 1) {
      setTimeout(() => {
        this.startShowdown();
        this.onGameAutoUpdated();
      }, AUTO_DEAL_TIMER);
      return;
    }

    // Else auto start the next betting round
    setTimeout(() => {
      this.startBettingRound();
      this.onGameAutoUpdated();
    }, AUTO_DEAL_TIMER);
  }

  startShowdown() {
    this.state = ROUND_STATE__SHOWDOWN;

    this.showdown = new Showdown(
      this.nonFoldedPlayers,
      this.lastBettingRoundAggressiveAction || this.nonFoldedPlayers.find(player => player !== this.dealer),
      this.communityCards,
      this.pot,
      this.endRound.bind(this)
    );
  }

  endRound() {
    this.state = ROUND_STATE__OVER;

    // Run callbacks for game end
    if (this.onRoundComplete) this.onRoundComplete();
  }

  logAction(action, data) {
    this.actionCounter++;

    this.bettingRoundActionHistory.unshift({
      playerId: this.currentAction.id,
      id: this.actionCounter,
      action,
      data
    });
  }
}
