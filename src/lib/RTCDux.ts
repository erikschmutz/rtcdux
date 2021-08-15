import { RTCClient } from "./RTCClient";
import { Reducer, Action, Observer } from "redux";
import Observable from "./utils/Observable";

export class RTCDuxStore<S, A extends Action> extends Observable {
  private state: S | undefined;
  private reducer: Reducer<S, A>;
  public __internalClient__: RTCClient;

  constructor(reducer: Reducer<S, A>, id?: string) {
    super();
    this.reducer = reducer;
    this.__internalClient__ = new RTCClient(id);
    this.__internalClient__.on("data", this.handlePublicEvent.bind(this));
  }

  private handlePublicEvent(action: any) {
    this.state = this.reducer(this.state, action as A);
    this.notifySubscribers();
  }

  public dispatch<T extends A>(action: T) {
    this.__internalClient__.publish({ type: "pdm://action", payload: action });
    this.notifySubscribers();
    return action;
  }

  public getState() {
    return this.state;
  }

  public replaceReducer(reducer: Reducer<S, A>) {
    this.reducer = reducer;
  }

  public [Symbol.observable]() {
    /**
     * The minimal observable subscription method.
     * @param {Object} observer Any object that can be used as an observer.
     * The observer object should have a `next` method.
     * @returns {subscription} An object with an `unsubscribe` method that can
     * be used to unsubscribe the observable from the store, and prevent further
     * emission of values from the observable.
     */
    const subscribe = (observer: Observer<S>) => {
      if (typeof observer !== "object" || observer === null) {
        // throw new TypeError(
        //   `Expected the observer to be an object. Instead, received: '${kindOf(
        //     observer
        //   )}'`
        // );
      }

      const observeState = () => {
        if (observer.next) {
          observer.next(this.getState()!);
        }
      };

      observeState();
      const unsubscribe = this.subscribe(observeState);
      return { unsubscribe };
    };

    return {
      subscribe,
      [Symbol.observable]() {
        return this;
      },
    };
  }

  public connect(peerId: string) {
    return this.__internalClient__.connect(peerId);
  }

  public disconnect() {
    return this.__internalClient__.disconnect();
  }

  public getId() {
    return this.__internalClient__.getId();
  }
}
