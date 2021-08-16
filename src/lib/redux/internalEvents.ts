// internal status message

import Message from "../models/Message";

export type DisconnectAction = {
  type: "disconnect";
  payload: {
    peerId: string;
  };
};

export type PingAction = {
  type: "ping";
  payload: {
    peerId: string;
    timestamp: number;
  };
};

export type UnresponsiveAction = {
  type: "unresponsive";
  payload: {
    peerId: string;
    lastResponse: number;
  };
};

export type EchoAction = {
  type: "echo";
  payload: string;
};

export type DiscoverAction = {
  type: "discover";
  payload: {
    nodesIds: string[];
    peerId: string;
  };
};

export type DiscoverResponseAction = {
  type: "discover-response";
  payload: {
    nodesIds: string[];
    peerId: string;
  };
};

export type MessageAction = {
  type: "messages";
  payload: {
    messages: Message[];
    targetId?: string;
  };
};

// public data message
export type PDMPayloadAction = {
  type: "action";
  payload: any;
};

export type Action =
  | UnresponsiveAction
  | DiscoverAction
  | EchoAction
  | PDMPayloadAction
  | PingAction
  | MessageAction
  | DiscoverResponseAction
  | DisconnectAction;
