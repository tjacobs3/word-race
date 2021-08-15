import React, { CSSProperties } from "react"

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import ChipValue from './chip_value';
import Card from './card';
import PlayerArea from './player_area';
import ActionDescriptor from './action_descriptor';
import CurrentActionButton from './ui/current_action_button';
import { Round, Player as PlayerInterface } from "./constants";

type Props = {
  playerIndex: number;
  totalPlayers: number;
  tableHeight: number;
  tableWidth: number;
  currentRound?: Round;
  dealerId?: string;
  ownerId?: string;
  player: PlayerInterface
}

export default class Player extends React.Component<Props> {
  playerAreaHeight: number;
  playerAreaWidth: number;

  constructor(props: Props) {
    super(props);

    this.playerAreaHeight = 220;
    this.playerAreaWidth = 360;
  }

  currentActionId() {
    if (!this.props.currentRound) return undefined;

    return this.props.currentRound.currentActionId;
  }

  renderBottomRow() {
    if (!this.props.player.connected) return <div>Disconnected</div>;
    if (this.props.player.standing && !this.props.player.inCurrentRound) return <div>Standing</div>;

    return this.renderCurrentBet();
  }

  renderCurrentBet() {
    const { currentBet } = this.props.player;
    if (currentBet === null || currentBet === undefined) return;

    return (
      <div>
        Bet: <ChipValue chips={currentBet} />
      </div>
    );
  }

  lastAction() {
    const { currentRound, player } = this.props;
    if (!currentRound || !currentRound.actionHistory) return;

    return currentRound.actionHistory.find(({ playerId }) => playerId === player.id);
  }

  renderLastAction() {
    const lastAction = this.lastAction();
    if (!lastAction) return;

    return <ActionDescriptor action={lastAction} />;
  }

  renderCards() {
    const { player } = this.props;

    if (player.folded) return;

    if (!player.hand) return;

    const cards = player.hand.map((card, i) => <Card card={card} key={i} shadow={true} />);

    return (
      <div className="d-flex justify-content-center">
        {cards}
      </div>
    );
  }

  renderPlayerStatus() {
    if (this.currentActionId() && this.currentActionId() === this.props.player.id) {
      return <CurrentActionButton />;
    }

    if (this.props.dealerId === this.props.player.id) {
      return <div className="player-status dealer">Dealer</div>;
    }
  }

  render() {
    const { totalPlayers, playerIndex, player } = this.props;

    const angleBetweenPlayers = ((2 * Math.PI) / totalPlayers) * -1;
    const width = this.props.tableWidth;
    const height = this.props.tableHeight;
    const rx = width / 2;
    const ry = height / 2;
    let x = Math.cos(angleBetweenPlayers * playerIndex + ((Math.PI * 3) / 2)) * rx;
    let y = Math.sin(angleBetweenPlayers * playerIndex + ((Math.PI * 3) / 2)) * ry;
    let xRatio = rx / Math.abs(x);
    let yRatio = ry / Math.abs(y);

    if ((Math.abs(y) * xRatio) <= ry) {
      x = x * xRatio;
      y = y * xRatio;
    } else {
      x = x * yRatio;
      y = y * yRatio;
    }

    const translateX = ((x + rx) / width) * 100;
    const translateY = ((y + ry) / height) * 100;

    const style: CSSProperties = {
      position: "absolute",
      left: x + rx,
      bottom: y + ry,
      transform: `translateX(-${translateX}%) translateY(${translateY}%)`
    }

    return (
      <PlayerArea player={player} style={style}>
        <div className="player-info">
          {this.renderPlayerStatus()}
          {this.renderLastAction()}
          <Row className="justify-content-around align-items-center top-row">
            <Col xs="auto">
              <h4 className="text-center player-name m-0">
                {player.name}
              </h4>
            </Col>
            <Col xs="auto">
              <ChipValue chips={player.chips} />
            </Col>
          </Row>
          <hr />
          <div className="text-center bottom-row">
            {this.renderBottomRow()}
          </div>
        </div>

        <div className="player-cards">
          {this.renderCards()}
        </div>
      </PlayerArea>
    );
  }
}
