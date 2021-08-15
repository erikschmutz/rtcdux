import store from "./ExampleState";
import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";

function RTCDux() {
  const [connected, setConnected] = useState<string[]>(
    Object.keys(store.__internalClient__.getInternalState()?.nodes!)
  );
  const [whole, setWhole] = useState<string>();
  const [messages, setMessages] = useState<string[]>();
  const [connectingTo, setConnectingTo] = useState<string>();
  const [newMessage, setNewMessage] = useState<string>();

  useEffect(() => {
    return store.subscribe(() => {
      const state = store.getState();
      if (state) setMessages(state.messages);
    });
  }, []);

  useEffect(() => {
    return store.__internalClient__.subscribe(() => {
      const connectedNodes = store.__internalClient__.getInternalState()?.nodes;
      if (connectedNodes) setConnected(Object.keys(connectedNodes));
    });
  }, []);

  console.log(store.__internalClient__.getInternalMessages());

  return (
    <>
      <p>Current id: {store.getId()}</p>
      <input onChange={(v) => setConnectingTo(v.target.value)}></input>
      <button onClick={() => store.connect(connectingTo!)}>Join session</button>
      <button onClick={() => store.disconnect()}>Leave session</button>

      <p>Send data({store.__internalClient__.getInternalMessages().length})</p>
      <input onChange={(v) => setNewMessage(v.target.value)}></input>

      <button
        onClick={() =>
          store.dispatch({
            type: "ADD",
            message: newMessage!,
          })
        }
      >
        Add message
      </button>
      <button
        onClick={() =>
          store.dispatch({
            type: "REMOVE",
            message: newMessage!,
          })
        }
      >
        Remove message
      </button>
      <h2>Connected nodes({connected?.length})</h2>
      <ul>
        {connected?.map((connected) => {
          return <li key={connected}>{connected}</li>;
        })}
      </ul>

      <h2>Sent data</h2>
      <ul>
        {messages?.map((message) => {
          return <li key={message}>{message}</li>;
        })}
      </ul>
    </>
  );
}

ReactDOM.render(<RTCDux />, document.getElementById("root"));
