import React from "react";
import { Socket } from "socket.io-client";
import {
    ACTION__START_GAME,
    ACTION__SUBMIT_GUESS,
    GameState
  } from "./constants";
import WordInput from "./word_input";

import './styles.scss';
import ScoreBoard from "./score_board";
import CountDown from "./score_board/count_down";
import PlayerList from "./ui/player_list";
import GameEnd from "./ui/game_end";

type Props = {
  admin: boolean;
  playerId: string;
  roomCode: string;
  socket: Socket
};

export default class WordRace extends React.Component<Props, GameState> {
  state: GameState = {
    players: []
  }

  componentDidMount() {
    this.props.socket.on('gameState', (gameState: GameState) => this.setState(gameState));
  }

  startGame = () => {
    this.props.socket.emit(ACTION__START_GAME);
  }

  submitGuess = (guess: string) => {
    this.props.socket.emit(ACTION__SUBMIT_GUESS, guess);
  }

  renderControls() {
    if (!this.state.game) {
      return (
        <div className="text-center">
          <h5>Waiting for more players to join.</h5>
          <h5>When you are ready to start the game, press START!</h5>
          <div className="alert alert-info my-5">Your room code is <strong>{this.props.roomCode}</strong></div>
          <button className="btn btn-light mb-5 start-button" onClick={this.startGame}>START</button>
          <PlayerList players={this.state.players} />
        </div>
      );
    }
  }

  renderGame() {
    if (!this.state.game) return;

    if (this.state.game.gameEnded) return <GameEnd gameState={this.state} onStartNewGame={this.startGame} />;

    return (
      <React.Fragment>
        <ScoreBoard gameState={this.state} />
        <CountDown nextWordAt={this.state.game?.nextWordAt} roundEndAt={this.state.game?.roundEndAt} />
        <WordInput
          wordLength={5}
          previousGuesses={this.state.game?.guesses[this.props.playerId] || []}
          onSubmit={this.submitGuess}
        />
      </React.Fragment>
    )
  }

  render() {
    return (
      <div className="game">
        <div className="d-flex justify-content-center flex-column align-items-center mt-5">
          <div className="game-grid position-relative">
            {this.renderGame()}
            {this.renderControls()}
          </div>
        </div>
      </div>
    );
  }
}
