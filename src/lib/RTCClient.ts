import Peer from "peerjs";
import Message from "./models/Message";
import Observable from "./models/Observable";
import { Action } from "./redux/internalEvents";
import internalReducer from "./redux/internalReducer";
import InternalState from "./redux/internalState";
import uniqueList from "./utils/uniqueList";
import hash from "./utils/hash";
import {
  HealthCheckScheduledTask,
  RemoveUnresponsiveScheduledTask,
} from "./utils/ScheduledTask";
import { TypedEmitter } from "tiny-typed-emitter";

const DEFAULT_PING_DELAY = 15 * 1000;
const DEFAULT_UNHEALTHY_THRESHOLD = DEFAULT_PING_DELAY * 3;

interface RTCClientEventEmitter {
  data: (data: any) => void;
}

export class RTCClient extends TypedEmitter<RTCClientEventEmitter> {
  private nodes = new Map<string, Peer.DataConnection>();
  private messages: Message[] = [];
  private peer: Peer;
  private internalState: InternalState | undefined;

  constructor(id?: string) {
    super();

    this.peer = new Peer(id || this.generateId());

    this.peer.on("connection", (conn) => {
      this.listenToConnection(conn);
      this.nodes.set(conn.peer, conn);
    });

    this.peer.on("error", (error) => {
      console.log(error);
      throw error;
    });

    this.publish({
      type: "ism://init",
      payload: {
        peerId: this.getId(),
      },
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

  private getId() {
    return this.peer.id;
  }

  private generateId() {
    return "CLIENT" + Math.floor(Math.random() * 100);
  }

  private connect(connectionId: string) {
    if (connectionId in this.nodes.keys()) return;

    const connection = this.peer.connect(connectionId);
    this.nodes.set(connectionId, connection);
    console.log("this.neighbors", this.nodes);

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

  async join(connectionId: string) {
    await this.connect(connectionId);
  }

  public getNodes() {
    return this.internalState?.nodes;
  }

  public getInternalState() {
    return this.internalState;
  }

  public startSession() {
    this.create();
    return this.getId();
  }

  private listenToConnection(connection: Peer.DataConnection) {
    console.log(connection);
    connection.on("data", (data) => {
      this.log(this.peer.id, "recieved", data);
      this.onMessage(data);
    });

    connection.on("close", () => {
      this.log(this.peer.id, "close");
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
    this.peer.disconnect();
  }

  public publish(action: Action): void {
    this.log(action);
    this.internalState = internalReducer(this.internalState, action, this);

    const msg = new Message(action);
    this.messages.push(msg);

    for (const neighborId of this.nodes.keys()) {
      const neighbor = this.nodes.get(neighborId);
      neighbor.send(msg);
    }
  }

  private handlePublicEvent(action: Action) {
    if (action.type === "pdm://action") {
      this.emit("data", action.type);
    }
  }

  private handleInternalEvent(action: Action) {
    this.internalState = internalReducer(this.internalState, action, this);

    if (action.type === "ism://init") {
      this.publish({
        type: "ism://discover",
        payload: {
          nodesIds: Object.keys(this.internalState.nodes),
          peerId: this.peer.id,
        },
      });
    }

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
}
