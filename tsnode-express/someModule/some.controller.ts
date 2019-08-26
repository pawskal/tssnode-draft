import { Injectable } from "../../tsnode-core/lib";
import { Controller, Get, Post, Guard } from '../httpPlugin/decorators';

// import { SomeService } from './some.service';
import { BadRequestError } from "ts-http-errors";
import uuidv4 from 'uuidv4';
import { IRequest, IResponse, IGuard, IRequestParams } from "../httpPlugin/interfaces";
import { ResolveTypes } from "../../tsnode-core/lib/interfaces";
import { SomeService } from ".";
import { HttpController, RouteMeta } from "../httpPlugin/helpers";
import { User } from "../authModule/auth.service";
// import {TestDecorator} from "../simplePlugin";

@Injectable(ResolveTypes.SCOPED)
class Foo implements IGuard { 
    constructor() {}
    verify(req: IRequest, options: RouteMeta<{ role: string }>) {
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
    constructor(public someService: SomeService) {
        super()
    }

    onInit() {
        this.id = uuidv4()
        console.log('initialized ', this.id)
    }

    onDestroy() {
        console.log('destroyed ', this.id)
    }

    // @TestDecorator()
    @Get('/')
    getSuccess(req: IRequestParams) {
        // console.log(args.fake)
        return { data: "success", controllerId: this.id, serviceId: this.someService.id }
    }

    @Get('/service')
    getFromService(args: IRequestParams) {
     console.log(args)

        return this.someService.getSomeData()
    }

    @Post('echo/:param')
    echo({ body, params, query, fake, headers }: IRequestParams<{data: any}, {echo: string}, {param: string}, { fake: string }>) {
        return {
            body: body.data,
            params: params.param,
            query: query.echo
        }
    }

    @Get('/single-after-hook/:param')
    singleAfterHook() {
        // console.log(data)
        this.res.send({ break: `response closed manually` })
    }

    @Get<{ data: string }>('/custom-error', { data: 'true' })
    badRequest(args: IRequestParams) {
        throw new BadRequestError('custom error')
    }

    @Get('/internal-error')
    internalError() {
        let unknown: string;
        // @ts-ignore
        unknown.charCodeAt(0);
    }

    @Get('/from-external-service')
    fromExternalServices(args: IRequestParams) {
        return this.someService.getInjectedData();
    }
}

// @Controller('asdadasdsadsa')
// export class A {
//     @Get('')
//     baoo() {

//     }
// }