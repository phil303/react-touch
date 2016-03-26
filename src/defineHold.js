import isFunction from 'lodash/isFunction';
import merge from 'lodash/merge';

const DEFAULT_INTERVAL = 250;
const DEFAULT_HOLD_LENGTH = 1000;

const defineHold = (config={}) => {
  const updateInterval = config.updateEvery || DEFAULT_INTERVAL;
  const holdLength = config.holdFor || DEFAULT_HOLD_LENGTH;

  return callback => {
    const createHoldTimers = (state, setState) => {
      const holdDownTimer = window.setInterval(() => {
        setState(merge({}, state, { 
          touch: { current: { time: new Date() }}
        }));
      }, updateInterval);

      const holdReleaseTimer = window.setTimeout(() => {
        callback();
      }, holdLength);

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
