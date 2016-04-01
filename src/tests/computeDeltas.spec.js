import { expect } from 'chai';

import computeDeltas from '../computeDeltas';

describe("computeDeltas", () => {
  it("should return a dx and a dy of 0 when the positions are the same", () => {
    const position = {x: 100, y: 100};
    expect(computeDeltas(position, position)).to.eql({dx: 0, dy: 0});
  });

  it("should return a negative dx when the position moves left", () => {
    const initial = {x: 100, y: 100};
    const current = {x: 80, y: 100};
    expect(computeDeltas(initial, current)).to.eql({dx: -20, dy: 0});
  });

  it("should return a positve dx when the position moves right", () => {
    const initial = {x: 100, y: 100};
    const current = {x: 120, y: 100};
    expect(computeDeltas(initial, current)).to.eql({dx: 20, dy: 0});
  });

  it("should return a positive dy when the position moves down", () => {
    const initial = {x: 100, y: 100};
    const current = {x: 100, y: 120};
    expect(computeDeltas(initial, current)).to.eql({dx: 0, dy: 20});
  });

  it("should return a negative dy when the position moves up", () => {
    const initial = {x: 100, y: 100};
    const current = {x: 100, y: 80};
    expect(computeDeltas(initial, current)).to.eql({dx: 0, dy: -20});
  });

  it("should return non-zero deltas when the position moves in two directions", () => {
    const initial = {x: 100, y: 100};
    const current = {x: 120, y: 120};
    expect(computeDeltas(initial, current)).to.eql({dx: 20, dy: 20});
  });
});
