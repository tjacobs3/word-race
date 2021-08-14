import React from "react"

import CommunityCards from '../community_cards';
import ChipValue from "../chip_value";
import { PlayingCard } from "../constants";

type Props = {
  cards?: PlayingCard[];
  pot: number;
}

export default function CurrentRoundTable({ pot, cards }: Props) {
  return (
    <React.Fragment>
      <h4 className="text-center">
        <small>Total Pot:</small> <ChipValue chips={pot} />
      </h4>
      <div className="mb-4">
        <CommunityCards cards={cards} />
      </div>
    </React.Fragment>
  );
}
