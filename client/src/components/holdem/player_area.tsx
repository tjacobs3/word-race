import { ReactNode, CSSProperties } from "react";
import { Player } from "./constants";

type Props = {
  children: ReactNode,
  player: Player,
  style?: CSSProperties
}

export default function PlayerArea({ children, player, style }: Props) {
  let className = 'player-area';
  const { folded, standing, inCurrentRound } = player;

  if (folded || (standing && !inCurrentRound)) className += ' faded';

  return (
    <div className={className} style={style || {}} >
      {children}
    </div>
  );
}
