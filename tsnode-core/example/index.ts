import IOCContainer from '../lib'
import { TestPlugin } from './simplePlugin/plugin';
import Foo from '../example/Foo'
import Bar from '../example/Bar'
import Baz from '../example/Baz'
import Boo from './Boo';
import Goo from './Goo';
import WeakDep from './WeakDep';
import WeakableFoo from './WeakableFoo';

function setConfig(config) {
  config.test = 'test config field';
}

const application = new IOCContainer();

application
  .usePlugin(TestPlugin)
  .registerModule(Foo)
  .registerModule(Bar)
  .registerModule(Baz)
  .registerModule(Boo)
  .registerModule(Goo)
  .registerModule(WeakDep)
  .registerModule(WeakableFoo)
  .useConfig(setConfig);

export { application };
