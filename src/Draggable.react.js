import React from 'react';
import isFunction from 'lodash/isFunction';

import TouchHandler from './TouchHandler';
import computePositionStyle from './computePositionStyle';
import computeDeltas from './computeDeltas';


const T = React.PropTypes;
const ZERO_DELTAS = { dx: 0, dy: 0 };
const DEFAULT_TOUCH = { initial: null, current: null, deltas: ZERO_DELTAS };


class Draggable extends React.Component {

  static propTypes = {
    children: T.oneOfType([T.func, T.element]).isRequired,
    position: T.objectOf(T.oneOfType([T.number, T.object])).isRequired,
    onMouseDown: T.func,
    onTouchStart: T.func,
    onDrag: T.func,
    onDragEnd: T.func,
    __passThrough: T.object,
  };

  constructor(props) {
    super(props);
    this.state = DEFAULT_TOUCH;
    this._touchHandler = new TouchHandler(
      this.handleTouchStart.bind(this),
      this.handleTouchMove.bind(this),
      this.handleTouchEnd.bind(this),
    );
  }

  passThroughState() {
    const { position } = this.props;
    const { deltas } = this.state;
    const current = computePositionStyle(position, deltas);
    return { ...current, ...deltas };
  }

  handleTouchStart(touchPosition) {
    this.setState({ initial: touchPosition, current: touchPosition });
  }

  handleTouchMove(touchPosition) {
    const { deltas, current } = this.state;
    const touchDeltas = computeDeltas(current, touchPosition);
    const componentPosition = computePositionStyle(this.props.position, touchDeltas);
    this.props.onDrag && this.props.onDrag(componentPosition);

    const latest = {dx: deltas.dx + touchDeltas.dx, dy: deltas.dy + touchDeltas.dy};
    this.setState({ deltas: latest, current: touchPosition });
  }

  handleTouchEnd() {
    this.props.onDragEnd && this.props.onDragEnd();
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

export default Draggable;
