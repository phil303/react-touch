const computeDeltas = (oldPosition, newPosition) => {
  const { x: oldX, y: oldY } = oldPosition;
  const { x: newX, y: newY } = newPosition;
  return { dx: newX - oldX, dy: newY - oldY };
};

export default computeDeltas;
