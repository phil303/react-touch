const DEFAULT_INTERVAL = 250;
const DEFAULT_HOLD_LENGTH = 1000;

const defineHold = (config={}) => {
  const updateInterval = config.updateEvery || DEFAULT_INTERVAL;
  const holdLength = config.holdFor || DEFAULT_HOLD_LENGTH;

  return {
    holdProgress: callback => updateState => {
      const holdDownTimer = setInterval(() => {
        callback();
        updateState(holdLength);
      }, updateInterval);
      return () => clearInterval(holdDownTimer);
    },
    holdComplete: callback => () => {
      const holdReleaseTimer = setTimeout(callback, holdLength);
      return () => clearTimeout(holdReleaseTimer);
    },
  };
};

export default defineHold;
