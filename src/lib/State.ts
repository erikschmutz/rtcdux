// import Peer, { DataConnection } from "peerjs";

// export type DataMessage<E = any> = {
//   id: string;
//   meta?: {
//     retry?: number;
//   };
//   action: E;
// };

// export type ReducerFunction<T, E> = (state: T, action: E) => T;
// export type SubscriberFunction<T> = (state: T) => void;

// export abstract class State<T = any, E = any> {
//   private connectionId?: string;
//   private isHost: boolean = false;
//   private peer: Peer;
//   private connections: DataConnection[] = [];
//   private callbacks: ((state: T) => void)[] = [];
//   private state: T;
//   private reducer: ReducerFunction<T, E>;
//   private messages: DataMessage<E>[] = [];

//   constructor(reducer: ReducerFunction<T, E>, initialState?: T) {
//     this.state = initialState;
//     this.reducer = reducer;
//     this.peer = new Peer();
//   }

//   private relayMessage() {}

//   private ackMessage() {}

//   private generateConnectionId() {
//     return "C-123576";
//   }

//   private listenToConnection(connection: DataConnection) {
//     console.log("connection listening...", connection);
//     connection.on("data", (data: DataMessage) => {
//       console.log("data recieved for connection");
//       this.onMessage(data, connection);
//     });

//     connection.on("error", (data) => {
//       this.onError(data, connection);
//     });

//     connection.on("close", () => {
//       this.onClose(connection);
//     });
//   }

//   private generateMessageId() {
//     return Math.random().toString();
//   }

//   public joinSession(connectionId: string) {
//     const conn = this.peer.connect(connectionId);

//     this.connections.push(conn);
//     this.listenToConnection(conn);

//     this.peer.on("connection", (conn) => {
//       this.connections.push(conn);
//       this.listenToConnection(conn);
//     });
//   }

//   public startSession(connectionId?: string) {
//     this.isHost = true;

//     if (connectionId === undefined) {
//       this.connectionId = this.generateConnectionId();
//     }

//     this.peer = new Peer(this.connectionId);

//     this.peer.on("open", (e) => {
//       console.log(this.peer);
//       console.log(e);
//     });

//     this.peer.on("connection", (conn) => {
//       this.connections.push(conn);
//       this.listenToConnection(conn);
//     });

//     return this.connectionId;
//   }

//   public getMessages() {
//     return this.messages;
//   }

//   public getState() {
//     return this.state;
//   }

//   public whole() {
//     return {
//       messages: this.messages,
//       connections: this.connections.map((v) => v.label),
//     };
//   }

//   public sendMessage(message: DataMessage<E>) {
//     for (const connection of this.connections) {
//       connection.send(message);
//     }
//   }

//   public onMessage(
//     message: DataMessage<E>,
//     connection?: DataConnection,
//     isLocal: boolean = false
//   ) {
//     //
//     this.state = this.reducer(this.state, message.action);
//     this.messages.push(message);
//     for (const callback of this.callbacks) {
//       callback(this.state);
//     }

//     if (this.isHost) {
//       // iuiuiui
//       // huiukjhgfdë
//     }
//   }

//   public notifySubscribers() {
//     for (const callback of this.callbacks) {
//       callback(this.state);
//     }
//   }

//   public buildMessage(action: E): DataMessage<E> {
//     return {
//       id: this.generateMessageId(),
//       action: action,
//     };
//   }

//   public onError({}, connection: DataConnection) {
//     //
//   }

//   public onClose(connection: DataConnection) {
//     //
//     this.connections = this.connections.filter((conn) => conn !== connection);
//   }

//   public dispatch(action: E) {
//     const message = this.buildMessage(action);
//     this.onMessage(message);
//     this.sendMessage(message);

//     this.notifySubscribers();
//   }

//   public subscribe(callback: SubscriberFunction<T>) {
//     this.callbacks.push(callback);
//   }
// }
