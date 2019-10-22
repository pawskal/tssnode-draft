import { Injectable } from '../../tsnode-core/lib';
import { Controller, Get, Guard, Post } from '../httpPlugin/decorators';

// import { SomeService } from './some.service';
import { BadRequestError } from 'ts-http-errors';
import uuidv4 from 'uuidv4';
import {SomeService} from './some.service';
import { ResolveTypes } from '../../tsnode-core/lib/interfaces';
import { User } from '../authModule/auth.service';
import { HttpController, RouteMeta } from '../httpPlugin/core';
import { IGuard, IRequest, IRequestParams, IResponse } from '../httpPlugin/interfaces';
import { HeadersProvider } from '../httpPlugin/serviceProviders/headersProvider';
// import {TestDecorator} from "../simplePlugin";

@Injectable(ResolveTypes.WEAK_SCOPED)
class Foo implements IGuard {
    public guardId: string = uuidv4()
    constructor(public headers: HeadersProvider) {
        console.log(headers.testHeader, 'TEST HEADER IN GUARD')
        // headers['auth']
    }
    public verify(req: IRequest, options: RouteMeta<{ role: string }>) {
        // console.log(options, '****************************')
        // console.log(options.requestOptions.useGuard)
        // console.log(options.requestOptions.role)
        // return options
        // throw new Error('DDDDDDDDDDDDDDD')
    }
}

@Guard(Foo)
@Controller('some')
@Injectable(ResolveTypes.SCOPED)
export class SomeController extends HttpController {
    public id!: string;
    constructor(public someService: SomeService, public headers: HeadersProvider) {
        super();
        console.log(headers.host)
        console.log(headers.testHeader, 'TEST HEADER IN CONTROLLER')
    }

    public onInit() {
        this.id = uuidv4();
        console.log('initialized ', this.id);
    }

    public onDestroy() {
        console.log('destroyed ', this.id);
    }

    // @TestDecorator()
    @Get('/')
    public getSuccess(req: IRequestParams) {
        // console.log(args.fake)
        return { data: 'success', controllerId: this.id, serviceId: this.someService.id };
    }

    @Get('/service')
    public getFromService(args: IRequestParams) {
     console.log(args);

     return this.someService.getSomeData();
    }

    @Post('echo/:param')
    public echo({ body, params, query, headers }: IRequestParams<{data: any}, {echo: string}, {param: string}>) {
        return {
            body: body.data,
            params: params.param,
            query: query.echo,
        };
    }

    @Get('/single-after-hook/:param')
    public singleAfterHook() {
        // console.log(data)
        this.res.send({ break: `response closed manually` });
    }

    @Get<{ data: string }>('/custom-error', { data: 'true' })
    public badRequest(args: IRequestParams) {
        throw new BadRequestError('custom error');
    }

    @Get('/internal-error')
    public internalError() {
        let unknown: string;
        // @ts-ignore
        unknown.charCodeAt(0);
    }

    @Get('/from-external-service')
    public fromExternalServices(args: IRequestParams) {
        return this.someService.getInjectedData();
    }
}

// @Controller('asdadasdsadsa')
// export class A {
//     @Get('')
//     baoo() {

//     }
// }
