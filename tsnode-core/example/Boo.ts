import { ResolveTypes, Injectable } from '../lib';

import WeakDep from './WeakDep';
import Baz from './Baz';
import IUUID from './IUUID';

// @Injectable(ResolveTypes.SCOPED)
@Reflect.metadata('design', 'paramtypes')
export default class Boo extends IUUID {
  constructor(public baz: Baz, public weakDep: WeakDep) { super() }  
}