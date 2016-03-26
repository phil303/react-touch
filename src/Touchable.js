import React from 'react';
import ReactDOM from 'react-dom';
import merge from 'lodash/merge';
import clamp from 'lodash/clamp';
import raf from 'raf';

import defineHold from './defineHold';
import defineSwipe from './defineSwipe';
import computePosition from './computePosition';
import computeDeltas from './computeDeltas';

const T = React.PropTypes;

// HACK
document.body.oncontextmenu = function() { return false; };


class Touchable extends React.Component {
  static propTypes = {
    children: T.func.isRequired,
    style: T.objectOf(T.oneOfType([T.number, T.object])).isRequired,
    onTouchStart: T.func,
    onTouchEnd: T.func,
    onTouchMove: T.func,
    onSwipe: T.func,
    onHold: T.func,
  };

  static get defaultProps() {
    return {
      onHold: () => {},
      onSwipeUp: () => {},
      onSwipeDown: () => {},
      onSwipeLeft: () => {},
      onSwipeRight: () => {},
    };
  }

  state = {
    component: {
      initial: { position: computePosition(this.props.style, { dx: 0, dy: 0 }) },
      current: { position: computePosition(this.props.style, { dx: 0, dy: 0 }) },
    },
    touch: {
      initial: { position: null, time: null },
      current: { position: null, time: null, duration: 0 },
    },
  };

  _handleTouchMove = (e) => this.handleTouchMove(e);
  _handleTouchEnd = (e) => this.handleTouchEnd(e);

  _handleHold = null;
  _handleSwipeUp = null;
  _handleSwipeDown = null;
  _handleSwipeLeft = null;
  _handleSwipeRight = null;
  _updatingPosition = false;
  _clearHoldTimers = null;

  _updatePosition(touchPosition) {
    this._updatingPosition = false;

    const { touch, component } = this.state;
    const deltas = computeDeltas(touch.current.position, touchPosition);
    const componentPosition = computePosition(component.current.position, deltas);

    this.setState(merge({}, this.state, {
      touch: {current: { position: touchPosition }},
      component: {current: { position: componentPosition }},
    }));

    ['Left', 'Right', 'Up', 'Down'].forEach((name) => {
      console.log("this", this);
      this[`_handleSwipe${name}`](name);
    });
  }

  _resetTouch() {
    this.setState(merge({}, this.state, {
      touch: { 
        initial: { position: null, time: null },
        current: { position: null, time: null, duration: 0 },
      },
    }));
  }

  handleTouchStart(e, child) {
    // add event handlers to the body
    document.addEventListener('touchmove', this._handleTouchMove);
    document.addEventListener('touchend', this._handleTouchEnd);

    // call child's and own callback from props since we're overwriting it
    child.props.onTouchStart && child.props.onTouchStart(e);
    this.props.onTouchStart && this.props.onTouchStart(e);
    
    const { clientX: x, clientY: y } = e.nativeEvent.touches[0];
    const dimensions = { position: { x, y }, time: new Date() };

    // set initial conditions for the touch event
    this.setState(merge({}, this.state, {
      touch: { initial: dimensions, current: dimensions }
    }));

    // create a callback that will be used after each hold interval
    const setTimeState = holdLength => {
      const time = new Date();
      const duration = (time - this.state.touch.initial.time) / holdLength;
      this.setState(merge({}, this.state, {
        touch: { current: { time, duration: clamp(duration, 0, 1) } }
      }));
    }

    this._clearHoldTimers = this._handleHold(setTimeState);
  }

  handleTouchMove(e) {
    e.preventDefault();
    if (!this._updatingPosition) {
      const { clientX: x, clientY: y } = e.touches[0];
      raf(() => this._updatePosition({x, y}));
    }
    this._updatingPosition = true;
    this._clearHoldTimers();
  }

  handleTouchEnd(e) {
    document.removeEventListener('touchmove', this._handleTouchMove);
    document.removeEventListener('touchend', this._handleTouchEnd);
    this._clearHoldTimers();
    this._resetTouch();
  }

  componentDidMount() {
    // Some trickery here. We want to allow both config-wrapped callbacks and 
    // normal callbacks. When we wrap a callback we add a `wrapped` property 
    // and check for that here. If it doesn't exist, wrap it (with the
    // defaults)
    const { onHold, onSwipeLeft, onSwipeUp, onSwipeRight, onSwipeDown } = this.props;
    this._handleHold = onHold.wrapped ? onHold : defineHold()(onHold);

    ['Left', 'Right', 'Up', 'Down'].forEach(name => {
      const handler = this.props[`onSwipe${name}`];
      const handleSwipe = handler.wrapped ? handler : defineSwipe()(handler);
      console.log("name", name);
      this[`_handleSwipe${name}`] = handleSwipe(name)
      console.log("this", this);
    });

  }

  render() {
    const { children } = this.props;
    const { component, touch } = this.state;

    const holdPercent = touch.current.duration;
    const newProps = { ...component.current.position, holdPercent };

    const child = children(newProps);

    return React.cloneElement(React.Children.only(child), {
      onTouchStart: (e) => this.handleTouchStart(e, child),
    });
  }
}

export default Touchable;
