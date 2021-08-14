class Observable {
  private onMessageCallbacks: (() => void)[] = [];

  public subscribe(callback: () => void) {
    this.onMessageCallbacks.push(callback);
    return () => {};
  }

  public notifySubscribers() {
    for (const callback of this.onMessageCallbacks) {
      callback();
    }
  }
}

export default Observable;
