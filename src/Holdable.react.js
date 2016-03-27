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
    onHold: T.func,
    hold: T.func,
  };

  static get defaultProps() {
    return {
      onHold: () => {},
      hold: null,
    };
  }

  state = DEFAULT_HOLD;

  _handleTouchMove = e => this.handleTouchMove(e);
  _handleTouchEnd = e => this.handleTouchEnd(e);
  _handleHold = null;
  
  _resetTouch() {
    this.setState(DEFAULT_HOLD);
  }

  componentDidMount() {
    // Some trickery here. We want to allow both config-wrapped callbacks and 
    // normal callbacks. When we wrap a callback we add a `wrapped` property 
    // and check for that here. If it doesn't exist, wrap it (with the
    // defaults)
    const { onHold, hold } = this.props;
    if (hold && !onHold.wrapped) {
      this._handleHold = hold(onHold);
    } else {
      this._handleHold = onHold.wrapped ? onHold : defineHold()(onHold);
    }
  }

  passThroughState() {
    return { duration: this.state.duration }
  }

  handleTouchStart(e, child) {
    // add event handlers to the body
    document.addEventListener('touchmove', this._handleTouchMove);
    document.addEventListener('touchend', this._handleTouchEnd);

    // call child's and own callback from props since we're overwriting it
    child.props.onTouchStart && child.props.onTouchStart(e);
    this.props.onTouchStart && this.props.onTouchStart(e);
    
    // set initial conditions for the touch event
    const time = new Date();
    this.setState(merge({}, this.state, { initial: time, current: time }));

    this._clearHoldTimers = this._handleHold(holdLength => {
      const time = new Date();
      const duration = (time - this.state.initial) / holdLength;
      this.setState(merge({}, this.state, { time, duration: clamp(duration, 0, 1) }));
    });
  }
  
  handleTouchMove(e) {
    e.preventDefault();
    this._clearHoldTimers();
  }
  
  handleTouchEnd(e) {
    document.removeEventListener('touchmove', this._handleTouchMove);
    document.removeEventListener('touchend', this._handleTouchEnd);
    this._clearHoldTimers();
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
