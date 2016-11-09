import React from 'react';
import isFunction from 'lodash.isfunction';
import objectAssign from 'object-assign';

import TouchHandler from './TouchHandler';
import computeDeltas from './computeDeltas';
import gestureLevenshtein from './gestureLevenshtein';
import convertToDefaultsObject from './convertToDefaultsObject';
import { createSectors, computeSectorIdx } from './circleMath';

const T = React.PropTypes;

const INITIAL_STATE = { current: null, moves: [] };
const DEFAULT_CONFIG = { fudgeFactor: 5, minMoves: 8, gesture: "" };

class CustomGesture extends React.Component {
  static propTypes = {
    children: T.oneOfType([T.func, T.element]).isRequired,
    config: T.oneOfType([T.string, T.array, T.object]).isRequired,
    onMouseDown: T.func,
    onTouchStart: T.func,
    onGesture: T.func,
    __passThrough: T.object,
  };

  static get defaultProps() {
    return {
      onGesture: () => {},
      config: DEFAULT_CONFIG,
    };
  }

  constructor(props) {
    super(props);
    this._state = INITIAL_STATE;
    this._sectors = createSectors();    // create a resolution map of sectors

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

  handleTouchStart(touchPosition) {
    // set initial conditions for the touch event
    this._state = objectAssign({}, this._state, {current: touchPosition});
  }

  handleTouchMove(touchPosition) {
    const { current, moves } = this._state;
    const { dx, dy } = computeDeltas(current, touchPosition);
    const sectorIdx = computeSectorIdx(dx, dy);

    this._state = {
      current: { x: current.x + dx, y: current.y + dy },
      moves: [ ...moves, this._sectors[sectorIdx] ],
    };
  }

  handleTouchEnd() {
    const { config: _config } = this.props;
    const config = convertToDefaultsObject(_config, 'gesture', DEFAULT_CONFIG);

    if (this._state.moves.length < config.minMoves) {
      this._resetState();
      return;
    }

    const gesture = Array.isArray(config.gesture) ? config.gesture.join("") : config.gesture;
    const distance = gestureLevenshtein(this._state.moves.join(""), gesture);

    if (distance < config.fudgeFactor) {
      this.props.onGesture();
    }
    this._resetState();
  }

  _resetState() {
    this._touchHandler.cancelAnimationFrame();
    this._state = INITIAL_STATE;
  }

  render() {
    const { onTouchStart, onMouseDown, children, __passThrough } = this.props;
    const child = isFunction(children) ? children(__passThrough) : children;

    return React.cloneElement(React.Children.only(child), {
      __passThrough,
      ...this._touchHandler.listeners(child, onTouchStart, onMouseDown),
    });
  }
}

export default CustomGesture;
