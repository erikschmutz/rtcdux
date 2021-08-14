import { Action, Reducer, Store } from "redux";
import { RTCClient } from "./RTCClient";
import { RTCDuxStore } from "./RTCDux";

function createStore<S, A extends Action>(
  reducer: Reducer<S, A>
): RTCDuxStore<S, A> {
  return new RTCDuxStore<S, A>(reducer);
}

export default createStore;
