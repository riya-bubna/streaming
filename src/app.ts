import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import morganBody from 'morgan-body';
import helmet from 'helmet';

import Controller from './interfaces/controller.interface';

import EnvService from './services/env';

class App {
  public app: express.Application;

  constructor(controllers: readonly Controller[]) {
    this.app = express();
    this.initializeStandardMiddlewares();
    this.initializeControllers(controllers);
  }

  public listen(): void {
    this.app.listen(EnvService.getEnv('PORT'), () => {
      /* istanbul ignore next */
      console.info(`App listening on the port ${process.env.PORT}`);
    });
  }

  public getServer(): express.Application {
    return this.app;
  }

  private initializeStandardMiddlewares() {
    this.app.set('trust proxy', true);

    this.app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
    this.app.use(
      morgan('combined', {
        skip: (req: express.Request, _res: express.Response) => {
          if (req.baseUrl === '/checks') {
            return true;
          }

          return false;
        },
      })
    );
    this.app.use(
      helmet({
        contentSecurityPolicy: false,
      })
    );
    morganBody(this.app, {
      noColors: true,
      logResponseBody: process.env.NODE_ENV !== 'production',
      skip: (_req: express.Request, _res: express.Response) => {
        return false;
      },
    });
  }

  private initializeControllers(controllers: readonly Controller[]) {
    this.app.use('/checks', (_, response) => response.send());

    // All the generic containers as supplied by app
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }
}

export default App;
