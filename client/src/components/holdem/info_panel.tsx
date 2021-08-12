import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLevelUpAlt, faLevelDownAlt } from '@fortawesome/free-solid-svg-icons';
import { Socket } from "socket.io-client";

import { Container, Row, Col } from 'react-bootstrap';

import ActionList from './action_list';
import ChipValue from './chip_value';
import { GameSettings, PlayerAction } from "./constants";

type Props = {
  actions?: PlayerAction;
  host: string;
  roomCode: string;
  socket: Socket;
  standing?: boolean;
  gameSettings?: GameSettings;
  onSit: () => void;
  onStand: () => void;
}

export default function InfoPanel({ actions, host, roomCode, socket, standing, gameSettings, onSit, onStand }: Props) {
  return (
    <div className="info-panel">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs={2}>
            <table>
              <tbody>
                <tr>
                  <td className="pr-2">Table:</td>
                  <td>{roomCode}</td>
                </tr>
                <tr>
                  <td className="pr-2">Host:</td>
                  <td>{host}</td>
                </tr>
                <tr>
                  <td className="pr-2">Blinds:</td>
                  <td>
                    <ChipValue animate={false} chips={gameSettings?.smallBlindAmount || 0} />
                    <span> / </span>
                    <ChipValue animate={false} chips={gameSettings?.bigBlindAmount || 0} />
                  </td>
                </tr>
              </tbody>
            </table>
          </Col>
          <Col>
            {actions &&
              <ActionList
                actions={actions}
                socket={socket}
              />
            }
          </Col>
          <Col className="text-right align-self-end mb-1" xs={2}>
            {standing && (
              <span>
                <small>Standing</small>
                <FontAwesomeIcon className="ml-2 pointer" icon={faLevelDownAlt} title="Sit" onClick={onSit} />
              </span>
            )}
            {!standing && (
              <span>
                <small>Sitting</small>
                <FontAwesomeIcon className="ml-2 pointer" icon={faLevelUpAlt} title="Stand" onClick={onStand} />
              </span>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
