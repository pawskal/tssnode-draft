import './decorators';
import TSNodeExpress from './plugin';
// const PLUGIN_NAME = TSNodeExpress.name;
const PLUGIN_NAME = 'TSNodeExpress.name';

import {
  Controller,
  Delete,
  Get,
  Guard,
  Patch,
  Post,
  Put,
} from './decorators';

import {
  HttpMethods,
  IRequest,
  IResponse,
} from './interfaces';

// export type IRequest<T> = IRequest<T>;
export type IRequest = IRequest;
export type IResponse = IResponse;

export {
  Controller,
  Guard,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  HttpMethods,
};

export { TSNodeExpress, PLUGIN_NAME };
