declare module "react-pokercards" {
  type Props = {
    className?: string;
    point?: string | number;
    suit?: string;
    isBackwards?: boolean
  }

  export default class PokerCard extends React.Component<Props, any> {}
}
