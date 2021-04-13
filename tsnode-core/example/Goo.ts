import Baz from './Baz';

import { ResolveTypes, Injectable } from '../lib';
import WeakDep from './WeakDep';
import IUUID from './IUUID';

const count = {
  count: 0
}

// @Injectable(ResolveTypes.SMART_SCOPED)
@Reflect.metadata('design', 'paramtypes')
export default class Goo extends IUUID {
  constructor(public baz: Baz, public weakDep: WeakDep) { 
    super()
    count.count += 1
    console.log(weakDep)
    console.log(count)
   }  
}