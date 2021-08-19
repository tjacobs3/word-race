import _ from 'lodash';
import { Server, Socket } from "socket.io";

import RoomClient from '../../rooms/room_client';
import TablePlayer from './table_player';
import HoldEm from './holdem';
import Showdown from './showdown';

import {
  ACTION__START_ROUND,
  ACTION__END_ROUND,
  ACTION__ADMIN_ADD_AI,
  ACTION__CALL,
  ACTION__CHECK,
  ACTION__FOLD,
  ACTION__RAISE,
  ACTION__REVEAL,
  ACTION__MUCK,
  ACTION__WAIT_FOR_PLAYERS,
  ACTION__OWNER_CHANGE_GAME_SETTINGS,
  ACTION__OWNER_GIVE_CHIPS,
  ACTION__OWNER_TAKE_CHIPS,
  ACTION__SIT,
  ACTION__STAND
} from './constants';

interface SerializedPlayer {
  chips: number;
  id: string;
  name: string;
  connected: boolean;
  standing: boolean;
  hand?: Array<any>;
  currentBet?: number;
  folded?: boolean;
  inCurrentRound?: boolean;
}

export default class HoldEmClient extends RoomClient {
  actionLock: boolean;
  game: HoldEm;

  constructor(server: Server) {
    super(server);
    this.game = new HoldEm(this.onGameAutoUpdated.bind(this));
    this.actionLock = false;
  }

  join(name: string): TablePlayer {
    const player = new TablePlayer(name);
    this.players[player.id] = player;

    if (Object.keys(this.players).length === 1) this.ownerId = player.id;
    this.game.addPlayer(player);

    return player;
  }

  connect(socket: Socket, playerId: string) {
    super.connect(socket, playerId);

    const player = this.players[playerId] as TablePlayer;

    this.sendGameState();

    this.registerGameAction(socket, ACTION__SIT, () => {
      this.performAction(() => player.sit());
    });

    this.registerGameAction(socket, ACTION__STAND, () => {
      this.performAction(() => player.stand());
    });

    this.registerGameAction(socket, ACTION__START_ROUND, () => {
      this.performActionOnOwner(player, () => this.game.startNewRound());
    });

    this.registerGameAction(socket, ACTION__END_ROUND, () => {
      this.performActionOnOwner(player, () => this.game.endRound());
    });

    this.registerGameAction(socket, ACTION__CALL, () => {
      this.performActionOnCurrent(player, () => this.game.currentRound.call());
    });

    this.registerGameAction(socket, ACTION__FOLD, () => {
      this.performActionOnCurrent(player, () => this.game.currentRound.fold());
    });

    this.registerGameAction(socket, ACTION__CHECK, () => {
      this.performActionOnCurrent(player, () => this.game.currentRound.check());
    });

    this.registerGameAction(socket, ACTION__RAISE, (amount) => {
      this.performActionOnCurrent(player, () => this.game.currentRound.raise(amount));
    });

    this.registerGameAction(socket, ACTION__MUCK, () => {
      this.performActionOnCurrentShowdown(player, () => this.game.currentRound.showdown.muck());
    });

    this.registerGameAction(socket, ACTION__REVEAL, () => {
      this.performActionOnCurrentShowdown(player, () => this.game.currentRound.showdown.reveal());
    });

    this.registerGameAction(socket, ACTION__OWNER_CHANGE_GAME_SETTINGS, (gameSettings) => {
      this.performActionOnOwner(player, () => this.game.updateGameSettings(gameSettings));
    });

    this.registerGameAction(socket, ACTION__OWNER_GIVE_CHIPS, (toPlayerId, amount) => {
      this.performActionOnOwner(player, () => {
        this.game.giveChipsToPlayer(toPlayerId, amount);
        this.sendSystemMessage(`${this.nameFor(toPlayerId)} was given ${amount} chips`);
      });
    });

    this.registerGameAction(socket, ACTION__OWNER_TAKE_CHIPS, (fromPlayerId, amount) => {
      this.performActionOnOwner(player, () => this.game.takeChipsFromPlayer(fromPlayerId, amount));
      this.sendSystemMessage(`${amount} chips taken from ${this.nameFor(fromPlayerId)}`);
    })

    this.registerGameAction(socket, ACTION__ADMIN_ADD_AI, () => {
      if (process.env.NODE_ENV === 'production') return;

      this.performActionOnOwner(player, () => {
        for(let i = 0; i < 4; i++) {
          const name = `AI #${this.game.players.length}`;
          const player = new TablePlayer(name);
          player.ai = true;

          this.players[player.id] = player;
          this.game.addPlayer(player);
        }
      });
    });

    socket.on('disconnect', () => {
      this.sendGameState();
    });
  }


  registerGameAction(socket, action, callback) {
    socket.on(action, (...args) => {
      if (this.actionLock) return;

      this.actionLock = true;
      callback(...args);
      this.actionLock = false;
    });
  }

  sendGameState() {
    this.game.players.forEach((gamePlayer) => {
      this.emitToPlayer(gamePlayer.id, 'gameState', this.serializeGameState(gamePlayer));
    });
  }

  performAction(callback: () => void) {
    callback();
    this.sendGameState();
  }

  performActionOnOwner(player: TablePlayer, callback: () => void) {
    if (player.id !== this.ownerId) return;

    callback();
    this.sendGameState();
  }

  performActionOnCurrent(player: TablePlayer, callback: () => void) {
    const currentActionPlayerId = this.game.currentRound?.currentAction.id;
    if (!currentActionPlayerId) return;

    if (this.players[currentActionPlayerId].ai || player.id === currentActionPlayerId) {
      callback();
      this.sendGameState();
    };
  }

  onGameAutoUpdated() {
    this.sendGameState();
  }

  performActionOnCurrentShowdown(player: TablePlayer, callback: () => void) {
    const currentActionPlayerId = this.game.currentRound?.showdown?.currentAction.id;
    if (!currentActionPlayerId) return;

    if (this.players[currentActionPlayerId].ai || player.id === currentActionPlayerId) {
      callback();
      this.sendGameState();
    };
  }

  serializeGameState(gamePlayer: TablePlayer) {
    const { currentRound } = this.game;

    const serializedGame = {
      currentRound: null,
      dealerId: this.game.dealer.id,
      ownerId: this.ownerId,
      actions: this.availableActionsForPlayer(gamePlayer),
      players: this.game.players.map(otherGamePlayer => this.serializePlayer(otherGamePlayer, gamePlayer)),
      gameSettings: {
        smallBlindAmount: this.game.smallBlindAmount,
        bigBlindAmount: this.game.bigBlindAmount,
        chipValue: this.game.chipValue
      }
    }

    if (currentRound) {
      serializedGame.currentRound = {
        pot: currentRound.pot.cachedTotal,
        communityCards: currentRound.communityCards,
        bettingRoundStarted: currentRound.bettingRoundStarted,
        actionHistory: currentRound.bettingRoundActionHistory,
        state: currentRound.state
      };

      if (currentRound.showdown) {
        serializedGame.currentRound.showdown = this.serializeShowdown(currentRound.showdown);
      }
      else if (currentRound.bettingRoundStarted) {
        serializedGame.currentRound.smallBlindId = _.get(currentRound, 'smallBlind.id');
        serializedGame.currentRound.bigBlindId = _.get(currentRound, 'bigBlind.id');
        serializedGame.currentRound.currentActionId = _.get(currentRound, 'currentAction.id');
      }
    }

    return serializedGame;
  }

  serializePlayer(playerToSerializer: TablePlayer, forGamePlayer: TablePlayer) {
    const { currentRound } = this.game;

    const serializedPlayer: SerializedPlayer = {
      chips: playerToSerializer.chips,
      id: playerToSerializer.id,
      name: this.players[playerToSerializer.id].name,
      connected: !!this.playerIsConnected(playerToSerializer.id),
      standing: playerToSerializer.standing
    };

    if (currentRound) {
      const roundPlayer = currentRound.player(playerToSerializer.id);

      if (roundPlayer) {
        let fullAccess = forGamePlayer.id === playerToSerializer.id
        fullAccess = fullAccess || (currentRound.isComplete && !roundPlayer.folded);

        serializedPlayer.hand = this.filterHand(roundPlayer.hand, fullAccess);
        serializedPlayer.currentBet = roundPlayer.currentBet;
        serializedPlayer.folded = roundPlayer.folded;
        serializedPlayer.inCurrentRound = true;
      } else {
        serializedPlayer.folded = true;
        serializedPlayer.hand = [];
        serializedPlayer.currentBet = 0;
      }
    }

    return serializedPlayer;
  }

  serializeShowdown(showdown: Showdown) {
    const players = showdown.roundPlayers.map((roundPlayer) => {
      return {
        id: roundPlayer.id,
        name: this.players[roundPlayer.id].name,
        hand: this.filterHand(roundPlayer.hand, roundPlayer.revealed),
        handName: roundPlayer.revealed ? roundPlayer.solvedHand.name : "",
        winnings: roundPlayer.winnings
      };
    });

    return {
      players,
      currentActionId: showdown.currentAction ? showdown.currentAction.id : null
    };
  }

  availableActionsForPlayer(gamePlayer: TablePlayer) {
    const { currentRound } = this.game;
    const actionMetadata= {};
    const actionList = [];
    const showdown = this.game.currentRound?.showdown;
    const isOwner = gamePlayer.id === this.ownerId;

    if (!this.game.currentRound) {
      if (!this.game.canStartRound()) {
        actionList.push(ACTION__WAIT_FOR_PLAYERS);
      }
      else if (isOwner) {
        actionList.push(ACTION__START_ROUND);
      }
    }

    else if(this.game.currentRound.isComplete) {
      if (isOwner) actionList.push(ACTION__END_ROUND);
    }

    else if(showdown && showdown.currentAction) {
      if (showdown.currentAction.id === gamePlayer.id) {
        if (showdown.canCurrentActionMuck()) actionList.push(ACTION__MUCK);
        actionList.push(ACTION__REVEAL);
      }
    }

    else {
      const currentAction  = currentRound.currentAction;

      if (currentRound.bettingRoundStarted && currentAction.id === gamePlayer.id) {
        const maxChips = currentAction.tablePlayer.chips + currentAction.currentBet;
        const canRaise = currentRound.maxCurrentBet < maxChips;

        actionMetadata[ACTION__RAISE] = {
          min: Math.min(maxChips, currentRound.minimumRaiseTo),
          max: maxChips
        };

        actionMetadata[ACTION__CALL] = {
          isAllIn: currentRound.maxCurrentBet >= maxChips,
          raiseAmount: currentRound.maxCurrentBet
        };

        if (currentAction.currentBet === currentRound.maxCurrentBet) {
          actionList.push(ACTION__CHECK);
        } else {
          actionList.push(ACTION__CALL);
          actionList.push(ACTION__FOLD);
        }

        if (canRaise) actionList.push(ACTION__RAISE);
      }
    }

    return { actionList, actionMetadata };
  }

  filterHand(hand, forceShow: boolean) {
    if (forceShow) return hand;

    return hand.map(() => {
      return { facedown: true }
    });
  }
}

