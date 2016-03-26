const DEFAULT_INTERVAL = 250;
const DEFAULT_HOLD_LENGTH = 1000;

const defineHold = (config={}) => {
  // TODO: would be great if this could allow for different units
  // defineHold({updatesEvery: ms(30)}) OR
  // defineHold({updatesEvery: sec(0.5)}) OR
  // defineHold({updatesEvery: percent(10)})
  const updateInterval = config.updateEvery || DEFAULT_INTERVAL;
  const holdLength = config.holdFor || DEFAULT_HOLD_LENGTH;

  return callback => {
    const createHoldTimers = updateState => {

      const holdDownTimer = window.setInterval(() => {
        updateState(holdLength);
      }, updateInterval);

      const holdReleaseTimer = window.setTimeout(callback, holdLength);

      return () => {
        window.clearInterval(holdDownTimer);
        window.clearTimeout(holdReleaseTimer);
      };
    };
    createHoldTimers.wrapped = true
    return createHoldTimers;
  };
};

export default defineHold;
