import { cleanEnv, str } from 'envalid';

import AbstractService from './service';

class EnvService implements AbstractService {
  static envVariables = {
    NODE_ENV: str({
      choices: ['development', 'test', 'production'],
    }),
    PORT: str(),
  };

  static init(): void {
    cleanEnv(process.env, EnvService.envVariables, {
      reporter: ({ errors }: { errors: any }) => {
        if (Object.keys(errors).length > 0) {
          console.error(`Invalid env vars: ${Object.keys(errors)}`);
        }
      },
    });
    console.log(`Loaded env and running in env ${process.env['NODE_ENV']}`);
  }

  static getEnv(env: string): string {
    if (process.env[env] === undefined) {
      console.error(`Environment variable ${env} is not defined`);
    }
    return process.env[env]!;
  }
}

export default EnvService;
