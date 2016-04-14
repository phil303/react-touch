import React from 'react';
import { Motion, spring } from 'react-motion';
import clamp from 'lodash/clamp';
import shuffle from 'lodash/shuffle';

import { Draggable, Holdable, Swipeable, CustomGesture, moves } from '../../src/index';

const BORDER = 10;
const ICON_SIZE = 90;
const PADDING = 20;
const ICONS_PER_ROW = 3;
const CIRCLE = [
  moves.RIGHT, moves.DOWNRIGHT, moves.DOWN, moves.DOWNLEFT, moves.LEFT,
  moves.UPLEFT, moves.UP, moves.UPRIGHT, moves.RIGHT,
];

const _calcPosition = (i, slotSize) => {
  return {
    left: (i % ICONS_PER_ROW) * slotSize,
    marginLeft: (slotSize - ICON_SIZE) / 2 + PADDING,
    top: Math.floor(i / ICONS_PER_ROW) * slotSize + PADDING,
  };
};

class Dashboard extends React.Component {
  state = { currentPage: 0 };

  _onSwipe(increment) {
    const pages = this.props.pages.length;
    const currentPage = clamp(this.state.currentPage + increment, 0, pages - 1);
    this.setState({ currentPage });
  }

  render() {
    const { width, height } = this.props;
    const slotSize = (width - BORDER * 2 - PADDING * 2) / ICONS_PER_ROW;
    return (
      <div
        className="dashboard"
        style={{ width, height }}
        onTouchStart={e => e.preventDefault()}
        onTouchMove={e => e.preventDefault()}
      >
        {this.props.pages.map((icons, idx) => {
          const left = (idx - this.state.currentPage) * width;
          return (
            <Motion key={idx} style={{left: spring(left)}}>
              {style =>
                <div key={idx} style={style} className="page-wrapper">
                  <Page
                    icons={icons}
                    slotSize={slotSize}
                    onSwipe={increment => this._onSwipe(increment)}
                  />
                </div>
              }
            </Motion>
          );
        })}
        <div className="instructions">
          <ul>
            <li>This works on desktop web, your browser's device mode, or on your
              phone. If the aspect ratio looks off in device mode, refresh.</li>
            <li>The icons become draggable if you press and hold one for a second.</li>
            <li>If you swipe right, you'll transition to the next screen.</li>
            <li>To shuffle the icons, try a clockwise circle gesture.</li>
            <li>This whole demo is about 200 lines of code.</li>
          </ul>
        </div>
      </div>
    );
  }
}

class Page extends React.Component {
  state = {
    iconsDraggable: false,
    icons: this.props.icons,
    currentlyDragged: null,
  };

  _onHoldComplete() {
    this.setState({ iconsDraggable: true });
  }

  _onDrag(pos, icon) {
    const { slotSize } = this.props;
    const i = clamp(Math.floor(pos.top / slotSize), 0, this.state.icons.length);
    const j = clamp(Math.floor(pos.left / slotSize), 0, 2);
    const idx = i * ICONS_PER_ROW + j;

    const newIcons = [ ...this.state.icons ];
    const removeIdx = newIcons.indexOf(icon);
    newIcons.splice(removeIdx, 1);
    newIcons.splice(idx, 0, icon);

    this.setState({ icons: newIcons, currentlyDragged: { pos, id: icon.id } });
  }

  _onDragEnd() {
    this.setState({ currentlyDragged: null });
  }

  _onGesture() {
    this.setState({ icons: shuffle(this.state.icons) });
  }

  _onSwipe(increment) {
    if (this.state.iconsDraggable) {
      return;
    }
    this.props.onSwipe(increment);
  }

  _onTouchEnd() {
    if (this.state.iconsDraggable && !this.state.currentlyDragged) {
      this.setState({iconsDraggable: false});
    }
  }

  render() {
    return (
      <CustomGesture config={CIRCLE} onGesture={() => this._onGesture()}>
        <Swipeable
          onSwipeLeft={() => this._onSwipe(1)}
          onSwipeRight={() => this._onSwipe(-1)}
        >
          <div
            className="page"
            onClick={() => this._onTouchEnd()}
            onTouchEnd={() => this._onTouchEnd()}
          >
            {!this.state.iconsDraggable ?
              this.renderHoldableIcons() : this.renderDraggableIcons()}
          </div>
        </Swipeable>
      </CustomGesture>
    );
  }

  renderHoldableIcons() {
    return this.state.icons.map((icon, i) => {
      const style = {
        ..._calcPosition(i, this.props.slotSize),
        zIndex: 0,
        backgroundColor: icon.color,
      };
      return (
        <Holdable key={"hold-" + icon.id} onHoldComplete={() => this._onHoldComplete()}>
          <div className="icon" style={style}></div>
        </Holdable>
      );
    });
  }

  renderDraggableIcons() {
    return this.state.icons.map((icon, i) => {
      const { currentlyDragged } = this.state;
      let pos, zIndex, className;
      if (currentlyDragged && icon.id === currentlyDragged.id) {
        const { marginLeft } = _calcPosition(i, this.props.slotSize);
        pos = currentlyDragged.pos;
        pos.marginLeft = marginLeft;
        zIndex = 1;
        className = "icon";
      } else {
        pos = _calcPosition(i, this.props.slotSize);
        zIndex = 0;
        className = "icon shake";
      }
      const style = { ...pos, zIndex, backgroundColor: icon.color };

      return (
        <Draggable
          key={"drag-" + icon.id}
          position={pos}
          onDrag={newPos => this._onDrag(newPos, icon)}
          onDragEnd={() => this._onDragEnd()}
        >
          <div className={className} style={style}></div>
        </Draggable>
      );
    });
  }
}

export default Dashboard;
