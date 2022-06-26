import EventInterface from './event.interface';
import express from 'express';
import StreamingService from './streaming.service';

import Controller from '../interfaces/controller.interface';

import { PROCESS_STREAM_API } from '../path';

class StreamingController implements Controller {
  public path = PROCESS_STREAM_API;
  public router = express.Router();
  public streamingService = new StreamingService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${PROCESS_STREAM_API}`, this.processStream);
  }

  private processStream = async (
    request: express.Request,
    response: express.Response
  ) => {
    try {
      await this.streamingService.processStream(request.body as EventInterface);
      response.send('Success');
    } catch (error) {
      console.error(
        `Exception caught while parsing. Request: ${request.body}
         Error message: ${error.message} 
        Error stack: ${error.stack}`
      );
      response.send(error);
    }
  };
}

export default StreamingController;
