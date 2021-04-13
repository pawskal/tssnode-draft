import 'reflect-metadata'
import { Type, AbstractType, TypeFunction } from './types';
import { ResolveTypes } from './types';

const _global = global as any;

interface IInjection {
  injection: Type<any>;
  resolveType: ResolveTypes;
}

export interface IFacatoryInjection<T> {
  factory: (...args: Array<any>) => any | Promise<T>;
  resolveType: ResolveTypes;
}

export class Injector {
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
    var tokens: Array<FunctionConstructor> = Reflect.getMetadata('design:paramtypes', injection) || [];

    try {
      const instances: Array<T> = await Promise.all(tokens.map(t => this._resolveTarget<any>(t.name, dependency)) || []);
      return new injection(...instances)
    } catch (e) {
      console.error(e)
      console.error(`unable to resolve ${injection.name}`)
      console.error('List injection tokens', tokens)
      throw e
    }
  }

  private getFactoryValue<T, K = unknown>(factoryResolver: (dependency?: K) => T | Promise<T> | Type<T> | Promise<Type<T>>, dependency?: K) {
    const value = factoryResolver(dependency)
    return typeof value === 'function' ? this._resolve(value as Type<T>) : value
  }

  public async _resolveTarget<T>(targetName: string, dependency?: unknown): Promise<T> {
      if(this.injections.has(targetName)) {
        const { injection, resolveType } = this.injections.get(targetName)!
        if (resolveType === ResolveTypes.SINGLETON) {
          return this.getOrSetNGet(this.instances, targetName, () => this._resolve(injection))
        } 
        if(resolveType === ResolveTypes.SMART_SCOPED) {
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
            const item = await this.getFactoryValue(factory)
            return this.getOrSetNGet(this.instances, targetName, () => item)
          }
          case ResolveTypes.SCOPED: {
            return this.getFactoryValue(factory, dependency)
          }
          case ResolveTypes.SMART_SCOPED:
          case ResolveTypes.WEAK: {
            const instances = this.getWeakInstances(dependency);
            const item = await this.getFactoryValue(factory, dependency)
            return this.getOrSetNGet(instances!, targetName, () => item)
          }

          default: throw new Error('Invalid ResolveType')
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
          /**Circular weak scoped instances in not allowed */
          throw new Error(`Unable to resolve weak instance ${targetName}`)
        }
        throw new Error(`Unable to resolve injection or factory ${targetName}`)
      }
  }

  public setWeakInstance(dependency: unknown, target: any) {
    const instances = this.getWeakInstances(dependency);
    instances!.set(target.constructor.name, target);
  }

  public setFactory<T, K extends T>(target: Type<T> | AbstractType<T>, options: IFacatoryInjection<K>) {
    this.factoryInjections.set(target.name, options)
  }

  public setInstance(target: any): void {
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

  public InjectableDecorator<T> (resolveType: ResolveTypes = ResolveTypes.SINGLETON) : TypeFunction<T> {
    return (target: Type<T>) : void => {
      console.log(target)
      this.set(target, resolveType);
    }
  } 

  public FactoryDecorator<N, K extends N, T>(target: AbstractType<N>, factory: (options: T) => K | Promise<K> | Type<K>, resolveType?: ResolveTypes.WEAK | ResolveTypes.SCOPED) : TypeFunction<any> {
    return () : void => {
      this.setFactory(target, {
        factory,
        resolveType: resolveType || ResolveTypes.SCOPED
      });
    }
  } 
}
