import React from "react"

const DEFAULT_TRANSITION_TIME = 1;
const UPDATE_INTERVAL_MS = 50;

type Props = {
  formatter?: Intl.NumberFormat,
  value?: number,
  time?: number
};

type State = {
  valueToDisplay?: number;
  startTime?: number;
  endTime?: number;
  startValue?: number;
}

export default class AnimatedNumber extends React.Component<Props, State> {
  updateInterval?: NodeJS.Timeout;

  state: State = {
    valueToDisplay: undefined
  }

  componentWillUnmount() {
    if (this.updateInterval) clearInterval(this.updateInterval);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.value === prevProps.value) return;
    if (!this.props.value) return this.finishAnimation();

    if (this.updateInterval) clearInterval(this.updateInterval);
    const startTime = (new Date()).getTime();
    const endTime = startTime + ((this.props.time || DEFAULT_TRANSITION_TIME) * 1000);
    const startValue = prevProps.value || 0;
    this.setState({ startTime, endTime, startValue, valueToDisplay: startValue });

    this.updateInterval = setInterval(this.updateDisplayValue, UPDATE_INTERVAL_MS);
  }

  finishAnimation() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
    this.setState({ valueToDisplay: this.props.value });
  }

  updateDisplayValue = () => {
    const currentTime = (new Date()).getTime();
    const { startValue, startTime, endTime } = this.state;
    const { value } = this.props;

    if (!endTime) return;

    if (currentTime >= endTime) {
      if (this.updateInterval) clearInterval(this.updateInterval);
      this.setState({ valueToDisplay: value });
    } else if (value && startValue && startTime) {
      const valueToDisplay = (value - startValue) * ((currentTime - startTime) / (endTime - startTime)) + startValue;
      this.setState({ valueToDisplay: valueToDisplay });
    }
  }

  render() {
    const hideDecimals = Number.isInteger(this.props.value) &&
                           (!this.state.startValue || Number.isInteger(this.state.startValue));

    let displayVal: number | string | undefined =
      this.state.valueToDisplay ? this.state.valueToDisplay : this.props.value;

    if (!displayVal) return null;

    displayVal = hideDecimals ? Math.round(displayVal) : displayVal;
    displayVal = this.props.formatter?.format(displayVal).replace(/\D00$/, '') ||
                 (hideDecimals ? displayVal : displayVal.toFixed(2));

    return <span>{displayVal}</span>;
  }
}
