import React from 'react';
import isFunction from 'lodash/isFunction';
import merge from 'lodash/merge';

import TouchHandler from './TouchHandler';
import defineSwipe from './defineSwipe';


const T = React.PropTypes;
const DIRECTIONS = ['Left', 'Right', 'Up', 'Down'];
const ZERO_DELTAS = { dx: 0, dy: 0 };
const DEFAULT_STATE = { initial: null, current: null, deltas: ZERO_DELTAS };

class Swipeable extends React.Component {

  static propTypes = {
    children: T.oneOfType([T.func, T.element]).isRequired,
    config: T.object,
    onTouchStart: T.func,
    __passThrough: T.object,
  };

  static get defaultProps() {
    return { config: defineSwipe() };
  }

  constructor(props) {
    super(props);

    this.state = DEFAULT_STATE;
    this._handlerFired = {};
    this._touchHandler = new TouchHandler(
      this.handleTouchStart.bind(this),
      this.handleTouchMove.bind(this),
      this.handleTouchEnd.bind(this),
    );
  }

  componentWillUnmount() {
    this._touchHandler.cancelAnimationFrame();
    this._touchHandler.removeListeners();
  }

  passThroughState() {
    return { ...this.state.deltas };
  }

  handleTouchStart(evt) {
    // call child's and own callback from props since we're overwriting it
    const { children: child } = this.props;
    child.props.onTouchStart && child.props.onTouchStart(evt);
    this.props.onTouchStart && this.props.onTouchStart(evt);

    const { clientX, clientY } = evt.nativeEvent.touches[0];
    const position = { x: clientX, y: clientY };

    this.setState(merge({}, this.state, {initial: position, current: position}));
  }

  handleTouchMove(evt) {
    const { clientX: x, clientY: y } = evt.touches[0];
    const touchPosition = { x, y };

    this.setState(merge({}, this.state, { current: touchPosition }));

    DIRECTIONS.forEach(direction => {
      const name = `onSwipe${direction}`;
      const handler = this.props[name];
      if (handler && !this._handlerFired[name]) {
        this.props.config[name](touchPosition, this.state.initial, () => {
          this._handlerFired[name] = true;
          handler();
        });
      }
    });
  }

  handleTouchEnd() {
    this._resetState();
  }

  _resetState() {
    this._touchHandler.cancelAnimationFrame();
    this._handlerFired = {};
    this.setState(merge({}, this.state, DEFAULT_STATE));
  }

  render() {
    const { children, __passThrough } = this.props;
    const passThrough = { ...__passThrough, ...this.passThroughState() };
    const child = isFunction(children) ? children({ ...passThrough }) : children;

    return React.cloneElement(React.Children.only(child), {
      __passThrough: passThrough,
      onTouchStart: evt => this._touchHandler.handleTouchStart(evt, child),
    });
  }
}

export default Swipeable;
