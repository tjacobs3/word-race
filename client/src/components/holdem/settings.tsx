import React from 'react';

import { Modal, Form, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

import PlayerChipModifier from './player_chip_modifier';
import { GameSettings, Player } from './constants';

type Props = {
  gameSettings: GameSettings;
  players: Player[];
  roundInProgress: boolean;
  onUpdateGameSettings: (newSettings: GameSettings) => void;
  onGiveChips: (playerId: string, amount: number) => void;
  onTakeChips: (playerId: string, amount: number) => void;
};

type State =  {
  show: boolean;
  gameSettings: GameSettings;
  takingFromPlayer?: Player;
  givingToPlayer?: Player;
}

export default class Settings extends React.Component<Props, State> {
  state: State = {
    show: false,
    gameSettings: this.props.gameSettings
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.gameSettings !== prevProps.gameSettings) {
      this.setState({ gameSettings: this.props.gameSettings });
    }
  }

  showModal = () => {
    this.setState({ show: true });
  }

  hideModal = () => {
    this.cancelPlayerUpdate();
    this.setState({ show: false });
  }

  handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState((prevState) => {
      return {
        gameSettings: {
          ...prevState.gameSettings,
          [name]: value
        }
      };
    });
  }

  save = () => {
    this.props.onUpdateGameSettings(this.state.gameSettings);
    this.hideModal();
  }

  giveChipsToPlayer = (playerId: string, amount: number) => {
    this.props.onGiveChips(playerId, amount);
    this.cancelPlayerUpdate();
  }

  takeChipsFromPlayer = (playerId: string, amount: number) => {
    this.props.onTakeChips(playerId, amount);
    this.cancelPlayerUpdate();
  }

  startTakingChipsFromPlayer = (player: Player) =>  this.setState({ takingFromPlayer: player })
  startGivingChipsToPlayer = (player: Player) => this.setState({ givingToPlayer: player })
  cancelPlayerUpdate = () => this.setState({ takingFromPlayer: undefined, givingToPlayer: undefined })

  renderPlayers() {
    const playerList = this.props.players.map((player) => {
      return (
        <tr key={player.id}>
          <td>
            {player.name}
          </td>
          <td>
            {player.chips}
          </td>
          <td className="text-right">
            <Button
              className="mr-2"
              size="sm"
              onClick={() => this.startTakingChipsFromPlayer(player)}
              variant="link"
            >
              Take Chips
            </Button>
            <Button
              size="sm"
              variant="link"
              onClick={() => this.startGivingChipsToPlayer(player)}
            >
              Give Chips
            </Button>
          </td>
        </tr>
      );
    });

    return (
      <Table striped hover size="sm">
        <thead>
          <tr>
            <th>Player</th>
            <th>Chips</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {playerList}
        </tbody>
      </Table>
    )
  }

  renderBody() {
    if (this.state.givingToPlayer) {
      return (
        <PlayerChipModifier
          action="Give"
          player={this.state.givingToPlayer}
          onConfirm={this.giveChipsToPlayer}
          onCancel={this.cancelPlayerUpdate}
        />
      );
    }

    if (this.state.takingFromPlayer) {
      return (
        <PlayerChipModifier
          action="Take"
          player={this.state.takingFromPlayer}
          onConfirm={this.takeChipsFromPlayer}
          onCancel={this.cancelPlayerUpdate}
        />
      );
    }

    return this.renderSettingsBody();
  }

  renderSettingsBody() {
    return (
      <div>
        <h4>Game Settings</h4>
        {this.props.roundInProgress && <p>Changes will apply to the next round.</p>}
        <Form.Group>
          <Form.Label>Small Blind</Form.Label>
          <Form.Control
            name="smallBlindAmount"
            type="number"
            placeholder="1"
            value={this.state.gameSettings.smallBlindAmount}
            onChange={this.handleInputChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Big Blind</Form.Label>
          <Form.Control
            name="bigBlindAmount"
            type="number"
            placeholder="2"
            value={this.state.gameSettings.bigBlindAmount}
            onChange={this.handleInputChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Chip Value ($)</Form.Label>
          <Form.Control
            name="chipValue"
            type="number"
            placeholder="0"
            value={this.state.gameSettings.chipValue}
            onChange={this.handleInputChange}
          />
          <Form.Text className="text-muted">
            Leave as 0 to not show a dollar amount
          </Form.Text>
        </Form.Group>

        <div className="text-right">
          <Button onClick={this.save}>Apply Changes</Button>
        </div>
        <hr />
        <h4>Players</h4>
        {this.renderPlayers()}
      </div>
    );
  }

  render() {
    return (
      <React.Fragment>
        <div className="settings-toggle d-flex align-items-center pointer" onClick={this.showModal}>
          <span className="settings-toggle--text mr-3">Settings</span>
          <FontAwesomeIcon icon={faCog} size="2x"/>
        </div>

        <Modal
          show={this.state.show}
          onHide={this.hideModal}
        >
          <Modal.Body>
            {this.renderBody()}
          </Modal.Body>
        </Modal>
      </React.Fragment>
    );
  }
}
