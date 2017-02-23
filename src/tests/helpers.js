import React from 'react';
import TestUtils from 'react-addons-test-utils';

export const documentEvent = (eventName, props={}) => {
  const evt = Object.assign(document.createEvent("HTMLEvents"), props);
  evt.initEvent(eventName, true, true);
  document.dispatchEvent(evt);
};

export const renderComponent = component => {
  const _component = React.createFactory(component);
  return props => TestUtils.renderIntoDocument(_component(props, <div></div>));
};

export const ExampleComponent = () => <div></div>;

export const nativeTouch = (x, y) => ({touches: [{ clientX: x, clientY: y }]});

export const createFakeRaf = () => {
  const FRAME_LENGTH = 1000 / 60;    // assume 60fps for now

  let callbacks = [];
  let time = 0;
  let id = 0;

  const raf = callback => {
    id += 1;
    callbacks.push({ callback, id });
    return id;
  };

  raf.cancel = cancelId => {
    callbacks = callbacks.filter(item => item.id !== cancelId);
  };

  raf.step = (steps=1) => {
    for (let i = 0; i < steps; i++) {
      time += FRAME_LENGTH;
      // eslint-disable-next-line no-loop-func
      callbacks.forEach(({ callback }) => callback(time));
      callbacks = [];
    }
  };

  return raf;
};
