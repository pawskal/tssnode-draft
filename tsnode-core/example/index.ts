import { IOCContainer } from '../lib'
import { TestPlugin } from './simplePlugin/plugin';
import Foo from '../example/Foo'
import Bar from '../example/Bar'
import Baz from '../example/Baz'

function setConfig(config) {
  config.test = 'test config field';
}

const application = new IOCContainer();

application
  .usePlugin(TestPlugin)
  .registerModule(Foo)
  .registerModule(Bar)
  .registerModule(Baz)
  .useConfig(setConfig);

export { application };
