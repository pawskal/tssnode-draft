/// <reference types="node" />
import { RequestContext } from './requestContext';
import { IncomingHttpHeaders } from 'http';
export declare class HeadersProvider {
    [x: string]: keyof IncomingHttpHeaders | Function;
    testHeader: string;
    constructor({ request }: RequestContext);
    getHeader(): {
        testHeader: string;
    };
}
