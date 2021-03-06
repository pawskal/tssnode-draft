import { Type } from '.';
import {Injector} from './injector'
import { Injection, ResolveTypes, AbstractType, TypeFunction } from './types';

const { 
  InjectableDecorator,
  FactoryDecorator,
} = Injector.getInstance();

export const Injectable: Injection = InjectableDecorator.bind(Injector.getInstance());
export const Factory: <N, K extends N = N, T = unknown>(target: AbstractType<N>, factory: (opts: T) => K | Promise<K> | Type<K>, resolveType?: ResolveTypes.WEAK | ResolveTypes.SCOPED) => TypeFunction<any> = FactoryDecorator.bind(Injector.getInstance());
