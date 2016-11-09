import React from 'react';
import isFunction from 'lodash.isfunction';
import objectAssign from 'object-assign';

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
    onMouseDown: T.func,
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

  handleTouchStart(touchPosition) {
    this.setState(objectAssign({}, this.state, {
      initial: touchPosition,
      current: touchPosition,
    }));
  }

  handleTouchMove(touchPosition) {
    this.setState(objectAssign({}, this.state, { current: touchPosition }));

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
    this.setState(objectAssign({}, this.state, DEFAULT_STATE));
  }

  render() {
    const { onTouchStart, onMouseDown, children, __passThrough } = this.props;
    const passThrough = { ...__passThrough, ...this.passThroughState() };
    const child = isFunction(children) ? children({ ...passThrough }) : children;

    return React.cloneElement(React.Children.only(child), {
      __passThrough: passThrough,
      ...this._touchHandler.listeners(child, onTouchStart, onMouseDown),
    });
  }
}

export default Swipeable;
