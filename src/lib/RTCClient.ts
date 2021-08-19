import Peer from "peerjs";
import Message from "./models/Message";
import {
  Action,
  DisconnectAction,
  DiscoverAction,
  MessageAction,
  UnresponsiveAction,
} from "./redux/internalEvents";
import internalReducer from "./redux/internalReducer";
import InternalState from "./redux/internalState";
import hash from "./utils/hash";
import {
  HealthCheckScheduledTask,
  RemoveUnresponsiveScheduledTask,
} from "./utils/ScheduledTask";
import Observable from "./utils/Observable";

const DEFAULT_PING_DELAY = 10 * 1000;
const DEFAULT_UNHEALTHY_THRESHOLD = DEFAULT_PING_DELAY * 3;

interface RTCClientEventEmitter {
  data: (data: any) => void;
  action: (action: Action) => void;
  reload: () => void;
  reset: () => void;
}

export class RTCClient extends Observable<RTCClientEventEmitter> {
  // will be set on the reset() method
  private nodes: Map<string, Peer.DataConnection> = new Map();

  // will be set on the reset() method
  private messages!: Message[];

  //
  private peer!: Peer;

  //
  private id: string;

  //
  private internalState: InternalState | undefined;

  constructor(id?: string) {
    super();

    this.id = id || this.generateId();
    this.nodes = new Map();
    this.reset();

    this.peer.on("connection", (conn) => {
      this.listenToConnection(conn);
      this.nodes.set(conn.peer, conn);
    });

    this.peer.on("error", (error) => {
      console.log(error);
      throw error;
    });

    this.publish({
      type: "discover",
      payload: {
        peerId: this.getId(),
        nodesIds: [this.getId()],
      },
    });

    this.registerSchedulers();
  }

  protected log(...data: any[]) {
    // console.log("[RTCClient] ", `(${this.peer.id})`, ...data);
  }

  private registerSchedulers() {
    new HealthCheckScheduledTask(this).schedule(DEFAULT_PING_DELAY);
    new RemoveUnresponsiveScheduledTask(
      this,
      DEFAULT_UNHEALTHY_THRESHOLD
    ).schedule(DEFAULT_PING_DELAY);
  }

  public getId() {
    return this.id;
  }

  private generateId() {
    return "CLIENT" + Math.floor(Math.random() * 10000);
  }

  public connect(connectionId: string) {
    if (connectionId in this.nodes.keys()) return Promise.resolve();

    const connection = this.peer.connect(connectionId);
    this.nodes.set(connectionId, connection);

    connection.on("error", (error) => {
      alert(error);
      throw error;
    });

    this.listenToConnection(connection);

    return new Promise<void>((res) => {
      connection.on("open", () => {
        this.log(
          "Opened new connection from ",
          this.peer.id,
          "to",
          connectionId
        );

        this.publish(
          {
            type: "discover",
            payload: {
              nodesIds: Object.keys(this.internalState?.nodes || {}),
              peerId: this.getId(),
            },
          },
          {
            type: "messages",
            payload: {
              messages: this.messages,
            },
          }
        );

        res();
      });
    });
  }

  public getNodes() {
    return this.internalState?.nodes;
  }

  public getConnections() {
    return this.nodes;
  }

  public getInternalState() {
    return this.internalState;
  }

  public startSession() {
    this.create();
    return this.getId();
  }

  private listenToConnection(connection: Peer.DataConnection) {
    connection.on("data", (data) => {
      this.log(this.peer.id, "recieved", data);
      this.onMessage(data);
    });

    connection.on("close", () => {
      this.log(connection.peer, "close");
    });
  }

  public async create() {
    return new Promise<string>((res, rej) => {
      this.peer.on("open", () => {
        this.log("Peer opened " + this.peer.id);
        res(this.peer.id);
      });

      this.peer.on("error", (error) => {
        rej(error);
      });
    });
  }

  public getInternalMessages() {
    return this.messages;
  }

  public disconnect() {
    this.publish({
      type: "disconnect",
      payload: { peerId: this.peer.id },
    });
  }

  public publish(...actions: Action[]) {
    for (const action of actions) {
      this.log(action);
      this.internalState = internalReducer(this.internalState, action, this);

      const msg = new Message(action);
      for (const neighborId of this.nodes.keys()) {
        const neighbor = this.nodes.get(neighborId)!;
        if (neighbor.open) neighbor.send(msg);
      }

      this.onMessage(msg);
    }
  }

  private reset() {
    if (this.peer) {
      this.peer.destroy();
    }

    this.peer = new Peer(this.getId());
    this.messages = [];
    this.internalState = undefined;
    this.emit("reset");
  }

  private handleDiscoverAction(action: DiscoverAction) {
    if (!this.internalState) return;

    if (action.payload.peerId !== this.getId()) {
      this.publish(
        {
          type: "discover-response",
          payload: {
            nodesIds: Object.keys(this.internalState.nodes),
            peerId: this.getId(),
          },
        },
        {
          type: "messages",
          payload: {
            messages: this.messages,
            targetId: action.payload.peerId,
          },
        }
      );
    }

    this.connectToNewNeighbors();
  }

  private handleMessageAction(action: MessageAction) {
    if (
      action.payload.targetId === undefined ||
      action.payload.targetId === this.getId()
    ) {
      this.addMessage(...action.payload.messages);
      this.replay();
    }
  }

  private handleDisconnectAction(action: DisconnectAction) {
    if (action.payload.peerId === this.getId()) {
      setTimeout(() => {
        this.reset();
        this.disconnectToMissingNeigbors();

        this.publish({
          type: "discover",
          payload: {
            peerId: this.getId(),
            nodesIds: [this.getId()],
          },
        });
      }, 100);
    } else {
      this.disconnectToMissingNeigbors();
    }
  }

  private handleUnresponsive(__: UnresponsiveAction) {
    this.disconnectToMissingNeigbors();
  }

  private handleAction(action: Action, onlyState = false) {
    this.internalState = internalReducer(this.internalState, action, this);

    if (onlyState) {
      return this.emit("data", action.payload);
    }

    switch (action.type) {
      case "discover":
        return this.handleDiscoverAction(action);
      case "messages":
        return this.handleMessageAction(action);
      case "disconnect":
        return this.handleDisconnectAction(action);
      case "unresponsive":
        return this.handleUnresponsive(action);
      case "action":
        return this.emit("data", action.payload);
      case "discover-response":
        return this.connectToNewNeighbors();
    }
  }

  public reload() {
    this.emit("reload");
  }

  private addMessage(...messages: Message[]) {
    for (const message of messages) {
      if (message.action.type === "messages") continue;
      const messageIds = this.messages.map((message) => message.id);

      if (!messageIds.includes(message.id)) {
        this.messages.push(message);
        this.messages = this.messages.sort((msg1, msg2) => {
          return msg1.timestamp - msg2.timestamp;
        });
      }
    }
  }

  /**
   * Replays all the events until the time given. If
   * no time is given it replays all the events
   *
   * @param untilTime
   */
  private replay(untilTime?: number) {
    this.internalState = undefined;
    this.emit("reset");

    for (const message of this.messages) {
      // console.log("Replaying message with id " + message.id);
      if (untilTime && message.timestamp > untilTime) break;

      this.handleAction(message.action, true);
    }
  }

  public onMessage(message: Message) {
    if (!("action" in message)) {
      throw new Error("bad format on incomming request");
    }

    this.addMessage(message);
    this.handleAction(message.action);
    this.emit("action", message.action);
  }

  /**
   * Helper function to clean up the
   */
  private cleanUp() {
    // Remove all the neighbors from the connection map
    // which are currently close
    for (const neighborId of this.nodes.keys()) {
      // We should not close our selves
      if (!this.nodes.get(neighborId)?.open) this.nodes.delete(neighborId);
    }
  }

  /**
   * Loops threw the internal state sets up a connection with
   * neighbors which is not currently connected
   */
  private connectToNewNeighbors(): void {
    if (!this.internalState) return;

    for (const neighborId in this.internalState.nodes) {
      // Already has the neighbor
      if (this.nodes.has(neighborId)) continue;

      // makes sure that two connections do not both
      // connect to eachother
      if (hash(neighborId) > hash(this.peer.id)) {
        this.connect(neighborId);
      }
    }
  }

  /**
   * Loops threw and removes the connections
   * which no longer exists in the internal state
   */
  private disconnectToMissingNeigbors(): void {
    if (!this.internalState) return;

    // Removes all the connected one which does not still exist in state
    for (const neighborId of this.nodes.keys()) {
      // We should not close our selves
      if (neighborId === this.peer.id) continue;

      // Neighbor still exists
      if (neighborId in this.internalState.nodes) continue;

      console.log("CLOSING ", neighborId);
      // Neighbor is removed from the state
      this.nodes.get(neighborId)!.close();
    }

    this.cleanUp();
  }
}
