import Timer from './util/Timer';

/**
 * Timestamp value
 *
 * @category Time/Timer
 */
export const timestamp = () => +Date.now();

/**
 * @param cb - Callback for setTimeout
 * @param interval - delay (in millisecond)
 *
 * @category Time/Timer
 */
export function stoppableTimeOut(cb: (...args: unknown[]) => any, interval: number) {
  return new Timer(cb, interval);
}
