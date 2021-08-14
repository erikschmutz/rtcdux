import { RTCClient } from "../RTCClient";
import uniqueList from "../utils/uniqueList";
import { Action } from "./internalEvents";
import InternalState from "./internalState";

const internalReducer = (
  state: InternalState = {
    nodes: {},
  },
  action: Action,
  client: RTCClient
): InternalState => {
  if (action.type === "ism://init") {
    const id = action.payload.peerId;
    if (id in state.nodes) return { ...state };
    else
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.payload.peerId]: {
            lastHealthCheck: Date.now(),
          },
        },
      };
  }

  if (action.type === "ism://discover") {
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

  if (action.type === "ism://disconnect") {
    const newNeighbors = { ...state.nodes };
    delete newNeighbors[action.payload.peerId];

    return {
      ...state,
      nodes: newNeighbors,
    };
  }

  if (action.type === "ism://ping") {
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
