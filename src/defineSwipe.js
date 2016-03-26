const DEFAULT_SWIPE_DISTANCE = 50;
const DEFAULT_SWIPE_VELOCITY = 10;

const IS_SWIPE = {
  'Left':  dx => -dx > swipeDistance,
  'Right': dx =>  dx > swipeDistance,
  'Up':    dy => -dy > swipeDistance,
  'Down':  dy =>  dy > swipeDistance,
};

const defineSwipe = (config={}) => {
  const swipeDistance = config.swipeDistance || DEFAULT_SWIPE_DISTANCE;
  const swipeVelocity = config.swipeVelocity || DEFAULT_SWIPE_VELOCITY;

  return callback => {
    const checkForSwipe = swipeDirection => {
      const thresholds = { swipeDistance, swipeVelocity };
      if (IS_SWIPE[name]) {
        callback();
      }
    };
    checkForSwipe.wrapped = true;
    return checkForSwipe;
  };
};

export default defineSwipe;
