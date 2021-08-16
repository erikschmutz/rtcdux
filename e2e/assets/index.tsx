import store from "./ExampleState";
import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";

function RTCDux() {
  const [connected, setConnected] = useState<string[]>(
    Object.keys(store.__internalClient__.getInternalState()?.nodes!)
  );
  const [data, setData] = useState<string>();
  const [messages, setMessages] = useState<string[]>();

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

  console.log(store.__internalClient__.getConnections());

  return (
    <>
      <p>Current id: {store.getId()}</p>
    </>
  );
}

ReactDOM.render(<RTCDux />, document.getElementById("root"));
