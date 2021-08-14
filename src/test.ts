import { RTCClient } from "./lib/RTCClient";

export const test = async () => {
  console.log("testing rtc");
  const client = new RTCClient("host1");
  const clientTwo = new RTCClient("host2");
  const clientThree = new RTCClient("host3");
  const clientFour = new RTCClient("host4");

  const id = await client.create();

  setTimeout(async () => {
    await clientTwo.join(id);
    clientTwo.publish({
      type: "ism://init",
      payload: { peerId: clientTwo.peer.id },
    });
  }, 1000);

  setTimeout(async () => {
    await clientThree.join(id);
    clientThree.publish({
      type: "ism://init",
      payload: { peerId: clientThree.peer.id },
    });
    console.log(clientThree);
  }, 2000);

  setTimeout(() => {
    console.log(client.peer.id);
    console.log(client.internalState);
    console.log(client.neighbors);
    //
    console.log(clientTwo.peer.id);
    console.log(clientTwo.internalState);
    console.log(clientTwo.neighbors);
    //
    console.log(clientThree.peer.id);
    console.log(clientThree.internalState);
    console.log(clientThree.neighbors);
  }, 3000);

  setTimeout(() => {
    clientThree.publish({
      type: "ism://echo",
      payload: "echo from client three",
    });
  }, 5000);

  setTimeout(() => {
    clientTwo.publish({
      type: "ism://echo",
      payload: "echo from client two",
    });
  }, 7000);

  setTimeout(async () => {
    await clientFour.join("host2");
    clientFour.publish({
      type: "ism://init",
      payload: { peerId: clientFour.peer.id },
    });
  }, 10000);

  setTimeout(() => {
    console.log(client.internalState);
    console.log(clientTwo.internalState);
    console.log(clientThree.internalState);
    console.log(clientFour.internalState);
  }, 11000);
};
