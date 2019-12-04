import Injector, { IFacatoryInjection } from './_injector';
import {
    Type, SetConfig, ResolveTypes,
} from './interfaces';
import {  ConfigProvider } from './helpers';

class TSNodeCore {
  public get Injector(): Injector {
    return this._injector;
  }

  protected exportValues: Array<keyof TSNodeCore> = ['configProvider'];

  protected _injector: Injector;

  public configProvider: ConfigProvider;

  protected plugins: string[] = [];

  constructor() {
    this._injector = Injector.getInstance();

    this._injector.setInstance(this);

    this.configProvider = new ConfigProvider({
      logLevels: [],
      printStack: false
    });
    this._injector.setInstance(this.configProvider);
  }

  public resolve<T>(type: Type<T>):Promise< T> {
    return this._injector._resolveTarget(type.name);
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
  public inject<T, K extends T>(definition: Type<T>, factory: (configProvider?: ConfigProvider) => K | Promise<K>) : this;
  public inject<T, K extends T>(definition: Type<T>, factory: (configProvider?: ConfigProvider) => K | Promise<K>, resoleType: ResolveTypes.SCOPED | ResolveTypes.SINGLETON) : this;
  public inject() : this {
    arguments.length == 1 && this._injector.setInstance(arguments[0]);
    arguments.length > 1 && this._injector.setFactory(arguments[0], {
      factory: arguments[1],
      resolveType: arguments[2] || ResolveTypes.SCOPED
    });
    return this;
  }

  public addExportValue<T extends TSNodeCore>(value: keyof T): TSNodeCore {
    const v = value as keyof TSNodeCore
    this.exportValues = [v, ...this.exportValues];
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

export default TSNodeCore;
