import jwt from 'jsonwebtoken'
import { Injectable, ResolveTypes, ConfigProvider } from "../../tsnode-core/lib";

import { IGuard } from "../httpPlugin/interfaces";
import { IRequest } from "../httpPlugin";
import { AuthService } from ".";
import { RouteMeta } from '../httpPlugin/helpers';

@Injectable(ResolveTypes.SCOPED)
export class AuthGuard implements IGuard { 
    constructor(private config: ConfigProvider, private authService: AuthService) {}
    verify({ headers }: IRequest, meta: RouteMeta<{role: string}>) {
        const token = headers['authorization'] || '';
        const data: any = jwt.verify(token, this.config.secret)
        const user = this.authService.getUser(data.name)
        if(!meta.roles.includes(user.role)) {
          throw new ForbiddenError(`Forbidden access for ${meta.fullPath}`)
        }
        return Promise.resolve(user);
    }
}