import Application from "./application";
import { ConfigProvider } from ".";

export type Type<T> = {
  new(...args: any[]): T;
}

export type AbstractType<T> = Function & { prototype: T } & { name: string }

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

export type TypeFunction<T> = (target: Type<T>) => void;

export type Injection = (resolveType?: ResolveTypes) => TypeFunction<any>
export type FactoryInjection<N, K extends N = N, T = unknown> = (target: N, factory: (opts: T) => K, resolveType?: ResolveTypes.WEAK_SCOPED | ResolveTypes.WEAK | ResolveTypes.SCOPED) => TypeFunction<any>
