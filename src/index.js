import React from 'react';
import ReactDOM from 'react-dom';
import isFunction from 'lodash/isFunction';
import merge from 'lodash/merge';

import getDerivedState from './getDerivedState';

const T = React.PropTypes;

const INITIAL_STATE = {
  component: {
    position: {
      initial: null,
      current: null,
      final: null,
    }
  },
  touch: {
    position: {
      initial: null,
      current: null,
      final: null,
    },
  },
};

const POSITION_KEYS = ['left', 'top', 'bottom', 'right'];

class Touchable extends React.Component {
  static propTypes = {
    children: T.oneOfType([T.func, T.element]).isRequired,
    style: T.objectOf(PropTypes.oneOfType([T.number, T.object])).isRequired,
    onTouchStart: T.func,
    onTouchEnd: T.func,
    onTouchMove: T.func,
    onSwipe: T.func,
    onHold: T.func,
  };

  _state = INITIAL_STATE;

  componentDidMount() {
    const { style } = this.props;
    const positions = filter(style, (_, k) => POSITION_KEYS.indexOf(k) > 0);
    console.log("positions", positions);
    const initial = positions.reduce((style, k) => {
      style[k] = this.props.style[k];
      return style;
    }, {});
    this._mergeState({ component: { position: initial } });
  }

  _mergeState(newState) {
    this._state = merge({}, this._state, newState);
  }

  onTouchStart(e) {
    this._callPropsHandler('onTouchStart', e);
  }

  onTouchMove(e) {
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
