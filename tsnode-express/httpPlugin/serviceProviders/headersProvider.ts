import { RequestContext } from './requestContext'
import { IncomingHttpHeaders } from 'http';
import uuidv4 from 'uuidv4'
import { Injectable, ResolveTypes } from '@pskl/di-core';


@Injectable(ResolveTypes.WEAK)
export class HeadersProvider {
  [x: string]: keyof IncomingHttpHeaders | Function
  // constructor(private config: ConfigProvider) {
  // }
  testHeader: string = uuidv4()
  constructor({ request }: RequestContext) {
    Object.assign(this, request.headers)
    console.log(this.testHeader, 'HEADER INJECTION')
  }
  public getHeader() {
    return {
      // ...this.config,
      testHeader: this.testHeader,
    }
  }
}