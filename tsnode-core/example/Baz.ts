import { ResolveTypes, Injectable } from '../lib';
import { TestDecorator } from './simplePlugin';
import Bar from './Bar';

// @Injectable(ResolveTypes.SINGLETON)
@Reflect.metadata('design', 'paramtypes')
export default class Baz {
  private _value: string;
  constructor(public bar: Bar) { }
  get value(): string {
    return this._value;
  }

  set value(value: string) {
    this._value = value;
  }

  @TestDecorator()
  testOne() {}

  @TestDecorator()
  testTwo() {}
}