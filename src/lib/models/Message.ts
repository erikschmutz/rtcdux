import { Action } from "../redux/internalEvents";

class Message {
  action: Action;
  id: string;
  timestamp: number;

  constructor(action: Action) {
    this.action = action;
    this.id = this.generateId();
    this.timestamp = Date.now();
  }

  private generateId() {
    return Math.floor(Math.random() * 1000).toString();
  }
}

export default Message;
