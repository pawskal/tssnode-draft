import IOCContainer from './application';
import { ConfigProvider } from './helpers'

import { Injectable, Factory } from './decorators'

import {
  IPlugin,
  ResolveTypes,
} from './interfaces';

import injector from './injector';

export {
  IOCContainer,
  ConfigProvider,
  IPlugin,
  Injectable,
  injector,
  ResolveTypes,
  Factory,
};

export default IOCContainer
