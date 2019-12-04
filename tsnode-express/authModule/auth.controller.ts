import jwt from 'jsonwebtoken';

import { AuthService, User } from "./auth.service";
import { Controller, Post, Get, Guard } from '../httpPlugin';
import { ConfigProvider, Injectable, ResolveTypes } from '../../tsnode-core/lib';
import { IRequestParams, IHttpController } from '../httpPlugin/interfaces';
import { AuthGuard } from './auth.guard';

@Guard(AuthGuard)
@Controller('auth') 
@Injectable(ResolveTypes.SCOPED)
export class AuthController implements IHttpController { 
  constructor(public authService: AuthService, public config: ConfigProvider) {
  }

  onInit() {}

  @Post('/')
  addUser({ query }: IRequestParams<never, User>) {
    if(!query.name || !query.password) {
      throw new Error('Bad Request');
    }
    this.authService.addUser(query);
    return { success: true };
  }

  @Get('/')
  getUsers(): any {
    return this.authService.getUsers();
  }

  @Get(':name')
  getUser({ params }: IRequestParams<never, never, { name: string }>): any {
    return this.authService.getUser(params.name);
  }

  @Get('me', { role: 'default' })
  me({ auth }: IRequestParams<never, never, never, { auth: any }>): any {
    return this.authService.getUser(auth.name);
  }

  @Get('sign-in', { useGuard: false })
  signIn({ query }: IRequestParams<never, User>) {
    const user: User = this.authService.getUser(query.name);

    if(!user || user.password != query.password) {
      throw new Error('Bad Requsest');
    }
    return {
      token: jwt.sign({ name: user.name }, this.config.secret)
    }
  }
}