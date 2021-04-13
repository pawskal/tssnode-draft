import {uuid} from 'uuidv4';
import IUUID from './IUUID';

export default class WeakDep extends IUUID {
  public id: string = uuid();
  value: string
} 