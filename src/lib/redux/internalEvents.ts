// internal status message
export type ISMInitAction = {
  type: "ism://init";
  payload: {
    peerId: string;
  };
};

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

// public data message
export type PDMPayloadAction = {
  type: "pdm://action";
  payload: any;
};

export type Action =
  | ISMUnresponsiveAction
  | ISMInitAction
  | ISMDiscoverAction
  | ISMEchoAction
  | PDMPayloadAction
  | ISMPingAction
  | ISMDisconnectAction;
