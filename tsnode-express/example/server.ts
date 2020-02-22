import cors from 'cors';

import { ConfigProvider } from '@pskl/di-core';
import TSHttpExpress from '@pskl/ts-http-express'

import * as SomeModule from './someModule';
import * as AuthModule from './authModule';

import { InjectedService, IInjectedService } from './external.service';

const injectedService: InjectedService = new InjectedService({ 
  stub: 'injected as class'
});

function setConfig(config: ConfigProvider) {
  config.secret = 'SUPER SECRET'
  config.logLevels = ['info', 'success', 'error', 'warning'];
  config.printStack = false;
  config.port = process.env.PORT;
  config.redisHost = process.env.REDIS_HOST;
  config.redisPort = process.env.REDIS_PORT;
  config.redisPassword = process.env.REDIS_PASS;
  config.transportChannel = 'example';
  config.test = 'test config field';
}

const application = new TSHttpExpress();

application
  .use(cors())
  .useConfig(setConfig)
  .inject<InjectedService>(injectedService)
  .inject<IInjectedService, InjectedService>(IInjectedService, async () => ({ stub: 'injected as interface' }))
  .registerModule(SomeModule)
  .registerModule(AuthModule)

export default application;
