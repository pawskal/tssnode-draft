import uuidv4 from 'uuidv4';
import Baz from './Baz';

import { ResolveTypes, Injectable } from '../lib';

@Injectable(ResolveTypes.SCOPED)
export default class Foo {
  public id: string = uuidv4();
  constructor(public baz: Baz) { }  
}