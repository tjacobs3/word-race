import React from "react";

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import CommunityCards from './community_cards';
import Card from './card';
import ChipValue from './chip_value';
import CurrentActionButton from './ui/current_action_button';
import { Player, PlayingCard, Round } from "./constants";

type Props = {
  currentRound: Round;
}

export default class Showdown extends React.Component<Props> {
  renderCard(card: PlayingCard, i: number) {
    return (
      <Card card={card} key={i} />
    );
  }

  currentActionId() {
    if (this.props.currentRound.showdown?.currentActionId) return this.props.currentRound.showdown.currentActionId;
  }

  renderCurrentActionStatus(playerId: string) {
    if (this.currentActionId() === playerId) {
      return <CurrentActionButton />;
    }
  }

  renderShowdownPlayer = (player: Player) => {
    return (
      <Col xs="auto" className="d-flex justify-content-center px-2" key={player.id}>
        <div className="showdown-player-area">
          {this.renderCurrentActionStatus(player.id)}
          <div className="text-center">
            <strong>{player.id}</strong>
          </div>
          <div className="mt-2 d-flex justify-content-center">
            {player.hand?.map((card, i) => this.renderCard(card, i))}
          </div>
          <div className="mt-2 text-center">
            &nbsp;{player.handName}&nbsp;
          </div>

          {this.renderEarnings(player.winnings || 0)}
        </div>
      </Col>
    );
  }

  renderEarnings(amount: number) {
    // Always render even if its hidden as opposed to returning nothing.
    // This ensures the chip value is animated from 0 to the amount when actually shown
    const displayClass = (!amount || amount === 0) ? "invisible" : "";

    return (
      <div className={`mt-2 text-center ${displayClass}`}>
        <span>Earnings: </span>
        <span className="h5">
          <ChipValue chips={amount || 0} />
        </span>
      </div>
    )
  }

  render() {
    const { currentRound } = this.props;

    return (
      <div className="showdown-container">
        <h1 className="text-center">Total Pot: <ChipValue chips={currentRound.pot} /></h1>
        <div className="pt-2 pb-5">
          <CommunityCards cards={currentRound.communityCards} />
        </div>
        <Row className="mt-2 justify-content-around">
          {currentRound.showdown?.players.map(this.renderShowdownPlayer)}
        </Row>
      </div>
    );
  }
}
