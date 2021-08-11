import Round from './round';
import TablePlayer from './table_player';

export default class HoldEm {
  players: TablePlayer[];
  dealerIndex: number;
  smallBlindAmount: number;
  bigBlindAmount: number;
  chipValue: number;
  onGameAutoUpdated: () => void;
  currentRound?: Round;

  constructor(onGameAutoUpdated: () => void) {
    this.players = [];
    this.currentRound = null;
    this.dealerIndex = 0;
    this.smallBlindAmount = 1;
    this.bigBlindAmount = 2;
    this.chipValue = 0;
    this.onGameAutoUpdated = onGameAutoUpdated;
  }

  get dealer() {
    return this.playerAtIndex(this.dealerIndex);
  }

  eligiblePlayersForRound() {
    return this.players.filter(player => player.eligibleForRound());
  }

  canStartRound() {
    return this.eligiblePlayersForRound().length > 1;
  }

  playerAtIndex(i: number) {
    return this.players[i % this.players.length];
  }

  performAction() {
    if (!this.currentRound) return;
    this.currentRound.check();
  }

  deal() {
    if (!this.currentRound) return;
    this.currentRound.startBettingRound();
  }

  giveChipsToPlayer(id: string, amount: string) {
    const parsedAmount = parseInt(amount);
    const player = this.findPlayer(id);
    if (!Number.isInteger(parsedAmount) || !player) return;

   player.giveChips(parsedAmount);
  }

  takeChipsFromPlayer(id: string, amount: string) {
    const parsedAmount = parseInt(amount);
    const player = this.findPlayer(id);
    if (!Number.isInteger(parsedAmount) || !player) return;

    player.takeChips(parsedAmount);
  }

  endRound() {
    if (this.currentRound && !this.currentRound.isComplete) return;

    this.currentRound = null;
  }

  startNewRound() {
    if ((this.currentRound && !this.currentRound.isComplete) || !this.canStartRound()) return;

    // Progress the dealer index if the current dealer is not eligible
    if (!this.dealer.eligibleForRound()) this.progressToNextEligibleDealer();

    // The round expects the first player to be the dealer, so make a new array
    // here which has the dealer as the first player
    const playersForRound = [];
    for(let i = 0; i < this.players.length; i++) {
      const playerToAdd = this.playerAtIndex(i + this.dealerIndex);
      if (playerToAdd.eligibleForRound())
        playersForRound.push(this.playerAtIndex(i + this.dealerIndex));
    }

    this.currentRound = new Round(playersForRound, {
      smallBlindAmount: this.smallBlindAmount,
      bigBlindAmount: this.bigBlindAmount,
      onRoundComplete: this.onRoundComplete.bind(this),
      onGameAutoUpdated: this.onGameAutoUpdated
    });
  }

  findPlayer(id: string) {
    return this.players.find(player => player.id === id);
  }

  updateGameSettings(settings: { smallBlindAmount: string, bigBlindAmount: string, chipValue: string }) {
    this.smallBlindAmount = parseInt(settings.smallBlindAmount);
    this.bigBlindAmount = parseInt(settings.bigBlindAmount);
    this.chipValue = parseFloat(settings.chipValue);
  }

  progressToNextEligibleDealer() {
    this.dealerIndex++;
    while (!this.dealer.eligibleForRound()) this.dealerIndex++;
  }

  onRoundComplete() {
    this.progressToNextEligibleDealer();
  }

  addPlayer(player: TablePlayer) {
    this.players.push(player)
  }
}
