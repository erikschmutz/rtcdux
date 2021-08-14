import store from "./ExampleState";
import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";

function RTCDux() {
  const [data, setData] = useState();
  const [stateStr, setState] = useState();
  const [sessionID, setSession] = useState();
  const [messages, setMessages] = useState();

  const update = () => {
    const connected = [];
    store.__internalClient__.getConnections().forEach((v) => {
      connected.push(v.peer);
    });

    setState({
      connections: connected,
      state: store.getState() || "No state",
    });
  };

  useEffect(() => {
    store.subscribe(() => {
      update();
    });
  }, []);

  const onJoinSession = () => {
    store.connect(sessionID);
  };

  const onPublishData = () => {
    store.dispatch({
      value: data,
      type: "UPDATE",
    });
  };

  return (
    <>
      <p>Session id: {store.__internalClient__.getId()}</p>
      <p>Connected to id: {sessionID}</p>
      <button onClick={() => update()}>Refresh</button>

      <p>Connect to id</p>
      <input onChange={(v) => setSession(v.target.value)}></input>
      <button onClick={onJoinSession}>Join session</button>
      <button onClick={() => store.disconnect()}>Leave session</button>
      <p>Send data</p>
      <input onChange={(v) => setData(v.target.value)}></input>
      <button onClick={onPublishData}>Publish data</button>
      <pre>{JSON.stringify(data, null, 4)}</pre>
      <pre>{JSON.stringify(stateStr, null, 4)}</pre>
      <pre>{JSON.stringify(messages, null, 4)}</pre>
    </>
  );
}

ReactDOM.render(<RTCDux />, document.getElementById("root"));
