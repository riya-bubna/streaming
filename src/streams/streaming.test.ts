import EventInterface from './event.interface';
import StreamingService from './streaming.service';

describe('StreamingService', () => {
  const streamingService = new StreamingService();
  const primaryResourceId = 6;
  it('send first packet for resource', async () => {
    const event: EventInterface = {
      primaryResourceId,
      dataPacketIndex: 5,
      isLastChunk: true,
      payload: 'hellothisisthe last chunk',
    };
    streamingService.processStream(event);
  });

  it('send few packets for resource', async () => {
    for (let i = 0; i < 2; i++) {
      const event: EventInterface = {
        primaryResourceId,
        dataPacketIndex: i + 1,
        isLastChunk: false,
        payload: `hello this is the chunk ${i + 1}`,
      };
      streamingService.processStream(event);
    }
    let event: EventInterface = {
      primaryResourceId: primaryResourceId + 1,
      dataPacketIndex: 20,
      isLastChunk: false,
      payload: `hellothisisthechunk20`,
    };
    streamingService.processStream(event);
    for (let i = 2; i < 4; i++) {
      const event: EventInterface = {
        primaryResourceId,
        dataPacketIndex: i + 1,
        isLastChunk: false,
        payload: `hello this is the chunk ${i + 1}`,
      };
      streamingService.processStream(event);
    }
    const event2: EventInterface = {
      primaryResourceId: primaryResourceId + 1,
      dataPacketIndex: 21,
      isLastChunk: true,
      payload: `hellothisisthechunk21`,
    };
    streamingService.processStream(event2);
    setTimeout(async () => {
      event = {
        primaryResourceId,
        dataPacketIndex: 6,
        isLastChunk: false,
        payload: `hello this is the chunk 11 which isn't a part of the current resource id`,
      };
      streamingService.processStream(event);
    }, 120 * 1000);
  });
});
