import { Injectable } from '../../tsnode-core/lib';
import { Controller, Get, Guard, Post } from '../httpPlugin/decorators';

// import { SomeService } from './some.service';
import { BadRequestError } from 'ts-http-errors';
import uuidv4 from 'uuidv4';
import {SomeService} from './some.service';
import { ResolveTypes } from '../../tsnode-core/lib/interfaces';
import { User } from '../authModule/auth.service';
import { RouteMeta } from '../httpPlugin/core';
import { IGuard, IRequest, IRequestParams, IResponse, IHttpController } from '../httpPlugin/interfaces';
import { HeadersProvider } from '../httpPlugin/serviceProviders/headersProvider';
import { RequestContext } from '../httpPlugin/serviceProviders/requestContext';
import { Factory } from '../../tsnode-core/lib/_decorators';
// import {TestDecorator} from "../simplePlugin";

interface IFooBar {
    get?: Function
}
abstract class FooBar implements IFooBar  {
    abstract get(): any
    uuid: string = uuidv4()
    
}

class IFoo extends FooBar {
    get() { return 'foo' }
}

class IBar extends FooBar {
    get() { return 'bar' }
}

class GuardResult {
    constructor(opts: any) {
        Object.assign(this, opts)
    }
}

// function fooBarFactory
@Factory<FooBar, IBar | IFoo, RequestContext>(FooBar, ({ request }) => {
    console.log(request.params)
    return request.params.factory === 'foo' ? new IFoo : new IBar
}, ResolveTypes.WEAK_SCOPED)
@Injectable(ResolveTypes.WEAK_SCOPED)
class Foo implements IGuard {
    public guardId: string = uuidv4()
    constructor(public headers: HeadersProvider, public fooBar: FooBar) {
        console.log(headers.testHeader, 'TEST HEADER IN GUARD')
        console.log(fooBar.uuid, 'TEST FooBar IN GUARD')
        // headers['auth']
    }
    public verify(req: IRequest, options: RouteMeta<{ role: string }>) {
        // console.log(options, '****************************')
        // console.log(options.requestOptions.useGuard)
        // console.log(options.requestOptions.role)
        // return options
        // throw new Error('DDDDDDDDDDDDDDD')
        return new GuardResult({ success: true })
    }
}

@Guard(Foo)
@Controller('some')
// @Factory<FooBar, IBar | IFoo, RequestContext>(FooBar, ({ request }) => {
//     console.log(request.params)
//     return request.params.factory === 'foo' ? new IFoo : new IBar
// }, ResolveTypes.WEAK_SCOPED)
@Injectable(ResolveTypes.SCOPED)

export class SomeController implements IHttpController {
    public id!: string;
    constructor(
        public someService: SomeService,
        public requestContext: RequestContext,
        public headers: HeadersProvider,
        public guard: GuardResult,
        public fooBar: FooBar) {
            
        // console.log(headers.host)
        // console.log(headers.testHeader, 'TEST HEADER IN CONTROLLER')
        // console.log({guard}, 'guard')
        console.log(fooBar.uuid, 'TEST FooBar IN CONTROLLER')
        console.log({ fooBar }, fooBar.get(), )
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
        this.requestContext.response.setHeader('custom', 'custom')
        this.requestContext.response.send({ break: `response closed manually` });
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

    @Get('/factory/:factory')
    public fromFactory({ params }: IRequestParams<unknown, unknown, { factory: string }>) {
        return this.fooBar.get();
    }
}

// @Controller('asdadasdsadsa')
// export class A {
//     @Get('')
//     baoo() {

//     }
// }
