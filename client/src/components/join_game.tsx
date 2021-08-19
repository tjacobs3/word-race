import { Fragment, useState } from "react"
import { Col, Container, Form, Row, Button } from "react-bootstrap"
import axios, { AxiosError } from 'axios';
import { useHistory, useParams } from "react-router-dom";

import logo from '../images/logo.svg';
import SplashHeader from "./splash_header";

export default function JoinGame() {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [joiningGame, setJoiningGame] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  const joinGame = () => {
    setJoiningGame(true);

    axios.post('/join_room', { name, roomCode: id })
      .then((response) => history.push(`/game/${response.data.roomCode}`))
      .catch((error: Error | AxiosError)=> {
        if (axios.isAxiosError(error))  {
          setErrors(error.response?.data?.errors || []);
        }
        setJoiningGame(false);
      });
  }

  return (
    <Fragment>
      <SplashHeader errors={errors} />
      <div className="splash">
        <Container>
          <img src={logo} alt="poker chip" />
          <div className="position-relative">
            <h1 className="mt-0 mb-3 text-center">Joining {id}</h1>
            <Row className="justify-content-md-center">
              <Col className="py-2 py-md-0" md={3}>
                <Form.Control
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </Col>
              <Col className="py-2 py-md-0" xs="auto">
                <Button disabled={joiningGame} variant="light" onClick={joinGame} >
                  Submit
                </Button>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </Fragment>
  );
}
