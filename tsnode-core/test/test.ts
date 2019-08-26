import { ConfigProvider } from '../lib';
import test from 'tape';
import {TestPlugin, PLUGIN_NAME } from "../example/simplePlugin";
import { TSNodeCore } from '../lib';
import { application } from '../example';
import Baz from '../example/Baz';
import Bar from '../example/Bar';
import Foo from '../example/Foo';

test('start server', async (t) => {
  application
    .start(() => {
      const plugin = application.Injector.getPlugin(PLUGIN_NAME);
      console.log(plugin)
      t.ok(plugin, 'Plugin should be defined');
      t.end();
    }
  );
})

test('plugin instance should works', (t) => {
  application
    .start(() => {
      const pluginInstance: TestPlugin = application.resolve<TestPlugin>(TestPlugin);
      const testParams = { test: 'testData' };
      pluginInstance.setParams(testParams);
      t.deepEqual(pluginInstance.params, testParams, 'Params should be equal');
      t.end();
    }
  );
});

test('plugin decorators should work', (t) => {
  application
    .start(() => {
      const plugin = application.Injector.getPlugin(PLUGIN_NAME);
      t.deepEqual(plugin.data, ['testOne', 'testTwo'] , 'Should be [\'testOne\', \'testTwo\']');
      t.end();
    }
  );
});

test('plugin injections should work', (t) => {
  application
    .start(() => {
      const pluginInstance: TestPlugin = application.resolve<TestPlugin>(TestPlugin);
      t.deepEqual(pluginInstance.getConfig('test'), 'test config field', 'Config should be equal');
      t.end();
    }
  );
});

test('plugin injections should work', (t) => {
  application
    .start(() => {
      const pluginInstance: TestPlugin = application.resolve<TestPlugin>(TestPlugin);
      t.deepEqual(pluginInstance.getConfig('test'), 'test config field', 'Config should be equal');
      t.end();
    }
  );
});

test('plugin injections should work', (t) => {
  application
    .start((config: ConfigProvider) => {
      t.deepEqual(config.test, 'test config field', 'Config should be equal');
      t.end();
    }
  );
});

test('plugin injections should work', (t) => {
  application
    .start((config: ConfigProvider) => {
      const barOne: Bar = application.resolve<Bar>(Bar);
      barOne.value = 'test value';
      const barTwo: Bar = application.resolve<Bar>(Bar);
      t.deepEqual(barTwo.value, 'test value', 'Config should be equal');
      t.deepEqual(barTwo.config.test, config.test, 'Config should be equal');
      t.end();
    }
  );
});

test('plugin injections should work', (t) => {
  application
    .start((config: ConfigProvider) => {
      const bazOne: Baz = application.resolve<Baz>(Baz);
      bazOne.value = 'test value';
      const bazTwo: Baz = application.resolve<Baz>(Baz);
      t.deepEqual(bazTwo.value, 'test value', 'Config should be equal');
      t.deepEqual(bazTwo.bar.config.test, config.test, 'Config should be equal');
      t.end();
    }
  );
});

test('plugin injections should work', (t) => {
  application
    .start((config: ConfigProvider) => {
      const fooOne: Foo = application.resolve<Foo>(Foo);
      const fooTwo: Foo = application.resolve<Foo>(Foo);
      t.notEqual(fooOne.id, fooTwo.id, 'should not be eqaul')
      t.deepEqual(fooTwo.baz.bar.config.test, config.test, 'Config should be equal');
      t.end();
    }
  );
});

// test('plugin injections should work', (t) => {
//   application
//     .start((config: ConfigProvider) => {
//       const barOne: Bar = application.resolve<Bar>(Bar);
//       barOne.value = 'test value';
//       const barTwo: Bar = application.resolve<Bar>(Bar);
//       t.deepEqual(barTwo.value, 'test value', 'Config should be equal');
//       t.end();
//     }
//   );
// });

// test('exit', (t) => {
//   t.end()
//   process.exit(0)
// })