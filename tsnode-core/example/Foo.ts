import Baz from './Baz';
import { ResolveTypes, Injectable } from '../lib';
import IUUID from './IUUID';

// @Injectable(ResolveTypes.SCOPED)
@Reflect.metadata('design', 'paramtypes')
export default class Foo extends IUUID {
  constructor(public baz: Baz) { 
    super();
    console.log(this)
   }  
}