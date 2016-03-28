import React from 'react';
import raf from 'raf';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import merge from 'lodash/merge';

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
    onGesture: T.func,
  };

  static get defaultProps() {
    return {
      onGesture: () => {},
      config: DEFAULT_CONFIG,
    };
  }

  _state = INITIAL_STATE;

  _updatingPosition = false;
  _sectors = null;
  _handleTouchMove = e => this.handleTouchMove(e);
  _handleTouchEnd = e => this.handleTouchEnd(e);

  _updatePosition(touchPosition) {
    this._updatingPosition = false;
    const { current, moves } = this._state;
    const { dx, dy } = computeDeltas(current, touchPosition);
    const sectorIdx = computeSectorIdx(dx, dy);

    this._state = { 
      current: { x: current.x + dx, y: current.y + dy },
      moves: [ ...moves, this._sectors[sectorIdx] ],
    }
  }

  componentDidMount() {
    // create a resolution map of sectors
    this._sectors = createSectors();
  }

  handleTouchStart(e, child) {
    // add event handlers to the body
    document.addEventListener('touchmove', this._handleTouchMove);
    document.addEventListener('touchend', this._handleTouchEnd);
    document.addEventListener('touchcancel', this._handleTouchEnd);

    // call child's and own callback from props since we're overwriting it
    child.props.onTouchStart && child.props.onTouchStart(e);
    this.props.onTouchStart && this.props.onTouchStart(e);
    
    const { clientX: x, clientY: y } = e.nativeEvent.touches[0];

    // set initial conditions for the touch event
    this._state = merge({}, this._state, {current: { x, y }});
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

    const config = convertToDefaultsObject(
      this.props.config, 'gesture', DEFAULT_CONFIG
    );

    if (this._state.moves.length < config.minMoves) {
      return;
    }

    const gesture = isArray(config.gesture) ? config.gesture.join("") : config.gesture;
    const distance = gestureLevenshtein(this._state.moves.join(""), gesture);

    if (distance < config.fudgeFactor) {
      this.props.onGesture();
    }

    this._state = INITIAL_STATE;
  }

  render() {
    const { children, __passThrough } = this.props;
    const child = isFunction(children) ? children({ ...passThrough }) : children;

    return React.cloneElement(React.Children.only(child), {
      onTouchStart: e => this.handleTouchStart(e, child),
      __passThrough: __passThrough,
    });
  }
}

export default CustomGesture;
