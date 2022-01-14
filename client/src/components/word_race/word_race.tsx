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
        <button onClick={this.startGame}>Start Game!</button>
      );
    }

    return (
      <WordInput
        wordLength={5}
        previousGuesses={this.state.game?.guesses[this.props.playerId] || []}
        onSubmit={this.submitGuess}
      />
    );
  }

  render() {
    return (
      <div className="game">
        <div className="d-flex justify-content-center flex-column align-items-center">
          <div className="game-grid position-relative">
            <ScoreBoard gameState={this.state} />
            {this.renderControls()}
          </div>
        </div>
      </div>
    );
  }
}
