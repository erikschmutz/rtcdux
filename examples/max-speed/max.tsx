import store from "./ExampleState";
import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";

function RTCDux() {
  const [connectingTo, setConnectingTo] = useState<string>();
  const [state, setState] = useState(store.getState());
  const [updatesPerSecond, setUpdatesPerSecond] = useState<number | undefined>(
    1
  );

  useEffect(() => {
    return store.subscribe(() => {
      console.log("update");
      setState(store.getState());
    });
  }, []);

  useEffect(() => {
    if (!updatesPerSecond) return;

    const interval = setInterval(() => {
      console.log(store.getState()?.value);
      store.dispatch({
        type: "ICRMNT",
      });
    }, 1000 / updatesPerSecond);

    return () => {
      clearInterval(interval);
    };
  }, [updatesPerSecond]);

  const value = state?.value;

  console.log(store.__internalClient__.getInternalMessages());

  return (
    <>
      <p>
        Current id: {store.getId()} ({value})
      </p>
      <input onChange={(v) => setConnectingTo(v.target.value)}></input>
      <button onClick={() => store.connect(connectingTo!)}>Join session</button>

      <p>current value {state?.value}</p>
      <p>updates per second {updatesPerSecond || 0}</p>
      <button
        onClick={() => {
          setUpdatesPerSecond(undefined);
        }}
      >
        stop
      </button>
      <button
        onClick={() => {
          setUpdatesPerSecond(1);
        }}
      >
        start
      </button>
      <input
        onChange={(ev) => {
          setUpdatesPerSecond(Number.parseInt(ev.target.value));
        }}
        type="range"
        min="1"
        max="100"
        value={updatesPerSecond}
      />
    </>
  );
}

ReactDOM.render(<RTCDux />, document.getElementById("root"));
