import { CurrentContext } from './currentContext'
import { IncomingHttpHeaders } from 'http';
import uuidv4 from 'uuidv4'
import { Injectable, ResolveTypes } from '@pskl/di-core';


@Injectable(ResolveTypes.WEAK)
export class HeadersProvider {
  [x: string]: keyof IncomingHttpHeaders | Function
  testHeader: string = uuidv4()
  constructor({ request }: CurrentContext) {
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