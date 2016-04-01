import { expect } from 'chai';
import sinon from 'sinon';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

import Holdable from '../Holdable.react';
import defineHold from '../defineHold';

/* eslint-disable no-unused-expressions */

const documentEvent = (eventName) => {
  const evt = document.createEvent("HTMLEvents");
  evt.initEvent(eventName, true, true);
  document.dispatchEvent(evt);
};

const renderHoldable = (props) => {
  return TestUtils.renderIntoDocument(
    <Holdable {...props}>
      <div></div>
    </Holdable>
  );
};

describe("Holdable", () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it("should pass updates to callback child as 'holdProgress'", () => {
    const progressUpdates = [];
    const holdable = TestUtils.renderIntoDocument(
      <Holdable>
        {({ holdProgress }) => {
          progressUpdates.push(holdProgress);
          return <div></div>;
        }}
      </Holdable>
    );
    TestUtils.Simulate.touchStart(ReactDOM.findDOMNode(holdable));
    clock.tick(250);
    expect(progressUpdates).to.be.lengthOf(3);
    clock.tick(250);
    expect(progressUpdates[3]).to.be.above(progressUpdates[2]);
  });

  it("should fire a callback 'onHoldProgress' when progress is made", () => {
    const spy = sinon.spy();
    const holdable = renderHoldable({onHoldProgress: spy});
    TestUtils.Simulate.touchStart(ReactDOM.findDOMNode(holdable));
    clock.tick(1000);
    expect(spy.callCount).to.be.equal(4);
  });

  it("should fire a callback 'onHoldComplete' after hold is completed", () => {
    const spy = sinon.spy();
    const holdable = renderHoldable({onHoldComplete: spy});
    TestUtils.Simulate.touchStart(ReactDOM.findDOMNode(holdable));
    clock.tick(1500);
    expect(spy.calledOnce).to.be.true;
  });

  it("should stop firing 'onHoldProgress' when touch is moved", () => {
    const spy = sinon.spy();
    const holdable = renderHoldable({onHoldProgress: spy});

    TestUtils.Simulate.touchStart(ReactDOM.findDOMNode(holdable));
    clock.tick(250);
    expect(spy.calledOnce).to.be.true;
    documentEvent('touchmove');
    clock.tick(250);
    expect(spy.calledOnce).to.be.true;
  });

  it("should not fire 'onHoldComplete' when touch is moved", () => {
    const spy = sinon.spy();
    const holdable = renderHoldable({onHoldComplete: spy});

    TestUtils.Simulate.touchStart(ReactDOM.findDOMNode(holdable));
    clock.tick(250);
    documentEvent('touchmove');
    expect(spy.notCalled).to.be.true;
    clock.tick(1000);
    expect(spy.notCalled).to.be.true;
  });

  it("should stop firing 'onHoldProgress' when touch is released", () => {
    const spy = sinon.spy();
    const holdable = renderHoldable({onHoldProgress: spy});
    TestUtils.Simulate.touchStart(ReactDOM.findDOMNode(holdable));
    clock.tick(250);
    documentEvent('touchend');
    clock.tick(250);
    expect(spy.calledOnce).to.be.true;
  });

  it("should not fire 'onHoldComplete' when touch is released", () => {
    const spy = sinon.spy();
    const holdable = renderHoldable({onHoldComplete: spy});
    TestUtils.Simulate.touchStart(ReactDOM.findDOMNode(holdable));
    clock.tick(250);
    documentEvent('touchend');
    clock.tick(1000);
    expect(spy.notCalled).to.be.true;
  });


  it("should alter its progress updates when 'updateEvery' is used", () => {
    const spy = sinon.spy();
    const config = defineHold({updateEvery: 50});
    const holdable = renderHoldable({ onHoldProgress: spy, config });
    TestUtils.Simulate.touchStart(ReactDOM.findDOMNode(holdable));

    expect(spy.notCalled).to.be.true;
    clock.tick(50);
    expect(spy.calledOnce).to.be.true;
    clock.tick(50);
    expect(spy.calledTwice).to.be.true;
    clock.tick(50);
    expect(spy.calledThrice).to.be.true;
  });


  it("should alter its hold length when 'holdFor' is used", () => {
    const spy = sinon.spy();
    const config = defineHold({holdFor: 500});
    const holdable = renderHoldable({ onHoldComplete: spy, config });
    TestUtils.Simulate.touchStart(ReactDOM.findDOMNode(holdable));

    clock.tick(250);
    expect(spy.notCalled).to.be.true;
    clock.tick(500);
    expect(spy.calledOnce).to.be.true;
    clock.tick(500);
    expect(spy.calledOnce).to.be.true;
  });

  it("should render its child as its only output", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <Holdable>
        <div></div>
      </Holdable>
    );
    const output = renderer.getRenderOutput();
    expect(output.type).to.be.equal('div');
  });

  it("should pass the correct props to its child", () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <Holdable>
        <div></div>
      </Holdable>
    );
    const output = renderer.getRenderOutput();
    expect(output.props).to.have.keys(['__passThrough', 'onTouchStart']);
  });
});
