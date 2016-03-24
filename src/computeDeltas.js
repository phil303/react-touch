const computeDeltas = (oldPosition, newPosition) => {
  
  const { x: oldX, y: oldY } = oldPosition;
  const { x: newX, y: newY } = newPosition;

  const dx = current.x - origin.x;
  const dy = current.y - origin.y;
   
  return { dx, dy };
};

export default computeDeltas;
