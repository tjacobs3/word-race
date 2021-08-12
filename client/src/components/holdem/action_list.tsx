import React from "react"
import { Socket } from "socket.io-client"

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ChipValue from './chip_value';
import RaiseInput from './raise_input'

import {
  ACTION__CALL,
  ACTION__CHECK,
  ACTION__FOLD,
  ACTION__START_ROUND,
  ACTION__END_ROUND,
  ACTION__RAISE,
  ACTION__MUCK,
  ACTION__REVEAL,
  ACTION__WAIT_FOR_PLAYERS,
  PlayerAction
} from './constants';

type Props = {
  actions: PlayerAction
  socket: Socket
};

type State = {
  inputtingRaise: boolean;
}

export default class ActionList extends React.Component<Props, State> {
  state: State = {
    inputtingRaise: false
  }

  handleAction = (action: string, payload?: Object) => {
    this.props.socket.emit(action, payload);
  }

  handleRaiseCancel = () => {
    this.setState({ inputtingRaise: false });
  };

  handleRaise = (amount: number) => {
    this.setState({ inputtingRaise: false });
    this.props.socket.emit(ACTION__RAISE, amount);
  }

  renderButton = (action: string, label: string) => {
    return <Button onClick={() => this.handleAction(action)} variant="light">{label}</Button>;
  }

  renderCallButton = (raiseAmount: number, isAllIn: boolean) => {
    return (
      <Button onClick={() => this.handleAction(ACTION__CALL)} variant="light">
        <span>Call </span>
        <ChipValue chips={raiseAmount} />
        <span>{isAllIn ? " (All-In)" : ""}</span>
      </Button>
    );
  }

  renderRaiseButton() {
    return (
      <Button onClick={() => this.setState({ inputtingRaise: true})}>
        Raise
      </Button>
    );
  }

  renderAction(action: string) {
    switch(action) {
      case ACTION__CALL:
        const { raiseAmount, isAllIn } = this.props.actions.actionMetadata[ACTION__CALL]
        return this.renderCallButton(raiseAmount, isAllIn);
      case ACTION__CHECK:
        return this.renderButton(action, 'Check');
      case ACTION__FOLD:
        return this.renderButton(action, 'Fold');
      case ACTION__MUCK:
        return this.renderButton(action, 'Muck');
      case ACTION__REVEAL:
        return this.renderButton(action, 'Reveal');
      case ACTION__RAISE:
        return this.renderRaiseButton();
      case ACTION__END_ROUND:
        return this.renderButton(action, 'End Round');
      case ACTION__START_ROUND:
        return this.renderButton(action, 'Start a round of Hold \'em');
      case ACTION__WAIT_FOR_PLAYERS:
        return <span>Waiting For More Players</span>;
      default:
        return;
    }
  }

  renderBody() {
    if (this.state.inputtingRaise) {
      return (
        <div className="justify-content-center action-list-inner">
          <RaiseInput
            min={this.props.actions.actionMetadata[ACTION__RAISE].min}
            max={this.props.actions.actionMetadata[ACTION__RAISE].max}
            onCancel={this.handleRaiseCancel}
            onRaise={this.handleRaise}
          />
        </div>
      );
    }

    const actionButtons = this.props.actions.actionList.map((action, i) => {
      return <Col className="my-2" key={i} xs="auto">{this.renderAction(action)}</Col>;
    });

    return <Row className="justify-content-center action-list-inner">{actionButtons}</Row>;
  }

  render() {
    return (
      <div className="action-list-container">
        {this.renderBody()}
      </div>
    );
  }
}
