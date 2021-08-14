import { Action, Reducer, Store } from "redux";
import { RTCClient } from "./RTCClient";
import { RTCDuxStore } from "./RTCDux";

function createStore<S, A extends Action>(
  reducer: Reducer<S, A>
): Store<S, A> & { _connection: RTCClient } {
  const store = new RTCDuxStore<S, A>(reducer);
  // assigns the internal _connections
  return Object.assign(store, { _connection: store as RTCClient });
}

export default createStore;
