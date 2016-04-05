import { expect } from 'chai';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

import { documentEvent, renderComponent, createFakeRaf, nativeTouch } from './helpers';
import Draggable from '../Draggable.react';

/* eslint-disable no-unused-expressions */

const renderDraggable = renderComponent(Draggable);
const fakeRaf = createFakeRaf();
Draggable.__Rewire__('raf', fakeRaf);

describe("Draggable", () => {
  it("should pass the 'translate' style updates to the callback child", () => {
    let update;
    const draggable = TestUtils.renderIntoDocument(
      <Draggable style={{translateX: 150, translateY: 150}}>
        {({ translateX, translateY }) => {
          update = { translateX, translateY };
          return <div></div>;
        }}
      </Draggable>
    );
    TestUtils.Simulate.touchStart(
      ReactDOM.findDOMNode(draggable),
      {nativeEvent: nativeTouch(200, 300)}
    );
    documentEvent('touchmove', nativeTouch(220, 280));
    fakeRaf.step();
    expect(update).to.eql({translateX: 170, translateY: 130});
  });

  it("should pass the absolutely positioned style updates to the callback child", () => {
    let update;
    const draggable = TestUtils.renderIntoDocument(
      <Draggable style={{left: 150, top: 150, bottom: 10, right: 20}}>
      {({ top, left, right, bottom }) => {
        update = { top, left, right, bottom };
        return <div></div>;
      }}
      </Draggable>
    );
    TestUtils.Simulate.touchStart(
      ReactDOM.findDOMNode(draggable),
      {nativeEvent: nativeTouch(200, 300)}
    );
    documentEvent('touchmove', nativeTouch(220, 280));
    fakeRaf.step();
    expect(update).to.eql({left: 170, top: 130, bottom: 30, right: 0});
  });

  it("should pass the delta updates to the callback child", () => {
    let update;
    const draggable = TestUtils.renderIntoDocument(
      <Draggable style={{left: 150, top: 150}}>
      {({ dx, dy }) => {
        update = { dx, dy };
        return <div></div>;
      }}
      </Draggable>
    );
    TestUtils.Simulate.touchStart(
      ReactDOM.findDOMNode(draggable),
      {nativeEvent: nativeTouch(200, 300)}
    );
    documentEvent('touchmove', nativeTouch(220, 280));
    fakeRaf.step();
    expect(update).to.eql({dx: 20, dy: -20});
  });

  it("should reset only the touch state when touch is ended", () => {
    const initial ={translateX: 100, translateY: 100};
    const draggable = renderDraggable({style: initial});
    TestUtils.Simulate.touchStart(
      ReactDOM.findDOMNode(draggable),
      {nativeEvent: nativeTouch(200, 300)}
    );
    documentEvent('touchend');
    expect(draggable.state).to.eql({
      component: { initial, current: initial },
      touch: { initial: null, current: null, deltas: { dx: 0, dy: 0 } },
    });
  });

  it("should render its child as its only output", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <Draggable style={{translateX: 100, translateY: 100}}>
        <div></div>
      </Draggable>
    );
    const output = renderer.getRenderOutput();
    expect(output.type).to.be.equal('div');
  });

  it("should pass the correct props to its child", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <Draggable style={{translateX: 100, translateY: 100}}>
        <div></div>
      </Draggable>
    );
    const output = renderer.getRenderOutput();
    expect(output.props).to.have.keys(['__passThrough', 'onTouchStart']);
  });
});
