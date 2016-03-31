import times from 'lodash/times';
import { sectorDistance } from './circleMath';

const BIG_NUM = 10000;


const gestureLevenshtein = (a, b) => {
  if (a.length === 0 || b.length === 0) {
    return BIG_NUM;
  }

  // create a levenshtein matrix
  const levMatrix = times(b.length + 1, () => {
    return times(a.length + 1, () => 0);
  });
  // make the first row and the first side column a big number
  for (let j=1; j<=a.length; j++) {
    levMatrix[0][j] = BIG_NUM;
  }
  for (let i=1; i<=b.length; i++) {
    levMatrix[i][0] = BIG_NUM;
  }

  // now compute the cells in the levenshtein matrix
  for (let i=1; i<=b.length; i++) {
    for (let j=1; j<=a.length; j++) {
      const cost = sectorDistance(a[j-1], b[i-1]);
      levMatrix[i][j] = Math.min(
        cost + levMatrix[i-1][j],
        cost + levMatrix[i][j-1],
        cost + levMatrix[i-1][j-1]
      );
    }
  }
  return levMatrix[b.length][a.length];
};

export default gestureLevenshtein;
