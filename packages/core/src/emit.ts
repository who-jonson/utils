export type EventType = string | symbol;
export type Handler<T = unknown> = (event: T) => void;

/*
* @class Emitter
**/
export class Emitter<Events extends Record<EventType, unknown>> {
  private readonly _t: EventTarget | DocumentFragment;

  constructor() {
    try {
      this._t = new EventTarget();
    }
    catch (e) {
      this._t = document?.createDocumentFragment();
    }
  }

  on<Key extends keyof Events>(event: Key, callback: Handler<Events[keyof Events]>, ctx = {}) {
    // @ts-ignore
    // eslint-disable-next-line prefer-spread
    callback._p = e => callback.apply(null, e._p);
    // @ts-ignore
    return this._t.addEventListener(event, callback._p, ctx);
  }

  off<Key extends keyof Events>(event: Key, callback: Handler<Events[keyof Events]>) {
    // @ts-ignore
    return this._t.removeEventListener(event, callback._p);
  }

  emit<Key extends keyof Events>(event: Key, args: Events[keyof Events]) {
    const e = new Event((event as string));
    // @ts-ignore
    e._p = args;
    return this._t.dispatchEvent(e);
  }

  once<Key extends keyof Events>(event: Key, callback: Handler<Events[keyof Events]>, ctx = {}) {
    return this.on(event, callback, { ...ctx, once: true });
  }
}
