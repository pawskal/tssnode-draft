import tape from 'tape';
import { TestPlugin, PLUGIN_NAME } from "../example/simplePlugin";
import { application } from '../example';
import Baz from '../example/Baz';
import Bar from '../example/Bar';
import Foo from '../example/Foo';
import Goo from '../example/Goo';
import Boo from '../example/Boo';
import WeakableFoo from '../example/WeakableFoo';
import WeakDep from '../example/WeakDep';
import { ResolveTypes } from '../lib';

const tqueue = []

const test = (name, cb: tape.TestCase) => {
  tape(name, async (t) => {
    try {
      await cb(t)
    } catch (e) {
      // console.error(e)
      t.notOk(e)
    } finally {
      t.end()
    }
  })
}

application.setup()


test('Plugin should be defined', async (t) => {
  const plugin = application.Injector.getPlugin(PLUGIN_NAME);
  t.ok(plugin, 'Plugin should be defined');
})

test('Plugin params should be equal', async (t) => {
  const pluginInstance: TestPlugin = await application.resolve<TestPlugin>(TestPlugin);
  const testParams = { test: 'testData' };
  pluginInstance.setParams(testParams);
  t.deepEqual(pluginInstance.params, testParams, 'Params should be equal');
});

test('Plugin decorators should work', (t) => {
  const plugin = application.Injector.getPlugin(PLUGIN_NAME);
  t.deepEqual(plugin.data, ['testOne', 'testTwo'] , 'Should be [\'testOne\', \'testTwo\']');
});

test('Plugin injections should work', async (t) => {
  const pluginInstance: TestPlugin = await application.resolve<TestPlugin>(TestPlugin);
  t.deepEqual(pluginInstance.getConfig('test'), 'test config field', 'Config should be equal');
});

test('Should resolve same singletone instance defined implicity', async (t) => {
  application.Injector.InjectableDecorator<Bar>()(Bar)
  const barOne: Bar = await application.resolve<Bar>(Bar);
  barOne.value = 'test value';
  const barTwo: Bar = await application.resolve<Bar>(Bar);
  t.deepEqual(barTwo.value, barOne.value, 'Config should be equal');
});

test('Should resolve same singletone instance defined explicity',async (t) => {
  application.Injector.InjectableDecorator<Baz>(ResolveTypes.SINGLETON)(Baz)
  const bazOne: Baz = await application.resolve<Baz>(Baz);
  bazOne.value = 'test value';
  const bazTwo: Baz = await application.resolve<Baz>(Baz);
  t.deepEqual(bazTwo.value, bazOne.value, 'Config should be equal');
});

test('Sould resolve different scoped instances', async (t) => {
  application.Injector.InjectableDecorator(ResolveTypes.SCOPED)(Foo)
  const fooOne: Foo = await application.resolve<Foo>(Foo);
  const fooTwo: Foo = await application.resolve<Foo>(Foo)
  console.log(application.Injector)
  t.notEqual(fooOne.id, fooTwo.id, 'should not be eqaul')
});

test('Sould resolve same singleton dependency in scoped instances', async (t) => {
  application.Injector.InjectableDecorator(ResolveTypes.SINGLETON)(Baz)
  application.Injector.InjectableDecorator(ResolveTypes.SCOPED)(Foo)
  const fooOne: Foo = await application.resolve<Foo>(Foo);
  const fooTwo: Foo = await application.resolve<Foo>(Foo);
  fooOne.baz.value = 'test value';
  t.equal(fooOne.baz.value, fooTwo.baz.value, 'should not be eqaul')
});

test('Should resolve different weak scoped dependency in different scoped instances', async (t) => {
  application.Injector.InjectableDecorator(ResolveTypes.SCOPED)(WeakableFoo)
  application.Injector.InjectableDecorator(ResolveTypes.SINGLETON)(Baz)
  application.Injector.InjectableDecorator(ResolveTypes.SMART_SCOPED)(Goo)
  application.Injector.InjectableDecorator(ResolveTypes.SMART_SCOPED)(Boo)


  const wDepOne = new WeakDep
  const wDepTwo = new WeakDep

  application.Injector.setWeakInstance(wDepOne, wDepOne)
  application.Injector.setWeakInstance(wDepTwo, wDepTwo)

    const fooOne: WeakableFoo = await application.resolve<WeakableFoo>(WeakableFoo, wDepOne)
    const fooTwo: WeakableFoo = await application.resolve<WeakableFoo>(WeakableFoo, wDepTwo)
  
    t.notEqual(fooOne.boo.id, fooTwo.boo.id, 'should not be eqaul')
    t.notEqual(fooOne.goo.id, fooTwo.goo.id, 'should not be eqaul')
    t.notEqual(fooOne.weakDep.id, fooTwo.weakDep.id, 'should not be eqaul')
    console.log(fooOne.weakDep.id, fooTwo.weakDep.id)

});

test('Sould automatically resolve same weak scoped dependencie in one scoped instance', async (t) => {
  application.Injector.InjectableDecorator(ResolveTypes.SCOPED)(WeakableFoo)
  application.Injector.InjectableDecorator(ResolveTypes.SINGLETON)(Baz)
  application.Injector.InjectableDecorator(ResolveTypes.SMART_SCOPED)(Goo)
  application.Injector.InjectableDecorator(ResolveTypes.SMART_SCOPED)(Boo)
  const wDepOne = new WeakDep

  application.Injector.setWeakInstance(wDepOne, wDepOne)

    const fooOne: WeakableFoo = await application.resolve<WeakableFoo>(WeakableFoo, wDepOne)
    const fooTwo: WeakableFoo = await application.resolve<WeakableFoo>(WeakableFoo, wDepOne)
    t.equal(fooOne.goo.id, fooTwo.goo.id, 'should be eqaul')
    t.equal(fooOne.goo.weakDep.id, fooTwo.goo.weakDep.id, 'should be eqaul')

});

test('Sould automatically resolve different weak scoped dependencie in different scoped instances', async (t) => {
  application.Injector.InjectableDecorator(ResolveTypes.SCOPED)(WeakableFoo)
  application.Injector.InjectableDecorator(ResolveTypes.SINGLETON)(Baz)
  application.Injector.InjectableDecorator(ResolveTypes.SMART_SCOPED)(Goo)
  application.Injector.InjectableDecorator(ResolveTypes.SMART_SCOPED)(Boo)
  
  const wDepOne = new WeakDep
  const wDepTwo = new WeakDep

  application.Injector.setWeakInstance(wDepOne, wDepOne)
  application.Injector.setWeakInstance(wDepTwo, wDepTwo)

  const fooOne: WeakableFoo = await application.resolve<WeakableFoo>(WeakableFoo, wDepOne);
  const fooTwo: WeakableFoo = await application.resolve<WeakableFoo>(WeakableFoo, wDepTwo);

  t.notEqual(fooOne.goo.id, fooTwo.goo.id, 'should not be eqaul')
  t.equal(fooOne.weakDep.id, wDepOne.id, 'should be eqaul')
  t.equal(fooTwo.weakDep.id, wDepTwo.id, 'should be eqaul')
  t.notEqual(fooOne.goo.weakDep.id, fooTwo.goo.weakDep.id, 'should not be eqaul')
});

// test('plugin injections should work', (t) => {
//   application
//     .start((config: ConfigProvider) => {
//       const barOne: Bar = application.resolve<Bar>(Bar);
//       barOne.value = 'test value';
//       const barTwo: Bar = application.resolve<Bar>(Bar);
//       t.deepEqual(barTwo.value, 'test value', 'Config should be equal');
//     }
//   );
// });

// test('exit', (t) => {
//   t.end()
//   process.exit(0)
// })