import React from 'react';
import raf from 'raf';
import isFunction from 'lodash/isFunction';
import merge from 'lodash/merge';
import reduce from 'lodash/upperFirst';
import upperFirst from 'lodash/upperFirst';
import forEach from 'lodash/forEach';

import defineSwipe from './defineSwipe';
import computeDeltas from './computeDeltas';


const T = React.PropTypes;
const DIRECTIONS = ['Left', 'Right', 'Up', 'Down'];
const ZERO_DELTAS = { dx: 0, dy: 0 };
const DEFAULT_STATE = { initial: null, current: null, deltas: ZERO_DELTAS };

class Swipeable extends React.Component {

  static propTypes = {
    children: T.oneOfType([T.func, T.element]).isRequired,
    config: T.object,
  };

  static get defaultProps() {
    return { config: defineSwipe() };
  }

  state = DEFAULT_STATE;

  _updatingPosition = false;
  _handleTouchMove = e => this.handleTouchMove(e);
  _handleTouchEnd = e => this.handleTouchEnd(e);
  _handlerFired = {};

  _updatePosition(touchPosition) {
    this._updatingPosition = false;
    const deltas = computeDeltas(this.state.current, touchPosition);
    const current = { ...touchPosition, deltas };

    DIRECTIONS.forEach(direction => {
      const name = `onSwipe${direction}`;
      const handler = this.props[name];
      if (handler && !this._handlerFired[name]) {
        this.props.config[name](current, this.state.initial, () => {
          this._handlerFired[name] = true
          handler();
        });
      }
    });

    this.setState(merge({}, this.state, { current }));
  }

  _resetState() {
    this._handlerFired = {};
    this.setState(merge({}, this.state, DEFAULT_STATE));
  }

  passThroughState() {
    return { ...this.state.deltas };
  }

  handleTouchStart(e, child) {
    // add event handlers to the body
    document.addEventListener('touchmove', this._handleTouchMove);
    document.addEventListener('touchend', this._handleTouchEnd);
    document.addEventListener('touchcancel', this._handleTouchEnd);

    // call child's and own callback from props since we're overwriting it
    child.props.onTouchStart && child.props.onTouchStart(e);
    this.props.onTouchStart && this.props.onTouchStart(e);
    
    const { clientX, clientY } = e.nativeEvent.touches[0];
    const dimensions = { x: clientX, y: clientY };

    // set initial conditions for the touch event
    this.setState(merge({}, this.state, {initial: dimensions, current: dimensions}));
  }

  handleTouchMove(e) {
    e.preventDefault();
    if (!this._updatingPosition) {
      const { clientX: x, clientY: y } = e.touches[0];
      raf(() => this._updatePosition({x, y}));
    }
    this._updatingPosition = true;
  }
  
  handleTouchEnd(e) {
    document.removeEventListener('touchmove', this._handleTouchMove);
    document.removeEventListener('touchend', this._handleTouchEnd);
    document.removeEventListener('touchcancel', this._handleTouchEnd);
    this._resetState();
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

export default Swipeable;
