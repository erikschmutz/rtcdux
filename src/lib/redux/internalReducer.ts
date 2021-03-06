import { RTCClient } from "../RTCClient";
import { Action } from "./internalEvents";
import InternalState from "./internalState";

const internalReducer = (
  state: InternalState = {
    nodes: {},
  },
  action: Action,
  client: RTCClient
): InternalState => {
  if (action.type === "discover" || action.type === "discover-response") {
    const newNodes = { ...state.nodes };
    for (const neigborId of action.payload.nodesIds) {
      if (neigborId in state.nodes)
        newNodes[neigborId] = state.nodes[neigborId];
      else
        newNodes[neigborId] = {
          lastHealthCheck: Date.now(),
        };
    }

    return {
      ...state,
      nodes: newNodes,
    };
  }

  if (action.type === "disconnect") {
    const newNeighbors = { ...state.nodes };
    delete newNeighbors[action.payload.peerId];

    return {
      ...state,
      nodes: newNeighbors,
    };
  }

  if (action.type === "unresponsive") {
    const newNeighbors = { ...state.nodes };
    delete newNeighbors[action.payload.peerId];

    return {
      ...state,
      nodes: newNeighbors,
    };
  }

  if (action.type === "ping") {
    return {
      ...state,
      nodes: {
        ...state.nodes,
        [action.payload.peerId]: {
          lastHealthCheck: action.payload.timestamp,
        },
      },
    };
  }

  return { ...state };
};

export default internalReducer;
