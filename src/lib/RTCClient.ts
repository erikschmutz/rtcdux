import Peer from "peerjs";
import Message from "./models/Message";
import { Action } from "./redux/internalEvents";
import internalReducer from "./redux/internalReducer";
import InternalState from "./redux/internalState";
import hash from "./utils/hash";
import {
  HealthCheckScheduledTask,
  RemoveUnresponsiveScheduledTask,
} from "./utils/ScheduledTask";
import { TypedEmitter } from "tiny-typed-emitter";

const DEFAULT_PING_DELAY = 15 * 10000;
const DEFAULT_UNHEALTHY_THRESHOLD = DEFAULT_PING_DELAY * 3;

interface RTCClientEventEmitter {
  data: (data: any) => void;
}

export class RTCClient extends TypedEmitter<RTCClientEventEmitter> {
  // will be set on the reset() method
  private nodes: Map<string, Peer.DataConnection> = new Map();
  // will be set on the reset() method
  private messages!: Message[];

  private peer!: Peer;
  private id: string;
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

    this.registerSchedulers();
  }

  protected log(...data: any[]) {
    console.log("[RTCClient] ", `(${this.peer.id})`, ...data);
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
    return "CLIENT" + Math.floor(Math.random() * 100);
  }

  public connect(connectionId: string) {
    console.log(connectionId, this.nodes);
    if (connectionId in this.nodes.keys()) return;

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
        this.publish({ type: "ism://init", payload: { peerId: this.getId() } });
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
      type: "ism://disconnect",
      payload: { peerId: this.peer.id },
    });
  }

  public publish(action: Action) {
    this.log(action);
    this.internalState = internalReducer(this.internalState, action, this);

    const msg = new Message(action);
    for (const neighborId of this.nodes.keys()) {
      const neighbor = this.nodes.get(neighborId)!;
      if (neighbor.open) neighbor.send(msg);
    }

    this.onMessage(msg);
  }

  private handlePublicEvent(action: Action) {
    if (action.type === "pdm://action") {
      this.emit("data", action.payload);
    }
  }

  private reset() {
    if (this.peer) {
      this.peer.destroy();
    }

    this.peer = new Peer(this.getId());
    this.messages = [];
    this.internalState = undefined;
    this.publish({
      type: "ism://init",
      payload: {
        peerId: this.getId(),
      },
    });
  }

  private handleInternalEvent(action: Action) {
    this.internalState = internalReducer(this.internalState, action, this);

    if (action.type === "ism://init") {
      if (!this.internalState) {
        throw new Error("No internal state created before handeling event!");
      }

      if (action.payload.peerId !== this.getId()) {
        this.publish({
          type: "ism://discover",
          payload: {
            nodesIds: Object.keys(this.internalState.nodes),
            peerId: this.peer.id,
          },
        });
      }
    }

    if (action.type === "ism://disconnect") {
      if (action.payload.peerId === this.getId()) {
        setTimeout(() => {
          this.reset();
          this.disconnectToMissingNeigbors();
        }, 100);
      } else {
        this.disconnectToMissingNeigbors();
      }
    }

    console.log("UPDATING NEIGHOBRS");

    this.connectToNewNeighbors();
  }

  public onMessage(message: Message) {
    this.messages.push(message);
    if (!("data" in message)) {
      throw new Error("bad format on incomming request");
    }

    const action = message.data;

    if (action.type.startsWith("pdm://")) {
      return this.handlePublicEvent(action);
    }

    if (action.type.startsWith("ism://")) {
      return this.handleInternalEvent(action);
    }
  }

  public async connectToNewNeighbors() {
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

  private cleanUp() {
    for (const neighborId of this.nodes.keys()) {
      // We should not close our selves
      if (!this.nodes.get(neighborId)!.open) this.nodes.delete(neighborId);
    }
  }

  public async disconnectToMissingNeigbors() {
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
