import React from "react";

import ChipValueContext from './contexts/chip_value_context';
import AnimatedNumber from '../ui/other/animated_number';

type Props = {
  animate?: boolean;
  chips: number;
};

export default class ChipValue extends React.Component<Props> {
  formatter: Intl.NumberFormat;

  static contextType = ChipValueContext;

  constructor(props: Props) {
    super(props);

    this.formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }

  render() {
    const hasChipValue = !!this.context;
    const displayVal = hasChipValue ? this.props.chips * this.context : this.props.chips;

    if (this.props.animate === false) {
      return <span>{hasChipValue ? this.formatter.format(displayVal).replace(/\D00$/, '') : displayVal}</span>;
    }

    return (
      <span>
        <AnimatedNumber formatter={hasChipValue ? this.formatter : undefined} value={displayVal} />
      </span>
    );
  }
}
