import React from 'react';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import merge from 'lodash/merge';

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

  handleTouchStart(evt) {
    // call child's and own callback from props since we're overwriting it
    const { children: child } = this.props;
    child.props.onTouchStart && child.props.onTouchStart(evt);
    this.props.onTouchStart && this.props.onTouchStart(evt);

    // set initial conditions for the touch event
    const { clientX: x, clientY: y } = evt.nativeEvent.touches[0];
    this._state = merge({}, this._state, {current: { x, y }});
  }

  handleTouchMove(evt) {
    const { clientX: x, clientY: y } = evt.touches[0];
    const { current, moves } = this._state;
    const { dx, dy } = computeDeltas(current, { x, y });
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

    const gesture = isArray(config.gesture) ? config.gesture.join("") : config.gesture;
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
    const { children, __passThrough } = this.props;
    const child = isFunction(children) ? children(__passThrough) : children;

    return React.cloneElement(React.Children.only(child), {
      __passThrough,
      onTouchStart: evt => this._touchHandler.handleTouchStart(evt, child),
    });
  }
}

export default CustomGesture;
