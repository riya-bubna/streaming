import App from './app';

import EnvService from './services/env';
import StreamingController from './streams/streaming.controller';

// EnvService should always be the first
const services = [EnvService];
for (const service of services) {
  service.init();
}

const app = new App([new StreamingController()]);
app.listen();
