import range from 'lodash/range';

const DIRECTIONS = 8;
const RESOLUTION = 128;
const CIRCLE_RADS = Math.PI * 2;
const SECTOR_RADS = CIRCLE_RADS / DIRECTIONS;
const STEP = CIRCLE_RADS / RESOLUTION;

export const sectorDistance = (a, b) => {
  const dist = Math.abs(parseInt(a, 10) - parseInt(b, 10));
  return dist > DIRECTIONS / 2 ? DIRECTIONS - dist : dist;
};

export const createSectors = () => {
  return range(0, CIRCLE_RADS + STEP, STEP).map(angle => {
    return Math.floor(angle / SECTOR_RADS);
  });
};

export const computeSectorIdx = (dx, dy) => {
  // Our sectors range from vertical to diagonal to horizontal. We want them
  // to range "around" those things. Using the "up" sector as an example,
  // relative to the vertical line representing the up direction we want the
  // sector to range between -1/16th to +1/16th of the circle around that
  // line. We can simplify the math by just adding 1/16th to our given angle.
  let angle = Math.atan2(dy, dx) + SECTOR_RADS / 2;
  if (angle < 0) {
    angle += CIRCLE_RADS;
  }
  // since we're dealing with floating point calculations here, floor
  // anything that comes out of the calculation back to the sectorIdx.
  return Math.floor(angle / CIRCLE_RADS * RESOLUTION);
};
