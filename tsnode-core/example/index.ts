import { TSNodeCore } from '../lib'
import { TestPlugin } from './simplePlugin/plugin';
import Foo from '../example/Foo'
import Bar from '../example/Bar'
import Baz from '../example/Baz'

function setConfig(config, data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      config.test = 'test config field';
      resolve();
    })
  })
}

const application = new TSNodeCore();
application
  .usePlugin(TestPlugin)
  .registerModule(Foo)
  .registerModule(Bar)
  .registerModule(Baz)
  .useConfig(setConfig);

export { application };
