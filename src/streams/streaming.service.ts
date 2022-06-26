import * as fs from 'fs';
import { Mutex } from '../utils/mutex';
import EventInterface from './event.interface';

class StreamingService {
  private static _instance: StreamingService = new StreamingService();

  constructor() {
    if (StreamingService._instance) {
      throw new Error(
        'Error: Instantiation failed: Use StreamingService.getInstance() instead of new.'
      );
    }
    StreamingService._instance = this;
  }

  public static getInstance(): StreamingService {
    return StreamingService._instance;
  }

  private static streamBuffer = new Map<number, Map<number, Array<number>>>();
  private static bufferMutex = new Map<number, Mutex>();

  private static BUFFER_TIMEOUT = 60 * 1000;
  private static OUTPUT_FOLDER_DIRECTORY = './outputFiles/';

  public async processStream(eventStream: EventInterface) {
    const primaryResourceData =
      StreamingService.streamBuffer.get(eventStream.primaryResourceId) ||
      new Map<number, Array<number>>();

    const duplicateData = primaryResourceData.get(eventStream.dataPacketIndex);
    if (duplicateData !== undefined) {
      // Ignore processing of packet if it is already processed
      return;
    }
    const processedData = await this.ancillaryServiceFunction(
      eventStream.payload
    );

    const collectionMutex =
      StreamingService.bufferMutex.get(eventStream.primaryResourceId) ||
      new Mutex();
    StreamingService.bufferMutex.set(
      eventStream.primaryResourceId,
      collectionMutex
    );
    await collectionMutex.dispatch(async () => {
      const currentBuffer =
        StreamingService.streamBuffer.get(eventStream.primaryResourceId) ||
        new Map<number, Array<number>>();
      currentBuffer.set(eventStream.dataPacketIndex, processedData);
      StreamingService.streamBuffer.set(
        eventStream.primaryResourceId,
        currentBuffer
      );
    });

    if (eventStream.isLastChunk) {
      setTimeout(
        () => this.handleLastPacket(eventStream),
        StreamingService.BUFFER_TIMEOUT
      );
    }
  }

  public async ancillaryServiceFunction(
    payload: string
  ): Promise<Array<number>> {
    return payload.split(' ').map((e) => e.length);
  }

  public async handleLastPacket(eventStream: EventInterface) {
    const primaryResourceData = StreamingService.streamBuffer.get(
      eventStream.primaryResourceId
    );
    if (primaryResourceData == undefined) {
      // The primary resource id is already processed
      return;
    }
    const orderedData = [...primaryResourceData]
      .sort((a, b) => a[0] - b[0])
      .map((e) => e[1]);
    this.downstreamServiceFunction(eventStream.primaryResourceId, orderedData);
    StreamingService.streamBuffer.delete(eventStream.primaryResourceId);
    StreamingService.bufferMutex.delete(eventStream.primaryResourceId);
  }

  public async downstreamServiceFunction(
    primaryResourceId: number,
    orderedData: Array<Array<number>>
  ): Promise<void> {
    const fileName = `${String(primaryResourceId)}.txt`;
    const path = `${StreamingService.OUTPUT_FOLDER_DIRECTORY}${fileName}`;

    const dataList = orderedData.reduce((output: number[], item: number[]) => {
      output.push(...item);
      return output;
    }, new Array<number>());
    if (!fs.existsSync(StreamingService.OUTPUT_FOLDER_DIRECTORY)) {
      fs.mkdirSync(StreamingService.OUTPUT_FOLDER_DIRECTORY);
    }
    await fs.writeFileSync(path, dataList.join('\n'));
  }
}

export default StreamingService;
