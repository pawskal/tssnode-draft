import Injector from './_injector'
import { Injection } from './interfaces';

const { 
  InjectableDecorator,
} = Injector.getInstance();

export const Injectable: Injection = InjectableDecorator.bind(Injector.getInstance());
