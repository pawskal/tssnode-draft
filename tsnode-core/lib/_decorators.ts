import Injector from './_injector'
import { Injection, FactoryInjection } from './interfaces';

const { 
  InjectableDecorator,
  FactoryDecorator,
} = Injector.getInstance();

export const Injectable: Injection = InjectableDecorator.bind(Injector.getInstance());
export const Factory: FactoryInjection<any, any> = FactoryDecorator.bind(Injector.getInstance());
