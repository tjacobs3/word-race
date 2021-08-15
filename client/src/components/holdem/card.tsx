import { useState, useEffect } from "react"
import PokerCard from 'react-pokercards'
import { useDidUpdateEffect } from "../../effects/use_did_update_effect";
import { PlayingCard } from "./constants";

const CARD_RANK: { [index: string]: number | string } = {
  '14': 'A',
  '13': 'K',
  '12': 'Q',
  '11': 'J',
  '10': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2
};

type Props = {
  slideUp?: boolean;
  shadow?: boolean;
  card: PlayingCard;
}

export default function Card({ slideUp = true, shadow, card }: Props) {
  const [facedown, setFacedown] = useState(!!card.facedown);
  const [didSlide, setDidSlide] = useState(false);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (slideUp) {
      const slideInTimeout = setTimeout(() => setDidSlide(true), 50);
      return () => clearTimeout(slideInTimeout);
    }
  }, [slideUp]);

  useDidUpdateEffect(() => {
    setFlipping(true);
    const flippingTimeout = setTimeout(() => {
      setFlipping(false);
      setFacedown(!!card.facedown);
    }, 200);

    return () => {
      clearTimeout(flippingTimeout);
    }
  }, [facedown, card.facedown]);


  // componentDidMount() {
  //   if (this.props.slideUp) {
  //     this.slideInTimeout = setTimeout(() => {
  //       this.setState({ didSlide: true });
  //     }, 50);
  //   }
  // }

  // componentDidUpdate(prevProps) {
  //   if(prevProps.card.facedown !== this.props.card.facedown) {
  //     this.setState({ flipping: true });

  //     this.flippingTimeout = setTimeout(() => {
  //       this.setState({ flipping: false, facedown: this.props.card.facedown });
  //     }, 200);
  //   }
  // }

  // componentWillUnmount() {
  //   if (this.slideInTimeout) clearTimeout(this.slideInTimeout);
  //   if (this.flippingTimeout) clearTimeout(this.flippingTimeout);
  // }


  let className = 'animated-card';
  if (slideUp) className += " slide";
  if (didSlide) className += " in";
  if (flipping) className += " flipping";

  let cardClassName = 'card-img';
  if (shadow) cardClassName += ' shadowed';

  const displayCard = facedown || !card.sort || !card.suit ? (
    <PokerCard className={cardClassName} isBackwards={true} />
  ) : (
    <PokerCard className={cardClassName} point={CARD_RANK[card.sort.toString()]} suit={card.suit.charAt(0).toLowerCase()}/>
  );

  return (
    <div className={className}>
      {displayCard}
    </div>
  );
}
