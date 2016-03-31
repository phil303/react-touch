import { expect } from 'chai';

import * as index from '../index';

const EXPORTS = [
  'Draggable',
  'Holdable',
  'Swipeable',
  'CustomGesture',
  'defineHold',
  'defineSwipe',
  'moves',
];

describe("index.js", () => {
  it("should have the correct exports", () => {
    expect(index).to.have.all.keys(EXPORTS);
  });

  it("should not have any extra exports", () => {
    expect(Object.keys(index)).to.have.lengthOf(EXPORTS.length);
  });
});
