import axios, { AxiosError } from "axios";
import React, { FunctionComponent, useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import io, { Socket } from 'socket.io-client';
import { useHistory } from "react-router-dom";

import WordRace from './word_race';

const Game:FunctionComponent = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [playerId, setPlayerId] = useState<string | null>();
  const [secret, setSecret] = useState<string | null>();
  const [socket, setSocket] = useState<Socket | null>();

  useEffect(() => {
    axios.post(`${process.env.REACT_APP_API_ROOT || ''}/join`, { roomCode: id }, { withCredentials: true })
      .then((response) => {
        setPlayerId(response.data.playerId);
        setSecret(response.data.secret);
      })
      .catch((error: Error | AxiosError)=> {
        if (!axios.isAxiosError(error)) return;

        if (error.response?.status === 404) {
          history.replace('/', { notFound: id });
        }

        if (error.response?.status === 422) {
          history.replace(`/join/${id}`, { notFound: id });
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!secret || !playerId) return;

    const newSocket = io(`${process.env.REACT_APP_API_ROOT || 'http://localhost:3000'}`, {
      query: {
        roomCode: id,
        playerId,
        secret
      }
    });

    setSocket(newSocket);
  }, [id, playerId, secret]);

  return (
    <div className="game-space">
      {socket && playerId && (
        <React.Fragment>
          <WordRace
            admin={process.env.NODE_ENV === 'development'}
            roomCode={id}
            playerId={playerId}
            socket={socket}
          />
        </React.Fragment>
      )}
      {!socket && <h1 className="text-center">Connecting ...</h1>}
    </div>
  )
}

export default Game;
