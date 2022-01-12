import React from "react";
import { Socket } from "socket.io-client";
import { ACTION__START_GAME, ACTION__SUBMIT_GUESS } from "./constants";
import WordInput from "./word_input";

type Props = {
  admin: boolean;
  playerId: string;
  roomCode: string;
  socket: Socket
};

type Player = {
  id: string;
  name: string;
}

type Guesses = { [index: string]: string[]; }

type GameState = {
  players: Player[];
  game?: {
    guesses: Guesses
  };
}

export default class WordRace extends React.Component<Props, GameState> {
  state: GameState = {
    players: []
  }

  componentDidMount() {
    this.props.socket.on('gameState', (gameState: GameState) => this.setState(gameState));
  }

  renderPlayer = (player: Player) => {
    const guesses: string[] = this.state.game?.guesses[player.id] || [];

    return (
      <div key={player.id}>
        <div><strong>{player.name}</strong></div>
        {guesses.map(guess => <div key={guess}>{guess}</div>)}
      </div>
    )
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

    return <WordInput onSubmit={this.submitGuess} />
  }

  render() {
    return (
      <div>
        {this.state.players.map(this.renderPlayer)}
        {this.renderControls()}
      </div>
    );
  }
}
