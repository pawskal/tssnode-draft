import { Injectable, ResolveTypes, Factory } from '@pskl/di-core';

import { Controller, Get, Guard, Post } from '@pskl/ts-http-express';

// import { SomeService } from './some.service';
import { BadRequestError } from 'ts-http-errors';
import uuidv4 from 'uuidv4';
import {SomeService} from './some.service';
// import { ResolveTypes } from '@pskl/di-core/interfaces';
import { User } from '../authModule/auth.service';
import { RouteMeta } from '@pskl/ts-http-express';
import { IGuard, IRequest, IRequestParams, IHttpController } from '@pskl/ts-http-express';
import { HeadersProvider } from '@pskl/ts-http-express';
import { CurrentContext } from '@pskl/ts-http-express';
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
@Factory<FooBar, IBar | IFoo, CurrentContext>(FooBar, ({ request }) => {
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
// @Factory<FooBar, IBar | IFoo, CurrentContext>(FooBar, ({ request }) => {
//     console.log(request.params)
//     return request.params.factory === 'foo' ? new IFoo : new IBar
// }, ResolveTypes.WEAK_SCOPED)
@Controller('some')
@Injectable(ResolveTypes.SCOPED)
export class SomeController {
    public id!: string;
    constructor(
        public someService: SomeService,
        public CurrentContext: CurrentContext,
        public headers: HeadersProvider,
        public guard: GuardResult,
        public fooBar: FooBar) {
            
        // console.log(headers.host)
        console.log(headers.testHeader, 'TEST HEADER IN CONTROLLER')
        // console.log({guard}, 'guard')
        console.log(fooBar.uuid, 'TEST FooBar IN CONTROLLER')
        console.log({ fooBar }, fooBar.get(), )
    }

    public async onInit() {
        return new Promise((r) => {
            setTimeout(() => {
                this.id = uuidv4();
                console.log('initialized ', this.id);
                r()

            })
        })
        
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
        this.CurrentContext.response.setHeader('custom', 'custom')
        this.CurrentContext.response.send({ break: `response closed manually` });
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
