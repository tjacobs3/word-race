import { Fragment, FunctionComponent, useState } from "react"
import { Col, Container, Form, Row, Button } from "react-bootstrap"
import axios from 'axios';
import { useHistory } from "react-router-dom";

import logo from '../images/logo.svg';

const Splash:FunctionComponent = () => {
  const [creatingGame, setCreatingGame] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const history = useHistory();

  const createGame = () => {
    setCreatingGame(true);

    axios.post('http://localhost:3000/create', { name })
      .then((response) => history.push(`/game/${response.data.roomCode}`))
      .catch(() => setCreatingGame(false));
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
      </Container>
      <div className="splash">
        <Container>
          <img src={logo} alt="poker chip" />
          <div className="position-relative">
            <h1 className="mt-0 mb-3 text-center">Join a Room</h1>
            <form action='/create' method='post'>

            </form>
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
            <Button disabled={creatingGame} variant="dark" onClick={createGame} >
              Submit
            </Button>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
}
export default Splash
