import Card from './card'
import { PlayingCard } from "./constants"

type Props = {
  cards?: PlayingCard[];
}

export default function CommunityCards({ cards }: Props) {
  if (!cards) return null;

  const cardPlaceHolders = [];
  for (let i=0; i < 5 - cards.length; i++) {
    cardPlaceHolders.push(
      <div className="card-placeholder" key={i +cards.length} />
    )
  }

  return (
    <div className="d-flex community-cards justify-content-center">
      {cards.map((card, i) => {
        return <Card card={card} key={i}/>;
      })}
      {cardPlaceHolders}
    </div>
  );
}
