import store from "./ExampleState";
import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";

function RTCDux() {
  const [connectingTo, setConnectingTo] = useState<string>();
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    return store.subscribe(() => {
      setState(store.getState());
    });
  }, []);

  const value = state?.value;

  return (
    <>
      <p>
        Current id: {store.getId()} ({value})
      </p>
      <input onChange={(v) => setConnectingTo(v.target.value)}></input>
      <button onClick={() => store.connect(connectingTo!)}>Join session</button>

      <input
        onChange={(ev) => {
          store.dispatch({
            value: Number.parseInt(ev.target.value),
            type: "SET",
          });
        }}
        type="range"
        min="1"
        max="100"
        value={state?.value || 50}
      />
    </>
  );
}

ReactDOM.render(<RTCDux />, document.getElementById("root"));
