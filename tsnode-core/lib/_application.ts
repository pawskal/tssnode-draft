import Injector from './_injector';
import {
    Type, SetConfig,
} from './interfaces';
import {  ConfigProvider } from './helpers';

class TSNodeCore {
  public get Injector(): Injector {
    return this._injector;
  }

  protected exportValues: Array<keyof TSNodeCore> = ['configProvider'];

  protected _injector: Injector;

  public configProvider: ConfigProvider;

  protected pendingInjections: Map<string, Promise<any>> = new Map<string, Promise<void>>()

  // protected autoInjections: string[] = [];

  protected plugins: string[] = [];

  constructor() {
    this._injector = Injector.getInstance();

    this._injector.setInstance(this);

    this.configProvider = new ConfigProvider({
      logLevels: [],
      printStack: false
    });
  }

  public resolve<T>(type: Type<T>): T {
    return this._injector._resolveTarget(type.name);
  }

  public useConfig(cb: SetConfig) : TSNodeCore {
    this.pendingInjections.set(ConfigProvider.name, cb ? cb(this.configProvider) : Promise.resolve<any>(null));
    return this;
  }

  public registerModule(...args: any[]) : TSNodeCore 
  public registerModule(): TSNodeCore {
    return this;
  }

  // public autoResolve<T>(target: Type<T>): TSNodeCore {
  //   this.autoInjections.push(target.name);
  //   this._injector.set(target);
  //   return this;
  // }

  public usePlugin<T>(plugin: Type<T>): TSNodeCore {
    this.plugins.push(plugin.name);
    this._injector.set(plugin);
    return this;
  }

  public inject<T>(name: string, cb: Function): TSNodeCore;
  public inject<T>(instance: T): TSNodeCore;
  public inject(): TSNodeCore {
    arguments.length == 1 && this._injector.setInstance(arguments[0]);
    arguments.length == 2 && this.pendingInjections.set(arguments[0], arguments[1] ? arguments[1](this.configProvider) : Promise.resolve());
    return this;
  }

  public addExportValue<T extends TSNodeCore>(value: keyof T): TSNodeCore {
    const v = value as keyof TSNodeCore
    this.exportValues = [v, ...this.exportValues];
    return this;
  }

  public async start(cb?: Function) : Promise<void> {
    await this.pendingInjections.get(ConfigProvider.name)
    this._injector.setInstance(this.configProvider);

    await Promise.all([...this.pendingInjections.entries()]
      .filter(([key]) => key !== ConfigProvider.name)
      .map(async ([key, injectionPromise]) => {
        const injection: Type<any> = await injectionPromise;
        return this._injector.setInstance(key, injection)
      }));

    this.plugins.forEach((inj: string) => {
        this._injector._resolveTarget(inj);
        if(!this._injector.getPlugin(inj)){
            this._injector.plugins.set(inj, {});
        }
    });
    cb && cb(...this.exportValues.map((value: keyof TSNodeCore) => this[value]));
  }
}

export default TSNodeCore;
