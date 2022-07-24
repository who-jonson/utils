/**
 * Class for `setTimeout` with controls.
 * @internal
 *
 * @category Class
 */
export default class Timer {
  private timerId: NodeJS.Timeout | number;
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

  pause() {
    this.stop();
    this.interval -= Date.now() - this.startedAt;
  }

  resume() {
    this.stop();
    this.startedAt = Date.now();
    this.timerId = setTimeout(this.callback, this.interval);
  }

  stop() {
    clearTimeout(this.timerId);
  }
}
