const DEFAULT_SWIPE_DISTANCE = 100;
const DEFAULT_SWIPE_VELOCITY = 10;


const defineSwipe = (config={}) => {
  const swipeDistance = config.swipeDistance || DEFAULT_SWIPE_DISTANCE;
  const swipeVelocity = config.swipeVelocity || DEFAULT_SWIPE_VELOCITY;

  return {
    onSwipeLeft: (current, initial, callback) => {
      if (-(current.x - initial.x) > swipeDistance) {
        callback();
      }
    },
    onSwipeRight: (current, initial, callback) => {
      if ((current.x - initial.x) > swipeDistance) {
        callback();
      }
    },
    onSwipeUp: (current, initial, callback) => {
      if ((current.y - initial.y) > swipeDistance) {
        callback();
      }
    },
    onSwipeDown: (current, initial, callback) => {
      if (-(current.y - initial.y) > swipeDistance) {
        callback();
      }
    },
  };
};

export default defineSwipe;
