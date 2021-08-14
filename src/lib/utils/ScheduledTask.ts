import { RTCClient } from "../RTCClient";

interface ScheduledTaskConfig {
  enabled?: boolean;
}

abstract class ScheduledTask {
  private intervalId: NodeJS.Timeout;
  private config: ScheduledTaskConfig;
  private isActive: boolean;

  constructor(protected client: RTCClient, config?: ScheduledTaskConfig) {
    this.config = {
      enabled: config?.enabled ?? true,
    };
  }

  abstract onEvent(): void;

  public schedule(interval: number) {
    if (this.config.enabled) {
      this.intervalId = setInterval(() => {
        this.onEvent();
      }, interval);
      this.isActive = true;
    }
  }

  public remove() {
    if (this.isActive) {
      clearInterval(this.intervalId);
      this.isActive = false;
    }
  }
}

export class HealthCheckScheduledTask extends ScheduledTask {
  onEvent() {
    this.client.publish({
      type: "ism://ping",
      payload: { peerId: this.client.getId(), timestamp: Date.now() },
    });
  }
}

export class RemoveUnresponsiveScheduledTask extends ScheduledTask {
  constructor(
    client: RTCClient,
    private unhealthyThreshold: number,
    config?: ScheduledTaskConfig
  ) {
    super(client, config);
  }

  onEvent() {
    const nodes = this.client.getInternalState().nodes;
    if (!nodes) return;

    for (const node in nodes) {
      const lastHealthCheck = nodes[node].lastHealthCheck;
      if (!lastHealthCheck) continue;

      if (Date.now() - lastHealthCheck > this.unhealthyThreshold) {
        this.client.publish({
          type: "ism://unresponsive",
          payload: { peerId: node, lastResponse: lastHealthCheck },
        });
      }
    }
  }
}
