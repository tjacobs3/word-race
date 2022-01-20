
import React from "react";
import Timer from "../score_board/timer";

type Props = {
  isOwner: boolean;
  gameStartAt?: Date;
  roomCode: string;
}

export default function GameStartHeader({ isOwner, gameStartAt, roomCode }: Props) {
  let header;

  if (isOwner) {
    header = (
      <React.Fragment>
        <h5>Waiting for more players to join.</h5>
        <h5>When you are ready to start the game, press START!</h5>
      </React.Fragment>
    );
  }
  else if (gameStartAt) {
    header = (
      <React.Fragment>
        <h5>Waiting for players. The game will start automatically in </h5>
        <h4><Timer toTime={gameStartAt} /></h4>
      </React.Fragment>
    );
  }
  else {
    header = <h5>Waiting for the host to start the game.</h5>;
  }

  return (
    <React.Fragment>
      {header}
      <div>
        <div className="alert alert-info my-5 d-inline-block">
          Your room code is <strong>{roomCode}</strong>
        </div>
      </div>
    </React.Fragment>
  );
};
