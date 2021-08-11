import axios from "axios";
import React, { FunctionComponent, useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import io, { Socket } from 'socket.io-client';

import Messages, { Message } from "../room/messages";
import HoldEm from './holdem';

import '../room.scss';
import './styles.scss';

const Game:FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const [playerId, setPlayerId] = useState<string | null>();
  const [secret, setSecret] = useState<string | null>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>();

  useEffect(() => {
    axios.post('http://localhost:3000/join', { roomCode: id })
      .then((response) => {
        setPlayerId(response.data.playerId);
        setSecret(response.data.secret);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!secret || !playerId) return;

    const newSocket = io('http://localhost:3000', {
      query: {
        roomCode: id,
        playerId,
        secret
      }
    });

    setSocket(newSocket);
  }, [id, playerId, secret]);

  useEffect(() => {
    if (!socket) return;

    socket.on('chat message', (msg: Message) => setMessages([...messages, msg]));

    return () => {
      socket.off('chat message');
    }
  }, [socket, messages]);

  return (
    <div className="game-space">
      {socket && playerId && (
        <React.Fragment>
          <Messages
            messages={messages}
            socket={socket}
          />
          <HoldEm
            admin={true}
            roomCode={id}
            playerId={playerId}
            socket={socket}
          />
        </React.Fragment>
      )}
      {!socket && <h1>Connecting ...</h1>}
    </div>
  )
}

export default Game;
