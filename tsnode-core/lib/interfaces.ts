import Application from "./_application";
import { ConfigProvider } from ".";

export interface Type<T> {
  new(...args: any[]): T;
}

export interface IPlugin {
  application: Application;
}
  
export enum ResolveTypes {
  SINGLETON,
  SCOPED,
  WEAK_SCOPED,
  WEAK
}

export type SetConfig = (config: ConfigProvider) => Promise<any> | any

export type Resolver<T> = (type: Type<T>) => T

export type Injection = (resolveType?: ResolveTypes) => Function
export type FactoryInjection<T, K> = (factory: (opts: T) => K, resolveType?: ResolveTypes.WEAK_SCOPED | ResolveTypes.WEAK) => Function

