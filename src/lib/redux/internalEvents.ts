// internal status message

import Message from "../models/Message";

export type ISMDisconnectAction = {
  type: "ism://disconnect";
  payload: {
    peerId: string;
  };
};

export type ISMPingAction = {
  type: "ism://ping";
  payload: {
    peerId: string;
    timestamp: number;
  };
};

export type ISMUnresponsiveAction = {
  type: "ism://unresponsive";
  payload: {
    peerId: string;
    lastResponse: number;
  };
};

export type ISMEchoAction = {
  type: "ism://echo";
  payload: string;
};

export type ISMDiscoverAction = {
  type: "ism://discover";
  payload: {
    nodesIds: string[];
    peerId: string;
  };
};

export type ISMDiscoverResponseAction = {
  type: "ism://discover-response";
  payload: {
    nodesIds: string[];
    peerId: string;
  };
};

export type ISMRegisterMessage = {
  type: "ism://messages";
  payload: {
    messages: Message[];
    targetId?: string;
  };
};

// public data message
export type PDMPayloadAction = {
  type: "pdm://action";
  payload: any;
};

export type Action =
  | ISMUnresponsiveAction
  | ISMDiscoverAction
  | ISMEchoAction
  | PDMPayloadAction
  | ISMPingAction
  | ISMRegisterMessage
  | ISMDiscoverResponseAction
  | ISMDisconnectAction;
