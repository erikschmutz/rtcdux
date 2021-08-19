import createStore from "./ExampleState";
import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";

const params = new URLSearchParams(location.search);
const store = createStore(params.get("id"));

if (params.has("event_interval")) {
  let index = 0;
  const maxEvents = Number.parseInt(params.get("max_events")!);
  setInterval(() => {
    if (maxEvents && maxEvents > index++) return;

    store.dispatch({
      type: (params.get("event_type") || "ADD") as any,
      message: params.get("event_messsage") || "1234",
    });
  }, Number.parseInt(params.get("event_interval")!));
}

if (params.has("event_after")) {
  setTimeout(() => {
    store.dispatch({
      type: (params.get("event_type") || "ADD") as any,
      message: params.get("event_messsage") || "1234",
    });
  }, Number.parseInt(params.get("event_after")!));
}

function RTCDux() {
  const [connected, setConnected] = useState<string[]>(
    Object.keys(store.__internalClient__.getInternalState()?.nodes!)
  );
  const [data, setData] = useState<string>();
  const [messages, setMessages] = useState<string[]>();

  useEffect(() => {
    if (params.has("connect_to")) {
      setTimeout(() => {
        store
          .connect(params.get("connect_to")!)!
          .catch((error) => {
            setData(error.message);
          })
          .then(() => {
            setData("successfully connected!");
          });
      }, 100);
    }

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

  return (
    <>
      <h1>TEST</h1>
      <pre>{data}</pre>
      <p>Current id: {store.getId()}</p>
      <ul id="connected">
        {connected.map((peer) => {
          return <li>{peer}</li>;
        })}
      </ul>
      <p>{messages?.length}</p>
      <ul id="messages">
        {messages?.map((message) => {
          return <li>{message}</li>;
        })}
      </ul>
    </>
  );
}

ReactDOM.render(<RTCDux />, document.getElementById("root"));
