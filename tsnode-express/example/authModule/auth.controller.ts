import jwt from 'jsonwebtoken';

import { AuthService, User } from "./auth.service";
import { Controller, Post, Get, Guard } from '@pskl/ts-http-express';
import { ConfigProvider, Injectable, ResolveTypes } from '@pskl/di-core';
import { IRequestParams, IHttpController } from '@pskl/ts-http-express';
import { AuthGuard } from './auth.guard';
import { BadRequestError } from 'ts-http-errors';
import { CurrentContext } from '@pskl/ts-http-express';

class GuardResult {
  name!: string
  constructor(opts: any) {
      Object.assign(this, opts)
  }
}

@Guard(AuthGuard, {auth: 'string'})
@Controller('auth') 
@Injectable(ResolveTypes.SCOPED)
export class AuthController implements IHttpController { 
  constructor(public authService: AuthService,
     public config: ConfigProvider,
     public guardMeta: GuardResult,
     public currentContext: CurrentContext)
   {
  }

  onInit() {}

  @Post('/')
  addUser({ query }: IRequestParams<never, User>) {
    if(!query.name || !query.password) {
      throw new Error('Bad Request');
    }
    this.authService.addUser(query);
    this.currentContext.statusCode = 201
    return { success: true };
  }

  @Get('/')
  getUsers(): any {
    return this.authService.getUsers();
  }

  @Get(':name', { roles: ['super', 'admin'] })
  getUser({ params }: IRequestParams<never, never, { name: string }>): any {
    return this.authService.getUser(params.name);
  }

  @Get('me', { role: 'default' })
  me(): any {
    return this.authService.getUser(this.guardMeta.name);
  }

  @Get('sign-in', { useGuard: false })
  signIn({ query }: IRequestParams<never, User>) {
    const user: User = this.authService.getUser(query.name);

    if(!user || user.password != query.password) {
      throw new BadRequestError('Bad Requsest');
    }
    return {
      token: jwt.sign({ name: user.name }, this.config.secret)
    }
  }
}