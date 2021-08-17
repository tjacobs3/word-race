import { Fragment, FunctionComponent, useState } from "react"
import { Col, Container, Form, Row, Button, Alert } from "react-bootstrap"
import axios, { AxiosError } from 'axios';
import { useHistory } from "react-router-dom";

import logo from '../images/logo.svg';

const Splash:FunctionComponent = () => {
  const [creatingOrJoiningGame, setCreatingOrJoiningGame] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const history = useHistory();

  const createGame = () => {
    setCreatingOrJoiningGame(true);

    axios.post('http://localhost:3000/create', { name })
      .then((response) => history.push(`/game/${response.data.roomCode}`))
      .catch(() => setCreatingOrJoiningGame(false));
  }

  const joinGame = () => {
    setCreatingOrJoiningGame(true);

    axios.post('http://localhost:3000/join_room', { name, roomCode })
      .then((response) => history.push(`/game/${response.data.roomCode}`))
      .catch((error: Error | AxiosError)=> {
        if (axios.isAxiosError(error))  {
          setErrors(error.response?.data?.errors || []);
        }
        setCreatingOrJoiningGame(false);
      });
  }

  return (
    <Fragment>
      <Container>
        <div className="px-3 py-5 mx-auto text-center">
          <h1 className="display-4">
            <span className="mr-4">no signup.</span>
            <span className="mr-4">no ads.</span>
            <span className="mr-4">just poker.</span>
          </h1>
        </div>
        {errors.length > 0 && (
          <div className="text-center">
            <Alert className="d-inline-block" variant="warning">
              {errors.map(error => <div key={error}>{error}</div>)}
            </Alert>
          </div>
        )}
      </Container>
      <div className="splash">
        <Container>
          <img src={logo} alt="poker chip" />
          <div className="position-relative">
            <h1 className="mt-0 mb-3 text-center">Join a Room</h1>
            <Row className="justify-content-md-center">
              <Col className="py-2 py-md-0" md={3}>
                <Form.Control
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </Col>
              <Col className="py-2 py-md-0" md={3}>
                <Form.Control
                  type="text"
                  placeholder="Room Code"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value)}
                />
              </Col>
              <Col className="py-2 py-md-0" xs="auto">
                <Button disabled={creatingOrJoiningGame} variant="light" onClick={joinGame} >
                  Submit
                </Button>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
      <Container className="pb-4">
        <h2 className="mt-3 text-center py-3">Or Host a New Room</h2>
        <Row className="justify-content-md-center">
          <Col className="py-2 py-md-0" md={3}>
            <Form.Control
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </Col>
          <Col xs="auto">
            <Button disabled={creatingOrJoiningGame} variant="dark" onClick={createGame} >
              Submit
            </Button>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
}
export default Splash
