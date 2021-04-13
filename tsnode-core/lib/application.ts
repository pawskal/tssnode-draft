import { Injector } from './injector';
import {
    Type, SetConfig, ResolveTypes, AbstractType,
} from './types';
import {  ConfigProvider } from './helpers';

class IOCContainer {
  public get Injector(): Injector {
    return this._injector;
  }

  protected _injector: Injector = Injector.getInstance();

  public configProvider: ConfigProvider = new ConfigProvider({
    logLevels: [],
    printStack: false
  });

  protected plugins: string[] = [];

  constructor() {
    this._injector.setInstance(this);
    this._injector.setInstance(this.configProvider);
  }

  public resolve<T, K = unknown>(type: Type<T>, dependency: K):Promise< T> 
  public resolve<T>(type: Type<T>):Promise< T> 
  public resolve<T>():Promise<T> {
    return arguments.length == 1 
      ? this._injector._resolveTarget(arguments[0].name)
      : this._injector._resolveTarget(arguments[0].name, arguments[1])
  }

  public useConfig(cb: SetConfig) : this {
    cb(this.configProvider)
    return this;
  }

  public registerModule(...args: any[]) : this 
  public registerModule(): this {
    return this;
  }

  public usePlugin<T>(plugin: Type<T>): this {
    this.plugins.push(plugin.name);
    this._injector.set(plugin);
    return this;
  }

  public inject<T>(instance: T) : this;
  public inject<T, K extends T>(definition: Type<T> | AbstractType<T>, factory: (configProvider?: ConfigProvider) => K | Promise<K>) : this;
  public inject<T, K extends T>(definition: Type<T> | AbstractType<T>, factory: (configProvider?: ConfigProvider) => K | Promise<K>, resoleType: ResolveTypes.SCOPED | ResolveTypes.SINGLETON) : this;
  public inject() : this {
    arguments.length == 1 && this._injector.setInstance(arguments[0]);
    arguments.length > 1 && this._injector.setFactory(arguments[0], {
      factory: arguments[1],
      resolveType: arguments[2] || ResolveTypes.SCOPED
    });
    return this;
  }

  public setup() : this {
    this.plugins.forEach((inj: string) => {
      this._injector._resolveTarget(inj);
      if(!this._injector.getPlugin(inj)){
        this._injector.plugins.set(inj, {});
      }
    });
    return this;
  }
}

export default IOCContainer;
