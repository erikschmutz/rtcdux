import { Action, Reducer, Store } from "redux";
import { RTCDuxStore } from "./RTCDux";

interface RTCClientConfig {
  id: string;
}

function createStore<S, A extends Action>(
  reducer: Reducer<S, A>,
  config?: RTCClientConfig
): RTCDuxStore<S, A> {
  return new RTCDuxStore<S, A>(reducer, config?.id);
}

export default createStore;
