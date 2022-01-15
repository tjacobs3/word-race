import { useState } from "react"
import { Col, Form, Row, Button } from "react-bootstrap"
import axios, { AxiosError } from 'axios';
import { useHistory, useParams } from "react-router-dom";

import SplashHeader from "./splash_header";

export default function JoinGame() {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [joiningGame, setJoiningGame] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  const joinGame = () => {
    setJoiningGame(true);

    axios.post(`${process.env.REACT_APP_API_ROOT || ''}/join_room`, { name, roomCode: id }, { withCredentials: true })
      .then((response) => history.push(`/game/${response.data.roomCode}`))
      .catch((error: Error | AxiosError)=> {
        if (axios.isAxiosError(error))  {
          setErrors(error.response?.data?.errors || []);
        }
        setJoiningGame(false);
      });
  }

  return (
    <div className="splash">
      <div className="px-4 text-center">
        <h1 className="display-4 fw-bold">Wordversary.</h1>
        <div className="col-lg-6 mx-auto">
          <p className="lead mb-5">Race against your friends to solve word puzzles!</p>
          <div className="mb-5">

            <SplashHeader errors={errors} />
            <div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
