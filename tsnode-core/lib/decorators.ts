import {Injector} from './injector'
import { Injection, ResolveTypes, AbstractType } from './types';

const { 
  InjectableDecorator,
  FactoryDecorator,
} = Injector.getInstance();

export const Injectable: Injection = InjectableDecorator.bind(Injector.getInstance());
export const Factory: <N, K extends N = N, T = unknown>(target: AbstractType<N>, factory: (opts: T) => K, resolveType?: ResolveTypes.WEAK_SCOPED | ResolveTypes.WEAK | ResolveTypes.SCOPED) => Function = FactoryDecorator.bind(Injector.getInstance());
