import { expect } from 'chai';
import sinon from 'sinon';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import omitBy from 'lodash/omitBy';
import isNull from 'lodash/isNull';

import { documentEvent, renderComponent, createFakeRaf,
  nativeTouch, ExampleComponent } from './helpers';
import Swipeable from '../Swipeable.react';
import defineSwipe from '../defineSwipe';
import TouchHandler from '../TouchHandler';

/* eslint-disable no-unused-expressions */

const renderSwipeable = renderComponent(Swipeable);
const fakeRaf = createFakeRaf();

const testSwipeDirection = (callback, failPos, successPos, config=null) => {
  const spy = sinon.spy();
  const props = omitBy({ [callback]: spy, config }, isNull);
  const swipeable = renderSwipeable(props);
  TestUtils.Simulate.touchStart(
    ReactDOM.findDOMNode(swipeable),
    {nativeEvent: nativeTouch(200, 300)}
  );
  documentEvent('touchmove', { touches: [failPos] });
  fakeRaf.step();
  expect(spy.calledOnce).to.be.false;
  documentEvent('touchmove', { touches: [successPos] });
  fakeRaf.step();
  expect(spy.calledOnce).to.be.true;
};

describe("Swipeable", () => {
  beforeEach(() => TouchHandler.__Rewire__('raf', fakeRaf));
  afterEach(() => TouchHandler.__ResetDependency__('raf'));

  it("should fire 'onSwipeLeft' when swiped left", () => {
    testSwipeDirection('onSwipeLeft', { clientX: 101 }, { clientX: 100 });
  });

  it("should fire 'onSwipeRight' when swiped right", () => {
    testSwipeDirection('onSwipeRight', { clientX: 299 }, { clientX: 300 });
  });

  it("should fire 'onSwipeUp' when swiped up", () => {
    testSwipeDirection('onSwipeUp', { clientY: 201 }, { clientY: 200 });
  });

  it("should fire 'onSwipeDown' when swiped down", () => {
    testSwipeDirection('onSwipeDown', { clientY: 399 }, { clientY: 400 });
  });

  it("should reset the state when touch is ended", () => {
    const swipeable = renderSwipeable();
    TestUtils.Simulate.touchStart(
      ReactDOM.findDOMNode(swipeable),
      {nativeEvent: nativeTouch(200, 300)}
    );
    documentEvent('touchend');
    expect(swipeable.state).to.eql(
      {initial: null, current: null, deltas: { dx: 0, dy: 0 }}
    );
  });

  it("should alter its distance threshold when 'swipeDistance is used", () => {
    const config = defineSwipe({swipeDistance: 75});
    testSwipeDirection('onSwipeLeft', { clientX: 126 }, { clientX: 125 }, config);
  });

  it("should render its child as its only output", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Swipeable><div></div></Swipeable>);
    const output = renderer.getRenderOutput();
    expect(output.type).to.be.equal('div');
  });

  it("should pass the correct props to nested react-touch components", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Swipeable>
      <Swipeable><div></div></Swipeable>
    </Swipeable>);
    const output = renderer.getRenderOutput();
    expect(output.props).to.have.keys([
      '__passThrough',
      'children',
      'config',
      'onMouseDown',
      'onTouchStart',
    ]);
  });

  it("should not pass custom props to its children", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Swipeable><ExampleComponent /></Swipeable>);
    const output = renderer.getRenderOutput();
    expect(output.props).to.have.keys(['onMouseDown', 'onTouchStart']);
  });

  it("should not pass custom props down to DOM nodes", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Swipeable><div></div></Swipeable>);
    const output = renderer.getRenderOutput();
    expect(output.props).to.have.keys(['onMouseDown', 'onTouchStart']);
  });

  it("should remove listeners when the component unmounts", () => {
    const container = document.createElement('div');
    const spy = sinon.spy();
    const swipeable = ReactDOM.render(
      <Swipeable onSwipeLeft={spy}>
        <div></div>
      </Swipeable>,
      container
    );
    TestUtils.Simulate.touchStart(
      ReactDOM.findDOMNode(swipeable),
      {nativeEvent: nativeTouch(200, 300)}
    );
    ReactDOM.unmountComponentAtNode(container);
    documentEvent('touchmove', nativeTouch(100, 300));
    fakeRaf.step();
    expect(spy.notCalled).to.be.true;
  });
});
