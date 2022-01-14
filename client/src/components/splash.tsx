import { useState } from "react"
import { Col, Container, Form, Row, Button } from "react-bootstrap"
import axios, { AxiosError } from 'axios';
import { useHistory, useLocation } from "react-router-dom";

import SplashHeader from "./splash_header";

export default function Splash() {
  const history = useHistory();
  const location = useLocation<{ notFound?: string }>();
  let initialErrors: string[] = [];

  if (location.state?.notFound) {
    initialErrors = [`Sorry, we could not find a game with that code (${location.state.notFound}).`]
  }

  const [creatingOrJoiningGame, setCreatingOrJoiningGame] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');
  const [errors, setErrors] = useState<string[]>(initialErrors);

  const handleError = (error: Error | AxiosError) => {
    if (axios.isAxiosError(error))  {
      setErrors(error.response?.data?.errors || []);
    }
    setCreatingOrJoiningGame(false);
  }

  const createGame = () => {
    setCreatingOrJoiningGame(true);

    axios.post(`${process.env.REACT_APP_API_ROOT || ''}/create`, { name }, { withCredentials: true })
      .then((response) => history.push(`/game/${response.data.roomCode}`))
      .catch(handleError);
  }

  const joinGame = () => {
    setCreatingOrJoiningGame(true);

    axios.post(`${process.env.REACT_APP_API_ROOT || ''}/join_room`, { name, roomCode }, { withCredentials: true })
      .then((response) => history.push(`/game/${response.data.roomCode}`))
      .catch(handleError);
  }

  return (
    <div className="splash">
      <Container>
        <div className="px-4 text-center">
          <h1 className="display-4 fw-bold">Wordversary.</h1>
          <div className="col-lg-6 mx-auto">
            <p className="lead mb-5">Race against your friends to solve word puzzles!</p>
            <SplashHeader errors={errors} />
            <div className="mb-5">
              <h1 className="mt-0 mb-3 text-center">Join a Game</h1>
              <Row className="justify-content-md-center">
                <Col className="py-2 py-md-0" md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </Col>
                <Col className="py-2 py-md-0" md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Room Code"
                    value={roomCode}
                    onChange={e => setRoomCode(e.target.value)}
                  />
                </Col>
                <Col className="py-2 py-md-0" xs="auto">
                  <Button disabled={creatingOrJoiningGame} variant="light" onClick={joinGame} >
                    Join
                  </Button>
                </Col>
              </Row>
            </div>

            <div>
              <h1 className="mt-0 text-center">Or Host a New Game</h1>
              <Row className="justify-content-md-center">
                <Col className="py-2 py-md-0" md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </Col>
                <Col xs="auto">
                  <Button disabled={creatingOrJoiningGame} variant="light" onClick={createGame} >
                    Create
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
