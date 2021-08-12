import ChipValueContext from './contexts/chip_value_context';
import AnimatedNumber from '../ui/other/animated_number';

type Props = {
  animate?: boolean;
  chips: number;
};

export default function ChipValue({ animate, chips }: Props) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const render = (chipValue?: number) => {
    const hasChipValue = !!chipValue;
    const displayVal = !!chipValue ? chips * chipValue : chips;

    if (!animate) {
      return <span>{hasChipValue ? formatter.format(displayVal).replace(/\D00$/, '') : displayVal}</span>;
    }

    return (
      <span>
        <AnimatedNumber formatter={hasChipValue ? formatter : undefined} value={displayVal} />
      </span>
    );
  }

  return (
    <ChipValueContext.Consumer>
      {render}
    </ChipValueContext.Consumer>
  );
}
