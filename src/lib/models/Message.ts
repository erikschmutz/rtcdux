import { Action } from "../redux/internalEvents";

class Message {
  data: Action;
  id: string;

  constructor(action: Action) {
    this.data = action;
    this.id = this.generateId();
  }

  private generateId() {
    return Math.floor(Math.random() * 1000).toString();
  }
}

export default Message;
