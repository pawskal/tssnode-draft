import {uuid} from 'uuidv4';

export default abstract class IUUID {
  public id: string = uuid();
}