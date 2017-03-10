import React from 'react';
import isFunction from 'lodash/isFunction';
import merge from 'lodash/merge';
import clamp from 'lodash/clamp';

import defineHold from './defineHold';
import TouchHandler from './TouchHandler';


const T = React.PropTypes;
const DEFAULT_HOLD = { initial: null, current: null, duration: 0 };

class Holdable extends React.Component {

  static propTypes = {
    children: T.oneOfType([T.func, T.element]).isRequired,
    onHoldProgress: T.func,
    onHoldComplete: T.func,
    onMouseDown: T.func,
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

  constructor(props) {
    super(props);
    this.state = DEFAULT_HOLD;
    this._startHoldProgress = null;
    this._startHoldComplete = null;
    this._clearHoldProgressTimer = null;
    this._clearHoldCompleteTimer = null;

    this._touchHandler = new TouchHandler(
      this.handleTouchStart.bind(this),
      this.handleTouchMove.bind(this),
      this.handleTouchEnd.bind(this),
    );
  }

  _resetTouch() {
    this.setState(DEFAULT_HOLD);
  }

  _clearTimers() {
    // successful hold completes will null these out
    this._clearHoldProgressTimer && this._clearHoldProgressTimer();
    this._clearHoldCompleteTimer && this._clearHoldCompleteTimer();
  }

  componentDidMount() {
    const { onHoldProgress, onHoldComplete, config } = this.props;

    this._startHoldProgress = config.holdProgress(onHoldProgress);
    this._startHoldComplete = config.holdComplete(onHoldComplete);
  }

  componentWillUnmount() {
    this._touchHandler.removeListeners();
    this._clearTimers();
  }

  passThroughState() {
    return { holdProgress: this.state.duration };
  }

  handleTouchStart() {
    // set initial conditions for the touch event
    const initial = Date.now();
    this.setState(merge({}, this.state, { initial, current: initial }));

    this._clearHoldProgressTimer = this._startHoldProgress(holdLength => {
      const current = Date.now();
      const _duration = (current - this.state.initial) / holdLength;
      const duration = clamp(_duration, 0, 1);
      this.setState(merge({}, this.state, { current, duration }));

      if (duration === 1) {
        // edge case: setTimeout ensures onholdComplete has a chance to fire
        setTimeout(() => this._clearTimers());
      }
    });
    this._clearHoldCompleteTimer = this._startHoldComplete();
  }

  handleTouchMove() {
    this._clearTimers();
  }

  handleTouchEnd() {
    this._clearTimers();
    this._resetTouch();
  }

  render() {
    const { onTouchStart, onMouseDown, children, __passThrough } = this.props;
    const passThrough = { ...__passThrough, ...this.passThroughState() };
    const child = isFunction(children) ? children({ ...passThrough }) : children;
    const props = {
      ...this._touchHandler.listeners(child, onTouchStart, onMouseDown),
    };

    if (child.type.propTypes && child.type.propTypes.hasOwnProperty('__passThrough')) {
      props.__passThrough = passThrough;
    }

    return React.cloneElement(React.Children.only(child), props);
  }
}

export default Holdable;
