import { expect } from 'chai';

import gestureLevenshtein from '../gestureLevenshtein';
import moves from '../gestureMoves';


const UPCARET = [ moves.UPRIGHT, moves.DOWNRIGHT ];
const CIRCLE = [
  moves.RIGHT,
  moves.DOWNRIGHT,
  moves.DOWN,
  moves.DOWNLEFT,
  moves.LEFT,
  moves.UPLEFT,
  moves.UP,
  moves.UPRIGHT,
  moves.RIGHT,
];


describe("gestureLevenshtein", () => {
  it("should return a big number when an argument is an empty string", () => {
    expect(gestureLevenshtein("", "1")).to.equal(10000);
    expect(gestureLevenshtein("1", "")).to.equal(10000);
  });

  it("should return 0 when the arguments match", () => {
    expect(gestureLevenshtein(UPCARET, UPCARET)).to.equal(0);
    expect(gestureLevenshtein(CIRCLE, CIRCLE)).to.equal(0);
  });

  it("should return 0 when the arguments 'collapse' to be equal", () => {
    // Collapse here meaning if we were to manually remove consecutive
    // duplicates, the below value would collapse into "71".
    const humanUpCaret = "777777771111111";
    expect(gestureLevenshtein(UPCARET, humanUpCaret)).to.equal(0);

    const humanCircle = "0111122222233445555666700000";
    expect(gestureLevenshtein(CIRCLE, humanCircle)).to.equal(0);
  });

  it("should return correct values when arguments don't match", () => {
    const humanUpCaret = "77777777001111111";
    expect(gestureLevenshtein(UPCARET, humanUpCaret)).to.equal(2);

    const humanCircle = "0001121112222122233344445555665666777770";
    expect(gestureLevenshtein(CIRCLE, humanCircle)).to.equal(3);
  });
});
