import React from 'react';
import ReactDOM from 'react-dom';
import isFunction from 'lodash/isFunction';
import merge from 'lodash/merge';
import filter from 'lodash/filter';
import keys from 'lodash/keys';

import computePosition from './computePosition';

const T = React.PropTypes;

const INITIAL_STATE = {
  component: {
    position: {
      initial: null,
      current: null,
    }
  },
  touch: {
    position: {
      initial: null,
      current: null,
    },
  },
};

const POSITION_KEYS = ['left', 'top', 'bottom', 'right', 'translateX', 'translateY'];

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

  _state = INITIAL_STATE;

  componentDidMount() {
    const initial = computePosition(this.props.style, { dx: 0, dy: 0 });
    this._mergeState({ component: { position: { initial } } });
  }

  _mergeState(newState) {
    this._state = merge({}, this._state, newState);
  }

  onTouchStart(e) {
    // TODO: touches, targetTouches, or changedTouches
    const { clientX: x, clientY: y } = e.nativeEvent.touches[0];
    this._mergeState({ touch: { position: { initial: {x, y} } } })

    this._callPropsHandler('onTouchStart', e);
  }

  onTouchMove(e) {
    const { clientX: x, clientY: y } = e.nativeEvent.touches[0];

    const deltas = computeDeltas(
      this._state.touch.position.current,
      { x, y }
    )

    const positionStyle = computePosition(
      this._state.component.position.current,
      deltas
    );

    this._mergeState({ touch: { position: { current: {x, y} } } })

    this._callPropsHandler('onTouchMove', e);
  }

  onTouchEnd(e) {
    this._callPropsHandler('onTouchEnd', e);
  }

  _callPropsHandler(name, e) {
    // handle user's touch event
    this.props[name] && this.props[name](e);
  }

  reset() {
    this._state = { ...this._state, ...INITIAL_STATE };
  }

  render() {
    const { children } = this.props;
    const renderedChildren = isFunction(children) ? children({}) : children;
    return React.cloneElement(React.Children.only(renderedChildren), {
      onTouchStart: e => this.onTouchStart(e),
      onTouchMove: e => this.onTouchMove(e),
      onTouchEnd: e => this.onTouchEnd(e),
    });
  }
}

export default Touchable;
