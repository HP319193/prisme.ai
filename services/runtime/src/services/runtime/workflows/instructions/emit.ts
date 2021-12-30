import { Broker } from "@prisme.ai/broker";

export async function emit({ emit }: Prismeai.Emit, broker: Broker) {
  await broker.send(emit.event, emit.payload || {});
}
