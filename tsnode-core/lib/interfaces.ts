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
}

export type SetConfig = (config: ConfigProvider) => Promise<any> | any

export type Resolver<T> = (type: Type<T>) => T

export type Injection = (resolveType?: ResolveTypes) => Function

