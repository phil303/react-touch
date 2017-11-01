import { expect } from 'chai';
import sinon from 'sinon';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import times from 'lodash/times';

import { documentEvent, renderComponent, createFakeRaf,
  nativeTouch, ExampleComponent } from './helpers';
import moves from '../gestureMoves';
import CustomGesture from '../CustomGesture.react';
import TouchHandler from '../TouchHandler';

/* eslint-disable no-unused-expressions */

const renderCustomGesture = renderComponent(CustomGesture);
const fakeRaf = createFakeRaf();

describe("CustomGesture", () => {
  beforeEach(() => TouchHandler.__Rewire__('raf', fakeRaf));
  afterEach(() => TouchHandler.__ResetDependency__('raf'));

  it("should fire 'onGesture' with a qualifying gesture", () => {
    const alpha = [
      moves.DOWNRIGHT,
      moves.RIGHT,
      moves.UPRIGHT,
      moves.UP,
      moves.UPLEFT,
      moves.LEFT,
      moves.DOWNLEFT,
    ];
    const spy = sinon.spy();
    const component = renderCustomGesture({
      onGesture: spy,
      config: alpha,
    });
    TestUtils.Simulate.touchStart(
      ReactDOM.findDOMNode(component),
      {nativeEvent: nativeTouch(200, 300)}
    );
    documentEvent('touchmove', nativeTouch(210, 310)); // down-right
    fakeRaf.step();
    documentEvent('touchmove', nativeTouch(220, 320)); // down-right
    fakeRaf.step();
    documentEvent('touchmove', nativeTouch(230, 320)); // right
    fakeRaf.step();
    documentEvent('touchmove', nativeTouch(240, 310)); // up-right
    fakeRaf.step();
    documentEvent('touchmove', nativeTouch(240, 300)); // up
    fakeRaf.step();
    documentEvent('touchmove', nativeTouch(230, 290)); // up-left
    fakeRaf.step();
    documentEvent('touchmove', nativeTouch(220, 290)); // left
    fakeRaf.step();
    documentEvent('touchmove', nativeTouch(210, 300)); // down-left
    fakeRaf.step();
    documentEvent('touchmove', nativeTouch(200, 310)); // down-left
    fakeRaf.step();
    documentEvent('touchend');
    expect(spy.calledOnce).to.be.true;
  });

  it("should reset the state when touch is ended", () => {
    const component = renderCustomGesture();
    TestUtils.Simulate.touchStart(
      ReactDOM.findDOMNode(component),
      {nativeEvent: nativeTouch(200, 300)}
    );
    times(10, i => {
      documentEvent('touchmove', nativeTouch(200 + i * 20, 300));
      fakeRaf.step();
    });
    documentEvent('touchend');
    expect(component._state).to.eql({ current: null, moves: [] });
  });

  it("should reset the state when touch is ended even when there are no moves", () => {
    const component = renderCustomGesture();
    TestUtils.Simulate.touchStart(
      ReactDOM.findDOMNode(component),
      {nativeEvent: nativeTouch(200, 300)}
    );
    documentEvent('touchend');
    expect(component._state).to.eql({ current: null, moves: [] });
  });

  it("should render its child as its only output", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <CustomGesture>
        <div></div>
      </CustomGesture>
    );
    const output = renderer.getRenderOutput();
    expect(output.type).to.be.equal('div');
  });

  it("should pass the correct props to nested react-touch components", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <CustomGesture>
        <CustomGesture>
          <ExampleComponent />
        </CustomGesture>
      </CustomGesture>
    );
    const output = renderer.getRenderOutput();
    expect(output.props).to.have.keys([
      '__passThrough',
      'children',
      'config',
      'onGesture',
      'onMouseDown',
      'onTouchStart',
    ]);
  });

  it("should not pass custom props to its children", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <CustomGesture>
        <ExampleComponent />
      </CustomGesture>
    );
    const output = renderer.getRenderOutput();
    expect(output.props).to.have.keys(['onMouseDown', 'onTouchStart']);
  });

  it("should not pass custom props down to DOM nodes", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <CustomGesture>
        <div></div>
      </CustomGesture>
    );
    const output = renderer.getRenderOutput();
    expect(output.props).to.have.keys(['onMouseDown', 'onTouchStart']);
  });

  it("should remove listeners when the component unmounts", () => {
    const container = document.createElement('div');
    const spy = sinon.spy();
    const component = ReactDOM.render(
      <CustomGesture onGesture={spy} config={[moves.RIGHT]}>
        <div></div>
      </CustomGesture>,
      container
    );
    TestUtils.Simulate.touchStart(
      ReactDOM.findDOMNode(component),
      {nativeEvent: nativeTouch(200, 300)}
    );
    times(9, i => {
      documentEvent('touchmove', nativeTouch(200 + i * 20, 300));
      fakeRaf.step();
    });
    ReactDOM.unmountComponentAtNode(container);
    documentEvent('touchend');
    fakeRaf.step();
    expect(spy.notCalled).to.be.true;
  });
});
