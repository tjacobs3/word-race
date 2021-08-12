import React, { useState } from "react";

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from "react-bootstrap/Button";

import ChipValue from './chip_value';

type Props = {
  min: number;
  max: number;
  onCancel: () => void;
  onRaise: (amount: number) => void;
}

export default function RaiseInput({ min, max, onCancel, onRaise }: Props) {
  const [selectedAmount, setSelectedAmount] = useState(min);

  const allIn = max === min;

  return (
    <div>
      {!allIn && (
        <Form.Control
          max={max}
          min={min}
          value={selectedAmount}
          type="range"
          onChange={e => setSelectedAmount(parseInt(e.target.value))}
        />
      )}

      <Row className="justify-content-center">
        <Col xs="auto">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </Col>
        <Col xs="auto">
          {allIn && (
            <div className="text-center">
              <Button onClick={() => onRaise(selectedAmount)}>
                Go All In (Increase bet to <ChipValue animate={false} chips={max} />)
              </Button>
            </div>
          )}
          {!allIn && (
            <Button onClick={() => onRaise(selectedAmount)}>
              Raise to <ChipValue animate={false} chips={selectedAmount} />
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
}
