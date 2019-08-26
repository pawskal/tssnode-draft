// import { Injectable, ResolveTypes, ConfigProvider } from "../tsnode-core/lib";

// import { IGuard, IRequest } from "./httpPlugin/interfaces";

// import { AuthService } from "./authModule";

// import { ForbiddenError } from "ts-http-errors";

// import jwt from 'jsonwebtoken'
// // import { ForbiddenError } from 'ts-http-errors'

// // import { IAuthProvider, IAuthTarget } from "tsnode-express";
// // import { ConfigProvider } from "tsnode-express";
// // import { AuthService } from './authModule';

// @Injectable(ResolveTypes.SCOPED)
// export class FooGuard implements IGuard { 
//   constructor(public config: ConfigProvider, public authService: AuthService) {}
//   verify({ headers }: IRequest, routeMeta: any) {
//         console.log('guard !!!!!!!!!!!')
//         const token = headers['authorization'];
//         const data: any = jwt.verify(token, this.config.secret)
//         const user = this.authService.getUser(data.name)
//         if(!authTarget.roles.includes(user.role)) {
//           throw new ForbiddenError(`Forbidden access for ${authTarget.fullPath}`)
//         }
//         return Promise.resolve(user);
//         // return { fromGuard: 'fromGuard' }  
//     }
// }

// // @Reflect.metadata('design', 'paramtypes')
// // export class AuthProvider implements IAuthProvider {
// //   constructor(public config: ConfigProvider, public authService: AuthService) {}
// //   verify(token: string, authTarget: IAuthTarget): Promise<any> {
// //     const data: any = jwt.verify(token, this.config.secret)
// //     const user = this.authService.getUser(data.name)
// //     if(!authTarget.roles.includes(user.role)) {
// //       throw new ForbiddenError(`Forbidden access for ${authTarget.fullPath}`)
// //     }
// //     return Promise.resolve(user);
// //   }
// // }