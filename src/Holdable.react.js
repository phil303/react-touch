import React from 'react';
import isFunction from 'lodash/isFunction';
import merge from 'lodash/merge';
import clamp from 'lodash/clamp';

import defineHold from './defineHold';


const T = React.PropTypes;
const DEFAULT_HOLD = { initial: null, current: null, duration: 0 };

class Holdable extends React.Component {

  static propTypes = {
    children: T.oneOfType([T.func, T.element]).isRequired,
    onHoldProgress: T.func,
    onHoldComplete: T.func,
    onTouchStart: T.func,
    config: T.object,
    __passThrough: T.object,
  };

  static get defaultProps() {
    return {
      onHoldProgress: () => {},
      onHoldComplete: () => {},
      config: defineHold(),
    };
  }

  state = DEFAULT_HOLD;

  _handleTouchMove = e => this.handleTouchMove(e);
  _handleTouchEnd = e => this.handleTouchEnd(e);
  _startHoldProgress = null;
  _startHoldComplete = null;
  _clearHoldProgressTimer = null;
  _clearHoldCompleteTimer = null;

  _resetTouch() {
    this.setState(DEFAULT_HOLD);
  }

  componentDidMount() {
    const { onHoldProgress, onHoldComplete, config } = this.props;

    this._startHoldProgress = config.holdProgress(onHoldProgress);
    this._startHoldComplete = config.holdComplete(onHoldComplete);
  }

  passThroughState() {
    return { holdProgress: this.state.duration };
  }

  handleTouchStart(e, child) {
    // add event handlers to the body
    document.addEventListener('touchmove', this._handleTouchMove);
    document.addEventListener('touchend', this._handleTouchEnd);
    document.addEventListener('touchcancel', this._handleTouchEnd);

    // call child's and own callback from props since we're overwriting it
    child.props.onTouchStart && child.props.onTouchStart(e);
    this.props.onTouchStart && this.props.onTouchStart(e);

    // set initial conditions for the touch event
    const initial = new Date();
    this.setState(merge({}, this.state, { initial, current: initial }));

    this._clearHoldProgressTimer = this._startHoldProgress(holdLength => {
      const current = new Date();
      const _duration = (current - this.state.initial) / holdLength;
      const duration = clamp(_duration, 0, 1);
      this.setState(merge({}, this.state, { current, duration }));
    });
    this._clearHoldCompleteTimer = this._startHoldComplete();
  }

  handleTouchMove(e) {
    e.preventDefault();
    this._clearHoldProgressTimer();
    this._clearHoldCompleteTimer();
  }

  handleTouchEnd() {
    document.removeEventListener('touchmove', this._handleTouchMove);
    document.removeEventListener('touchend', this._handleTouchEnd);
    document.removeEventListener('touchcancel', this._handleTouchEnd);
    this._clearHoldProgressTimer();
    this._clearHoldCompleteTimer();
    this._resetTouch();
  }

  render() {
    const { children, __passThrough } = this.props;
    const passThrough = { ...__passThrough, ...this.passThroughState() };
    const child = isFunction(children) ? children({ ...passThrough }) : children;

    return React.cloneElement(React.Children.only(child), {
      onTouchStart: e => this.handleTouchStart(e, child),
      __passThrough: passThrough,
    });
  }
}

export default Holdable;
