import { useState } from "react"
import { Col, Container, Form, Row, Button, Modal } from "react-bootstrap"
import axios, { AxiosError } from 'axios';
import { useHistory, useLocation } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

import SplashHeader from "./splash_header";

export default function Splash() {
  const history = useHistory();
  const location = useLocation<{ notFound?: string }>();
  let initialErrors: string[] = [];

  if (location.state?.notFound) {
    initialErrors = [`Sorry, we could not find a game with that code (${location.state.notFound}).`]
  }

  const [creatingOrJoiningGame, setCreatingOrJoiningGame] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>('');
  const [errors, setErrors] = useState<string[]>(initialErrors);
  const [showAbout, setShowAbout] = useState(false);

  const handleError = (error: Error | AxiosError) => {
    if (axios.isAxiosError(error))  {
      setErrors(error.response?.data?.errors || []);
    }
    setCreatingOrJoiningGame(false);
  }

  const createGame = () => {
    setCreatingOrJoiningGame(true);

    axios.post(`${process.env.REACT_APP_API_ROOT || ''}/create`, { }, { withCredentials: true })
      .then((response) => history.push(`/game/${response.data.roomCode}`))
      .catch(handleError);
  }

  const joinGame = () => {
    setCreatingOrJoiningGame(true);

    axios.post(`${process.env.REACT_APP_API_ROOT || ''}/join_room`, { roomCode }, { withCredentials: true })
      .then((response) => history.push(`/game/${response.data.roomCode}`))
      .catch(handleError);
  }

  const quickPlay = () => {
    setCreatingOrJoiningGame(true);

    axios.post(`${process.env.REACT_APP_API_ROOT || ''}/quick_play`, { }, { withCredentials: true })
      .then((response) => history.push(`/game/${response.data.roomCode}`))
      .catch(handleError);
  }

  return (
    <div className="splash">
      <Container>
        <div className="px-4 text-center ">
          <h1 className="display-4 fw-bold">Wordversary.</h1>
          <div className="col-lg-6 mx-auto">
            <p className="lead">The head to head WORDLE competition!</p>
            <SplashHeader errors={errors} />
            <button
              className="play-button draw-border my-5"
              disabled={creatingOrJoiningGame}
              onClick={quickPlay}
            >
              Quick Play
            </button>
            <div className="mb-5">
              <h2 className="mt-0 mb-3 text-center">Join a Game</h2>
              <Row className="justify-content-md-center">
                <Col className="py-2 py-md-0" md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Room Code"
                    value={roomCode}
                    onChange={e => setRoomCode(e.target.value)}
                  />
                </Col>
                <Col className="py-2 py-md-0 text-center" sm="auto">
                  <Button disabled={creatingOrJoiningGame} variant="light" onClick={joinGame} >
                    Join
                  </Button>
                </Col>
              </Row>
            </div>

            <div>
              <h2 className="mt-0 text-center">Or Host a Private Game</h2>
              <Row className="justify-content-md-center">
                <Col className="text-center" sm="auto">
                  <Button disabled={creatingOrJoiningGame} variant="light" onClick={createGame} >
                    Host Game
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="mt-5 intro-text">
            <h4>How it works:</h4>
            <p><strong>The first to 10 points wins.</strong> Here is how you can score points -</p>
            <div><strong>2 points</strong> for solving the word first.</div>
            <div><strong>1 point</strong> for solving the word in the remaining time (if you didn't solve first).</div>
            <div><strong>1 point</strong> for having the most correct letters if no one solves the word.</div>
          </div>
        </div>
        <div className="text-center mt-3">
          <Button variant="link" onClick={() => setShowAbout(true)}>
            <FontAwesomeIcon className="me-2" icon={faQuestionCircle} />
            About
          </Button>
        </div>
        <Modal centered show={showAbout} onHide={() => setShowAbout(false)}>
          <Modal.Body className="text-center">
            <h4>Built By</h4>
            <a href="https://www.linkedin.com/in/thomas-jacobs-8b1b5021/">
              <FontAwesomeIcon className="me-2" icon={faLinkedin} />
            </a>
            <a href="https://github.com/tjacobs3">
              <FontAwesomeIcon className="me-2" icon={faGithub} />
              Thomas Jacobs
            </a>
            <h5 className="mt-3">
              Thank you to the original <a href="https://www.powerlanguage.co.uk/wordle/">Wordle</a>
            </h5>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}
