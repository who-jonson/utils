/**
 * Class for `setTimeout` with controls.
 * @internal
 *
 * @category Class
 */
export default class Timer {
  private timerId: number | NodeJS.Timeout;
  private startedAt: number;
  private interval: number;
  /**
   * @readonly
   */
  readonly callback: CallableFunction;

  /**
   * @param cb - Callback for setTimeout
   * @param interval - delay (in millisecond)
   *
   * @beta
   */
  constructor(cb: (...args: unknown[]) => any, interval: number) {
    this.startedAt = Date.now();
    this.callback = cb;
    this.interval = interval;
    this.timerId = setTimeout(cb, interval);
  }

  /**
   * It stops the timer, then subtracts the time that has passed since the timer was started from the interval
   */
  pause() {
    this.stop();
    this.interval -= Date.now() - this.startedAt;
  }

  /**
   * It resumes the timer by setting the startedAt property to the current time, and then setting the timerId property to
   * the result of calling setTimeout with the callback and interval properties
   */
  resume() {
    this.stop();
    this.startedAt = Date.now();
    this.timerId = setTimeout(this.callback, this.interval);
  }

  stop() {
    clearTimeout(this.timerId);
  }
}
