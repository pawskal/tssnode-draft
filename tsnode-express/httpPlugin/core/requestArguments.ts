import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import { IRequestArguments } from '../interfaces';

export class RequestArguments implements IRequestArguments {
  public body: any;
  public params: any;
  public query: any;
  public headers: IncomingHttpHeaders;
  constructor(req: Request) {
    this.body = req.body;
    this.params = req.params;
    this.query = req.query;
    this.headers = req.headers;
  }
}
