import { ListenerSignature, TypedEmitter } from "tiny-typed-emitter";

class Observable<L extends ListenerSignature<L> = any> extends TypedEmitter<L> {
  private onMessageCallbacks: (() => void)[] = [];

  constructor() {
    super();
  }

  public emit<U extends keyof L>(event: U, ...args: Parameters<L[U]>): boolean {
    this.notifySubscribers();
    return super.emit(event, ...args);
  }

  public subscribe(callback: () => void) {
    this.onMessageCallbacks.push(callback);
    return () => {};
  }

  public notifySubscribers() {
    for (const callback of this.onMessageCallbacks) {
      callback();
    }
  }
}

export default Observable;
