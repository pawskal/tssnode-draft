import jwt from 'jsonwebtoken'
import { ResolveTypes, ConfigProvider } from "@pskl/di-core";
import { Injectable } from "@pskl/di-core/decorators";

import { IGuard } from "../httpPlugin/interfaces";
import { IRequest } from "../httpPlugin";
import { AuthService } from ".";
import { RouteMeta } from '../httpPlugin/core';
import { UnauthorizedError, ForbiddenError, BadRequestError } from 'ts-http-errors';

function hightLoad(i = 0) {
    if(i !== 10000) {
        hightLoad(++i)
    }
}

class GuardResult {
    constructor(opts: any) {
        Object.assign(this, opts)
    }
  }

@Injectable(ResolveTypes.SCOPED)
export class AuthGuard implements IGuard<{ auth: string }> { 
    constructor(private config: ConfigProvider, private authService: AuthService, private meta: RouteMeta<{ roles: string[] }>) {}
    async verify({ headers }: IRequest, meta: { auth: string }) {
        console.log(meta)
        const {useGuard, roles = []} = this.meta.requestOptions || {}
        if(useGuard == false) {
            return new GuardResult({})
        }
        
        const token = headers['authorization'] || '';
        await new Promise(r => {
            setTimeout(() => {
              console.log('(((((((((')
              hightLoad(0)
              r()
            }, 0)
          })
        if(true && !token) {
            Array.from({ length: 10000 }).map((v, i) => i).includes(10000)
            throw new UnauthorizedError()
        }
        // try {

       
            const data: any =  jwt.verify(token, this.config.secret)
            const user = this.authService.getUser(data.name)
            if(roles.length && !roles.includes(user.role)) {
                throw new ForbiddenError(`Forbidden access for ${this.meta.fullPath}`)
              }
            return new GuardResult(user);
        // } catch(e) {
        //     throw new BadRequestError(e.message)
        // }
        
    }
}