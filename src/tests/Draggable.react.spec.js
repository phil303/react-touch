import { expect } from 'chai';
import sinon from 'sinon';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

import { documentEvent, renderComponent, createFakeRaf,
  nativeTouch, ExampleComponent } from './helpers';
import Draggable from '../Draggable.react';
import TouchHandler from '../TouchHandler';

/* eslint-disable no-unused-expressions */

const renderDraggable = renderComponent(Draggable);
const fakeRaf = createFakeRaf();

describe("Draggable", () => {
  beforeEach(() => TouchHandler.__Rewire__('raf', fakeRaf));
  afterEach(() => TouchHandler.__ResetDependency__('raf'));

  it("should pass the 'translate' position updates to the callback child", () => {
    let update;
    const draggable = TestUtils.renderIntoDocument(
      <Draggable position={{translateX: 150, translateY: 150}}>
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

  it("should pass the absolute position updates to the callback child", () => {
    let update;
    const draggable = TestUtils.renderIntoDocument(
      <Draggable position={{left: 150, top: 150, bottom: 10, right: 20}}>
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

  it("should call the 'onDrag' callback on touchmove events", () => {
    const initial = {translateX: 100, translateY: 100};
    const spy = sinon.spy();
    const draggable = renderDraggable({position: initial, onDrag: spy});
    TestUtils.Simulate.touchStart(
      ReactDOM.findDOMNode(draggable),
      {nativeEvent: nativeTouch(200, 300)}
    );
    documentEvent('touchmove', nativeTouch(220, 280));
    fakeRaf.step();
    expect(spy.calledOnce).to.be.true;
  });

  it("should pass the updated positions to the 'onDrag' callback", () => {
    const initial = {translateX: 100, translateY: 100};
    const spy = sinon.spy();
    const draggable = renderDraggable({position: initial, onDrag: spy});
    TestUtils.Simulate.touchStart(
      ReactDOM.findDOMNode(draggable),
      {nativeEvent: nativeTouch(200, 300)}
    );
    documentEvent('touchmove', nativeTouch(220, 280));
    fakeRaf.step();
    expect(spy.calledWith({translateX: 120, translateY: 80})).to.be.true;
  });

  it("should pass the delta updates to the callback child", () => {
    let update;
    const draggable = TestUtils.renderIntoDocument(
      <Draggable position={{left: 150, top: 150}}>
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

  it("should call 'onDragEnd' on touchend", () => {
    const initial = {translateX: 100, translateY: 100};
    const spy = sinon.spy();
    const draggable = renderDraggable({position: initial, onDragEnd: spy});
    TestUtils.Simulate.touchStart(
      ReactDOM.findDOMNode(draggable),
      {nativeEvent: nativeTouch(200, 300)}
    );
    documentEvent('touchend');
    expect(spy.calledOnce).to.be.true;
  });

  it("should render its child as its only output", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <Draggable position={{translateX: 100, translateY: 100}}>
        <div></div>
      </Draggable>
    );
    const output = renderer.getRenderOutput();
    expect(output.type).to.be.equal('div');
  });

  it("should pass the correct props to nested react-touch components", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <Draggable position={{translateX: 100, translateY: 100}}>
        <Draggable position={{translateX: 100, translateY: 100}}>
          <ExampleComponent />
        </Draggable>
      </Draggable>
    );
    const output = renderer.getRenderOutput();
    expect(output.props).to.have.keys([
      '__passThrough',
      'children',
      'position',
      'onMouseDown',
      'onTouchStart',
    ]);
  });


  it("should not pass custom props to its children", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <Draggable position={{translateX: 100, translateY: 100}}>
        <ExampleComponent />
      </Draggable>
    );
    const output = renderer.getRenderOutput();
    expect(output.props).to.have.keys(['onMouseDown', 'onTouchStart']);
  });

  it("should not pass custom props down to DOM nodes", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <Draggable position={{translateX: 100, translateY: 100}}>
        <div></div>
      </Draggable>
    );
    const output = renderer.getRenderOutput();
    expect(output.props).to.have.keys(['onMouseDown', 'onTouchStart']);
  });
});
