import { useState } from 'react';

import { Form, Button } from 'react-bootstrap';
import { Player } from './constants';

type Props = {
  action: string;
  player: Player;
  onCancel: () => void;
  onConfirm: (playerId: string, amount: number) => void;
};

export default function PlayerChipModifier({ action, player, onCancel, onConfirm }: Props) {
  const [amount, setAmount] = useState('');

  return (
    <div>
      <Form.Group>
        <Form.Label>{action} amount</Form.Label>
        <Form.Control
          type="number"
          min={0}
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Form.Group>
      <div className="text-right">
        <Button className="mr-2" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onConfirm(player.id, parseInt(amount) || 0)}>Confirm</Button>
      </div>
    </div>
  );
}
