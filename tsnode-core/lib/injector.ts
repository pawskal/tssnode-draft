import 'reflect-metadata'
import { Type, AbstractType } from './interfaces';
import { ResolveTypes } from './interfaces';

const _global = global as any;

interface IInjection {
  injection: Type<any>;
  resolveType: ResolveTypes;
}

export interface IFacatoryInjection<T> {
  factory: (...args: Array<any>) => any | Promise<T>;
  resolveType: ResolveTypes;
}

export default class Injector {
  public static getInstance(): Injector {
    return new Injector();
  }

  private static _instance: Injector;
  
  private injections: Map<string, IInjection> = new Map<string, IInjection>();
  private factoryInjections: Map<string, IFacatoryInjection<unknown>> = new Map<string, IFacatoryInjection<unknown>>();

  private instances: Map<string, any> = new Map<string, any>();
  private weakInstances: WeakMap<any, Map<string, any>> = new WeakMap<any, Map<string, any>>();

  public plugins: Map<string, any> = new Map<string, any>();

  private constructor() {
    return Injector._instance || (_global._injector = Injector._instance = this);
  }

  private getWeakInstances(dependency: unknown) {
    if(!this.weakInstances.has(dependency)) {
      this.weakInstances.set(dependency, new Map)
    }
    return this.weakInstances.get(dependency);
  }

  private getOrSetNGet(collection: Map<any, any>, key: any, valueResolver: () => any) {
    if(collection.has(key)){
      return collection.get(key);
    }
    return collection
      .set(key, valueResolver())
      .get(key);
  }

  private async _resolve<T>(injection: Type<T>, dependency?: unknown): Promise<T> {
    const tokens: Array<FunctionConstructor> = Reflect.getMetadata('design:paramtypes', injection) || [];
    const instances: Array<T> = await Promise.all(tokens.map(t => this._resolveTarget<any>(t.name, dependency)) || []);
    return new injection(...instances)
  }

  public async _resolveTarget<T>(targetName: string, dependency?: unknown): Promise<T> {
    try {
      if(this.injections.has(targetName)) {
        const { injection, resolveType } = this.injections.get(targetName)!
        if (resolveType === ResolveTypes.SINGLETON) {
          return this.getOrSetNGet(this.instances, targetName, () => this._resolve(injection))
        } 
        if(resolveType === ResolveTypes.WEAK_SCOPED) {
          const instances = this.getWeakInstances(dependency);
          return this.getOrSetNGet(instances!, targetName, () => this._resolve(injection, dependency))
        }
        if(resolveType === ResolveTypes.WEAK) {
          const instances = this.getWeakInstances(dependency);
          return this.getOrSetNGet(instances!, targetName, () => new injection(dependency))
        }
        return this._resolve(injection, dependency)
      } else if(this.factoryInjections.has(targetName)) {
        const { factory, resolveType } = this.factoryInjections.get(targetName)!

        switch(resolveType) {
          case ResolveTypes.SINGLETON: {
            return this.getOrSetNGet(this.instances, targetName, () => factory())
          }
          case ResolveTypes.WEAK_SCOPED: 
          case ResolveTypes.WEAK: {
            const instances = this.getWeakInstances(dependency);
            return this.getOrSetNGet(instances!, targetName, () => factory(dependency))
          }

          default: return factory()
        }
      } else {
        if(this.instances.has(targetName)){
          return this.instances.get(targetName);
        } 
        if(this.weakInstances.has(dependency)) {
          const instances = this.weakInstances.get(dependency);
          if(instances!.has(targetName)) {
            return instances!.get(targetName)
          }
          throw new Error('foo')
        }
        throw new Error('bar')
      }
    } catch (e) {
      console.error(e)
      throw new Error(`Unable to resolve injection ${targetName}`)
    }
  }

  public setWeakInstance(dependency: unknown, target: any) {
    const instances = this.getWeakInstances(dependency);
    instances!.set(target.constructor.name, target);
  }

  public setFactory<T, K extends T>(target: Type<T> | AbstractType<T>, options: IFacatoryInjection<K>) {
    this.factoryInjections.set(target.name, options)
  }

  public setInstance(target: any): void {;
    this.instances.set(target.constructor.name, target);
  }

  public set(target: Type<any>, resolveType: ResolveTypes = ResolveTypes.SINGLETON): void {
    this.injections.set(target.name, {
      injection: target,
      resolveType,
    });
  }

  public getPlugin(name: string): any {
      return this.plugins.get(name);  
  }

  public InjectableDecorator (resolveType: ResolveTypes = ResolveTypes.SINGLETON) : Function {
    return (target: Type<any>) : void => {
      this.set(target, resolveType);
    }
  } 

  public FactoryDecorator<N, K extends N, T>(target: AbstractType<N>, factory: (options: T) => K | Promise<K>, resolveType?: ResolveTypes.WEAK_SCOPED | ResolveTypes.WEAK | ResolveTypes.SCOPED) : Function{
    return () : void => {
      this.setFactory(target, {
        factory,
        resolveType: resolveType || ResolveTypes.SCOPED
      });
    }
  } 
}
