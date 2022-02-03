import { useState } from "react";
import { Col, Container, Form, Row, Button, Alert } from "react-bootstrap"
import { Socket } from "socket.io-client";
import { ACTION__SET_NAME } from "./constants";

type Props = {
  roomCode: string;
  socket: Socket;
}

export default function NameInput({ roomCode, socket }: Props) {
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleInput = (newName: string) => {
    setName(newName.substring(0, 11))
  }

  const submitName = () => {
    setSending(true);

    socket.emit(ACTION__SET_NAME, name, (response: { error: string | undefined }) => {
      setSending(false);
      setError(response.error)
    });
  }

  return (
    <Container className="name-input">
      {error && (
        <div className="text-center my-5">
          <Alert className="d-inline-block" variant="info">{error}</Alert>
        </div>
      )}
      <Row className="justify-content-md-center">
        <Col className="py-2 py-md-0" md={4}>
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              placeholder="Your Name"
              value={name}
              onChange={e => handleInput(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col className="py-2 py-md-0 text-center" sm="auto">
          <Button variant="light" disabled={sending} onClick={submitName}>
            Join
          </Button>
        </Col>
      </Row>
      <Row>
        <Col className="text-center">
          <Form.Text className="hint my-1">
            This is what we'll show to other players. It's ok to leave this blank.
          </Form.Text>
        </Col>
      </Row>
    </Container>
  );

}
