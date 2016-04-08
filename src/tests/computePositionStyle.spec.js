import { expect } from 'chai';

import computePositionStyle from '../computePositionStyle';

describe("computePositionStyle", () => {
  it("should output any keys that you used as inputs", () => {
    const styles = { left: 100, right: 30, translateX: 100 };
    const deltas = { dx: 20, dy: 10 };
    const keys = ['left', 'right', 'translateX'];
    expect(computePositionStyle(styles, deltas)).to.have.all.keys(keys);
  });

  it("should not skip 0 values", () => {
    const styles = { left: 0 };
    const deltas = { dx: 20 };
    expect(computePositionStyle(styles, deltas)).to.eql({left: 20});
  });

  it("should should correctly increment 'left'", () => {
    const styles = { left: 100 };
    const deltas = { dx: 20 };
    expect(computePositionStyle(styles, deltas)).to.eql({left: 120});
  });

  it("should should correctly increment 'right'", () => {
    const styles = { right: 100 };
    const deltas = { dx: 20 };
    expect(computePositionStyle(styles, deltas)).to.eql({right: 80});
  });

  it("should should correctly increment 'top'", () => {
    const styles = { top: 100 };
    const deltas = { dy: 20 };
    expect(computePositionStyle(styles, deltas)).to.eql({top: 120});
  });

  it("should should correctly increment 'bottom'", () => {
    const styles = { bottom: 100 };
    const deltas = { dy: 20 };
    expect(computePositionStyle(styles, deltas)).to.eql({bottom: 80});
  });

  it("should should correctly increment 'translateX'", () => {
    const styles = { translateX: 100 };
    const deltas = { dx: 20 };
    expect(computePositionStyle(styles, deltas)).to.eql({translateX: 120});
  });

  it("should should correctly increment 'translateY'", () => {
    const styles = { translateY: 100 };
    const deltas = { dy: 20 };
    expect(computePositionStyle(styles, deltas)).to.eql({translateY: 120});
  });
});
