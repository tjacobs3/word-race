import { Socket } from "socket.io-client";
import Button from 'react-bootstrap/Button'

import {
  ACTION__ADMIN_ADD_AI,
  ACTION__CALL,
  ACTION__FOLD,
  ACTION__MUCK,
  ACTION__REVEAL,
  Round
} from './constants';
import React from "react";

type Props = {
  currentRound?: Round;
  socket: Socket;
};

export default function AdminControls({ currentRound, socket }: Props) {
  const ADMIN_handlePerformAction = (action: string) => socket.emit(action);

  return (
    <div className="admin-controls">
      <strong>Admin Controls</strong>
      {currentRound?.bettingRoundStarted && (
        <React.Fragment>
          <div>
            <Button className="my-2" onClick={() => ADMIN_handlePerformAction(ACTION__CALL)}>
              AI Call
            </Button>
          </div>
          <div>
            <Button className="my-2" onClick={() => ADMIN_handlePerformAction(ACTION__FOLD)}>
              AI Fold
            </Button>
          </div>
        </React.Fragment>
      )}
      {currentRound?.showdown && (
        <React.Fragment>
          <div>
            <Button className="my-2" onClick={() => ADMIN_handlePerformAction(ACTION__MUCK)}>
              Muck
            </Button>
          </div>
          <div>
            <Button className="my-2" onClick={() => ADMIN_handlePerformAction(ACTION__REVEAL)}>
              Reveal
            </Button>
          </div>
        </React.Fragment>
      )}

      {!currentRound &&
        <div>
          <Button className="my-2 " onClick={() => ADMIN_handlePerformAction(ACTION__ADMIN_ADD_AI)}>
            Add AI
          </Button>
        </div>
      }
    </div>
  );
}
