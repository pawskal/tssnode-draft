import { Injectable, ConfigProvider } from '../lib';

// @Injectable()
@Reflect.metadata('design', 'paramtypes')
export default class Bar {
  private _value: string;
  constructor(public config: ConfigProvider) { }
  get value(): string {
    return this._value;
  }

  set value(value: string) {
    this._value = value;
  }
}