type NeighborStatus = {
  lastHealthCheck?: number;
};

type InternalState = {
  nodes: Record<string, NeighborStatus>;
};

export default InternalState;
