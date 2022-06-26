class EventInterface {
  primaryResourceId!: number;
  payload!: string;
  dataPacketIndex!: number;
  isLastChunk!: boolean;
}

export default EventInterface;
