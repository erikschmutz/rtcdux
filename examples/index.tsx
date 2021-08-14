import store from "../src/lib/ExampleState";
import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";

function RTCDux() {
  const [data, setData] = useState();
  const [stateStr, setState] = useState();
  const [sessionID, setSession] = useState(store._connection.getId());
  const [members, setMembers] = useState();
  const [messages, setMessages] = useState();

  const update = () => {
    console.log(store.getState());
    setState({
      ...store._connection.getInternalState(),
      ...store.getState(),
      messages: store._connection.getInternalMessages(),
    });
  };

  useEffect(() => {
    store.subscribe(() => {
      update();
    });
    store._connection.subscribe(() => {
      update();
    });
  }, []);

  const onStartSession = () => {
    setSession(store._connection.startSession());
    update();
  };

  const onJoinSession = () => {
    setSession(store._connection.getId() + "=>" + sessionID);
    store._connection.join(sessionID);
  };

  const onPublishData = () => {
    store.dispatch({
      value: data,
      type: "UPDATE",
    });
  };

  return (
    <>
      <p>Session id: {sessionID}</p>
      <button onClick={() => update()}>Refresh</button>

      <p>Connect to id</p>
      <input onChange={(v) => setSession(v.target.value)}></input>
      <button onClick={onJoinSession}>Join session</button>
      <button onClick={() => store._connection.disconnect()}>
        Leave session
      </button>

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
