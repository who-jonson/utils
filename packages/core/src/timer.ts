import Timer from './util/Timer';

/**
 * Timestamp value
 *
 * @category Time/Timer
 *
 * @__NO_SIDE_EFFECTS__
 */
export const timestamp = () => +Date.now();

/**
 * @param cb - Callback for setTimeout
 * @param interval - delay (in millisecond)
 *
 * @category Time/Timer
 *
 * @__NO_SIDE_EFFECTS__
 */
export function stoppableTimeOut(cb: (...args: unknown[]) => any, interval: number) {
  return new Timer(cb, interval);
}
