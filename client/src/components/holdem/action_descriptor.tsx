import React from "react";
import ChipValue from './chip_value';
import { ActionHistoryObject } from "./constants";

type Props = {
  action: ActionHistoryObject;
};

type State = {
  didSlide: boolean
}

export default class ActionDescriptor extends React.Component<Props, State> {
  timeouts?: number[];

  state = {
    didSlide: false
  }

  componentDidMount() {
    this.animate();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.action.id !== this.props.action.id) this.animate();
  }

  componentWillUnmount() {
    if (!this.timeouts) return;

    this.timeouts.forEach(timeout => clearTimeout(timeout));
  }

  animate() {
    const slideInTimeout = window.setTimeout(() => {
      this.setState({ didSlide: true });
    }, 50);

    const slideOutTimeout = window.setTimeout(() => {
      this.setState({ didSlide: false });
    }, 5000);

    this.timeouts = [slideInTimeout, slideOutTimeout];
  }

  renderDescription() {
    switch(this.props.action.action) {
      case 'check':
        return 'Checked';
      case 'fold':
        return 'Folded';
      case 'call':
        return (
          <span>Called to <ChipValue chips={this.props.action.data.bet} /></span>
        );
      case 'raise':
        return (
          <span>Raised to <ChipValue chips={this.props.action.data.bet} /></span>
        );
      default:
        return;
    }
  }

  render() {
    let className = 'animated-card action-description fade';
    if (this.state.didSlide) className += " in";

    return (
      <div className='action-descriptor-container w-100 text-center'>
        <span className={className}>
          {this.renderDescription()}
        </span>
      </div>
    );
  }
}
