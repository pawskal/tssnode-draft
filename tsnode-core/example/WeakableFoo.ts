import Baz from './Baz';

import { ResolveTypes, Injectable, Factory } from '../lib';
import Goo from './Goo';
import Boo from './Boo';
import WeakDep from './WeakDep';
import IUUID from './IUUID';
import { IBar, IFoo, IFooBar } from './IFooBar';

// @Factory<IFooBar, IFoo | IBar, WeakDep>(IFooBar, (opts: WeakDep) => {
//   return opts.value === 'iFoo'
//     ? IFoo
//     : new IBar;
// }, ResolveTypes.SCOPED)
// @Injectable(ResolveTypes.SCOPED)
@Reflect.metadata('design', 'paramtypes')
export default class WeakableFoo extends IUUID {
  constructor(public baz: Baz, public goo: Goo, public boo: Boo, public weakDep: WeakDep) { 
    super();
    // console.log(this)
   }  
}