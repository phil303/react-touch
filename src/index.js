import React from 'react';
import ReactDOM from 'react-dom';
import merge from 'lodash/merge';
import clamp from 'lodash/clamp';
import raf from 'raf';

import computePosition from './computePosition';
import computeDeltas from './computeDeltas';

const T = React.PropTypes;

// HACK
document.body.oncontextmenu = function() { return false; };


class Touchable extends React.Component {
  static propTypes = {
    children: T.oneOfType([T.func, T.element]).isRequired,
    style: T.objectOf(T.oneOfType([T.number, T.object])).isRequired,
    onTouchStart: T.func,
    onTouchEnd: T.func,
    onTouchMove: T.func,
    onSwipe: T.func,
    onHold: T.func,
  };

  state = {
    component: {
      initial: {
        position: computePosition(this.props.style, { dx: 0, dy: 0 }),
      },
      current: {
        position: computePosition(this.props.style, { dx: 0, dy: 0 }),
      },
    },
    touch: {
      initial: {
        position: null,
        time: null
      },
      current: {
        position: null,
        time: null
      },
    }
  };

  _updatingPosition = false;
  _holdDownTimer = null;
  _holdReleaseTimer = null;

  // TODO: configurable
  DEFAULT_HOLD_INTERVAL = 250;
  DEFAULT_HOLD_LENGTH = 1000;

  onTouchStart(e) {
    // TODO: touches, targetTouches, or changedTouches
    const { clientX: x, clientY: y } = e.nativeEvent.touches[0];
    const dimensions = { position: { x, y }, time: new Date() };

    const touch = merge({}, this.state.touch, {
      initial: dimensions, 
      current: dimensions
    });
    this.setState({ touch });

    // configuration stuff
    this._holdDownTimer = window.setInterval(() => {
      const touch = merge({}, this.state.touch, { current: { time: new Date() }})
      this.setState({ touch });
    }, this.DEFAULT_HOLD_INTERVAL);

    this._holdReleaseTimer = window.setTimeout(() => {
      this._callPropsHandler('onHold');
    }, this.DEFAULT_HOLD_LENGTH);

    this._callPropsHandler('onTouchStart', e);
  }

  onTouchMove(e) {
    if (!this._updatingPosition) {
      const { clientX: x, clientY: y } = e.nativeEvent.touches[0];
      raf(() => this._updatePosition({x, y}));
    }
    this._updatingPosition = true;
    this._clearHoldTimers();
    this._callPropsHandler('onTouchMove', e);
  }

  _updatePosition(touchPosition) {
    this._updatingPosition = false;

    const deltas = computeDeltas(this.state.touch.current, touchPosition);
    const componentPosition = computePosition(this.state.component.current, deltas);

    const state = merge({}, this.state, {
      touch: {current: { position: touchPosition }},
      component: {current: { position: componentPosition }},
    });

    this.setState({ state });
  }

  onTouchEnd(e) {
    this._clearHoldTimers();
    this._callPropsHandler('onTouchEnd', e);
  }

  _clearHoldTimers() {
    window.clearInterval(this._holdDownTimer);
    window.clearTimeout(this._holdReleaseTimer);
  }

  _callPropsHandler(name, e) {
    // handle user's touch handling
    // TODO: there's not always an e
    this.props[name] && this.props[name](e);
  }

  _calculateHoldPercent(current, initial) {
    if (current.time) {
      const percent = (current.time - initial.time) / this.DEFAULT_HOLD_LENGTH;
      return clamp(percent, 0, 1);
    }
    return 0;
  }

  render() {
    const { children } = this.props;
    const { component, touch } = this.state;

    const holdPercent = this._calculateHoldPercent(touch.current, touch.initial);
    const newProps = { ...component.current.position, holdPercent };

    return React.cloneElement(React.Children.only(children(newProps)), {
      onTouchStart: e => this.onTouchStart(e),
      onTouchMove: e => this.onTouchMove(e),
      onTouchEnd: e => this.onTouchEnd(e),
    });
  }
}

export default Touchable;
