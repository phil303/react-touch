import raf from 'raf';

const extractPosition = callback => (evt, ...args) => {
  let nativeEvent = evt;
  if (!(evt instanceof window.Event)) {
    nativeEvent = evt.nativeEvent;
  }

  let touchPosition = null;
  if (nativeEvent.touches && nativeEvent.touches.length) {
    const touch = nativeEvent.touches[0];
    touchPosition = { x: touch.clientX, y: touch.clientY };
  } else if (nativeEvent.clientX && nativeEvent.clientY) {
    touchPosition = { x: nativeEvent.clientX, y: nativeEvent.clientY };
  }
  return callback(touchPosition, evt, ...args);
};


class TouchHandler {
  constructor(onTouchStart, onTouchMove, onTouchEnd) {
    // in the event both touch and click handlers can fire (e.g., chrome device
    // mode), only add one set of handlers
    this._listenersAdded = false;
    this._currentAnimationFrame = null;

    // delegated to callbacks
    this._onTouchStart = onTouchStart;
    this._onTouchMove = onTouchMove;
    this._onTouchEnd = onTouchEnd;

    this._handleTouchStart = extractPosition(this._handleTouchStart.bind(this));
    this._handleMouseDown = extractPosition(this._handleMouseDown.bind(this));

    this._handleTouchMove = extractPosition(this._handleTouchMove.bind(this));
    this._handleTouchEnd = extractPosition(this._handleTouchEnd.bind(this));
  }

  listeners(child, onTouchStart, onMouseDown) {
    return {
      onTouchStart: evt => this._handleTouchStart(evt, child, onTouchStart),
      onMouseDown: evt => this._handleMouseDown(evt, child, onMouseDown),
    };
  }

  removeListeners() {
    this._listenersAdded = false;
    document.removeEventListener('touchmove', this._handleTouchMove);
    document.removeEventListener('touchend', this._handleTouchEnd);
    document.removeEventListener('touchcancel', this._handleTouchEnd);
    document.removeEventListener('mousemove', this._handleTouchMove);
    document.removeEventListener('mouseup', this._handleTouchEnd);
  }

  cancelAnimationFrame() {
    raf.cancel(this._currentAnimationFrame);
    this._currentAnimationFrame = null;
  }

  _addTouchListeners() {
    this._listenersAdded = true;
    document.addEventListener('touchmove', this._handleTouchMove);
    document.addEventListener('touchend', this._handleTouchEnd);
    document.addEventListener('touchcancel', this._handleTouchEnd);
  }

  _addMouseListeners() {
    this._listenersAdded = true;
    document.addEventListener('mousemove', this._handleTouchMove);
    document.addEventListener('mouseup', this._handleTouchEnd);
  }

  _handleTouchStart(touchPosition, synthEvent, child, onTouchStart) {
    if (this._listenersAdded) return;
    this._addTouchListeners();

    child.props.onTouchStart && child.props.onTouchStart(synthEvent);
    onTouchStart && onTouchStart(synthEvent);
    this._onTouchStart(touchPosition);
  }

  _handleMouseDown(touchPosition, synthEvent, child, onMouseDown) {
    if (this._listenersAdded) return;
    this._addMouseListeners();

    child.props.onMouseDown && child.props.onMouseDown(synthEvent);
    onMouseDown && onMouseDown(synthEvent);
    this._onTouchStart(touchPosition);
  }

  _handleTouchMove(touchPosition) {
    if (!this._currentAnimationFrame) {
      this._currentAnimationFrame = raf(() => {
        this._currentAnimationFrame = null;
        this._onTouchMove(touchPosition);
      });
    }
  }

  _handleTouchEnd(touchPosition) {
    this.cancelAnimationFrame();
    this.removeListeners();
    this._onTouchEnd(touchPosition);
  }
}

export default TouchHandler;
