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
import PreviousWords from "./score_board/previous_words";
import MobileScoreBoard from "./ui/mobile_score_board";
import MobileCountDown from "./ui/mobile_count_down";
import MobilePreviousWord from "./ui/mobile_previous_word";
import { Container } from "react-bootstrap";

type Props = {
  admin: boolean;
  playerId: string;
  roomCode: string;
  socket: Socket
};

export default class WordRace extends React.Component<Props, GameState> {
  state: GameState = {
    players: [],
    ownerId: ''
  }

  isOwner = () => this.state.ownerId === this.props.playerId;

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
        <Container className="text-center my-5">
          {this.isOwner() && (
            <React.Fragment>
              <h5>Waiting for more players to join.</h5>
              <h5>When you are ready to start the game, press START!</h5>
            </React.Fragment>
          )}
          {!this.isOwner() && (
            <h5>Waiting for the host to start the game.</h5>
          )}
          <div>
            <div className="alert alert-info my-5 d-inline-block">
              Your room code is <strong>{this.props.roomCode}</strong>
            </div>
          </div>
          {this.isOwner() && <button className="btn btn-light mb-5 start-button" onClick={this.startGame}>START</button>}
          <PlayerList players={this.state.players} />
        </Container>
      );
    }
  }

  renderGame() {
    if (!this.state.game) return;

    if (this.state.game.gameEnded) {
      return <GameEnd gameState={this.state} onStartNewGame={this.isOwner() ? this.startGame : undefined} />;
    }

    const alignChildren = (
      <div className="d-none d-sm-block">
        <ScoreBoard gameState={this.state} />
        <CountDown nextWordAt={this.state.game?.nextWordAt} roundEndAt={this.state.game?.roundEndAt} />
        <PreviousWords previousWords={this.state.game.previousWords} />
      </div>
    );

    return (
      <React.Fragment>
        <WordInput
          alignChildren={alignChildren}
          wordLength={5}
          previousGuesses={this.state.game?.guesses[this.props.playerId] || []}
          onSubmit={this.submitGuess}
        >
          <div className="d-flex d-sm-none justify-content-between">
            <div>
              <MobileScoreBoard gameState={this.state} playerId={this.props.playerId} />
            </div>
            <div>
              <MobilePreviousWord previousWords={this.state.game.previousWords} />
              <MobileCountDown nextWordAt={this.state.game?.nextWordAt} roundEndAt={this.state.game?.roundEndAt} />
            </div>
          </div>

        </WordInput>
      </React.Fragment>
    )
  }

  render() {
    return (
      <div className="game game-grid flex-column justify-content-start align-items-center">
        {this.renderGame()}
        {this.renderControls()}
      </div>
    );
  }
}
