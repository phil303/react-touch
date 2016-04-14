import raf from 'raf';

class TouchHandler {
  constructor(onTouchStart, onTouchMove, onTouchEnd) {
    this._currentAnimationFrame = null;

    this._onTouchStart = onTouchStart;
    this._onTouchMove = onTouchMove;
    this._onTouchEnd = onTouchEnd;

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }

  _removeListeners() {
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('touchcancel', this.handleTouchEnd);
  }

  _addListeners() {
    document.addEventListener('touchmove', this.handleTouchMove);
    document.addEventListener('touchend', this.handleTouchEnd);
    document.addEventListener('touchcancel', this.handleTouchEnd);
  }

  handleTouchStart(evt, child) {
    this._addListeners();
    this._onTouchStart(evt, child);
  }

  handleTouchMove(evt) {
    evt.preventDefault();
    if (!this._currentAnimationFrame) {
      this._currentAnimationFrame = raf(() => {
        this._currentAnimationFrame = null;
        this._onTouchMove(evt);
      });
    }
  }

  handleTouchEnd(evt) {
    this.cancelAnimationFrame();
    this._removeListeners();
    this._onTouchEnd(evt);
  }

  removeListeners() {
    this._removeListeners();
  }

  cancelAnimationFrame() {
    raf.cancel(this._currentAnimationFrame);
    this._currentAnimationFrame = null;
  }
}

export default TouchHandler;
