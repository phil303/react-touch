const DEFAULT_SWIPE_DISTANCE = 100;


const defineSwipe = (config={}) => {
  // TODO: add swipe velocity back in
  const swipeDistance = config.swipeDistance || DEFAULT_SWIPE_DISTANCE;

  return {
    onSwipeLeft: (current, initial, callback) => {
      if (-(current.x - initial.x) >= swipeDistance) {
        callback();
      }
    },
    onSwipeRight: (current, initial, callback) => {
      if ((current.x - initial.x) >= swipeDistance) {
        callback();
      }
    },
    onSwipeUp: (current, initial, callback) => {
      if (-(current.y - initial.y) >= swipeDistance) {
        callback();
      }
    },
    onSwipeDown: (current, initial, callback) => {
      if ((current.y - initial.y) >= swipeDistance) {
        callback();
      }
    },
  };
};

export default defineSwipe;
