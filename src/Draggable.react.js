import React from 'react';
import raf from 'raf';
import isFunction from 'lodash/isFunction';

import computePositionStyle from './computePositionStyle';
import computeDeltas from './computeDeltas';


const T = React.PropTypes;
const ZERO_DELTAS = { dx: 0, dy: 0 };
const DEFAULT_TOUCH = { initial: null, current: null, deltas: ZERO_DELTAS };


class Draggable extends React.Component {

  static propTypes = {
    children: T.oneOfType([T.func, T.element]).isRequired,
    position: T.objectOf(T.oneOfType([T.number, T.object])).isRequired,
    onTouchStart: T.func,
    onDrag: T.func,
    onDragEnd: T.func,
    __passThrough: T.object,
  };

  state = DEFAULT_TOUCH;

  _updatingPosition = false;
  _currentAnimationFrame = null;
  _handleTouchMove = e => this.handleTouchMove(e);
  _handleTouchEnd = e => this.handleTouchEnd(e);

  _updatePosition(touchPosition) {
    this._updatingPosition = false;

    const { position } = this.props;
    const { deltas, current } = this.state;
    const touchDeltas = computeDeltas(current, touchPosition);
    const latestDeltas = {
      dx: deltas.dx + touchDeltas.dx,
      dy: deltas.dy + touchDeltas.dy,
    };
    const componentPosition = computePositionStyle(position, touchDeltas);

    this.props.onDrag && this.props.onDrag(componentPosition);
    this.setState({ deltas: latestDeltas, current: touchPosition });
  }

  _resetTouch() {
    raf.cancel(this._currentAnimationFrame);
    this._currentAnimationFrame = null;
  }

  passThroughState() {
    const { position } = this.props;
    const { deltas } = this.state;
    const current = computePositionStyle(position, deltas);
    return { ...current, ...deltas };
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
    const position = { x: clientX, y: clientY };
    this.setState({ initial: position, current: position });
  }

  handleTouchMove(e) {
    e.preventDefault();
    if (!this._updatingPosition) {
      const { clientX: x, clientY: y } = e.touches[0];
      this._currentAnimationFrame = raf(() => this._updatePosition({x, y}));
    }
    this._updatingPosition = true;
  }

  handleTouchEnd() {
    document.removeEventListener('touchmove', this._handleTouchMove);
    document.removeEventListener('touchend', this._handleTouchEnd);
    document.removeEventListener('touchcancel', this._handleTouchEnd);
    this.props.onDragEnd && this.props.onDragEnd();
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

export default Draggable;
