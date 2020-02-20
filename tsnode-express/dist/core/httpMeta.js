"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const requestContext_1 = require("../serviceProviders/requestContext");
const core_1 = require("../core");
class HttpMeta {
    constructor() {
        this.controllers = new Map();
        this.guards = new Map();
        return HttpMeta.instance || (HttpMeta.instance = this);
    }
    static getHandler(controllerResolver, method) {
        return function handler(req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const requestContext = new requestContext_1.RequestContext(req, res, next);
                controllerResolver.inject(requestContext, requestContext);
                const { controllerDefinition, guardDefinition } = controllerResolver;
                controllerResolver.inject(requestContext, new core_1.RouteMeta(controllerDefinition, method));
                let instance;
                res.on("finish", () => {
                    instance && typeof instance.onDestroy === 'function' && instance.onDestroy();
                    requestContext.finished = true;
                });
                try {
                    if (guardDefinition) {
                        const guard = yield controllerResolver.resolve(guardDefinition.guard.name, requestContext);
                        const data = yield guard.verify(req, guardDefinition.options);
                        data && controllerResolver.inject(requestContext, data);
                    }
                    instance = yield controllerResolver.resolve(controllerDefinition.definition.name, requestContext);
                    const requestParams = new core_1.RequestArguments(req);
                    typeof instance.onInit === 'function' && (yield instance.onInit());
                    const origin = method.handler || HttpMeta.noop;
                    res.result = (yield origin.call(instance, requestParams)) || {};
                }
                catch (e) {
                    requestContext.finished = true;
                    next(e);
                }
                finally {
                    process.nextTick(() => {
                        requestContext.finished
                            ? void 0
                            : res.status(requestContext.statusCode).send(res.result);
                    });
                }
            });
        };
    }
    GuardDecorator(type, options) {
        return (target) => {
            this.guards.set(target.name, {
                guard: type,
                options,
            });
        };
    }
    ControllerDecorator(basePath) {
        return (target) => {
            const controller = this.controllers.get(target.name);
            Object.assign(controller, {
                basePath: this.normalizePath(basePath),
                definition: target,
            });
        };
    }
    RouteDecorator(method, path, requestOptions) {
        return (target, fname, descriptor) => this.defineRoute(method, target, path, fname, descriptor, requestOptions);
    }
    defineRoute(method, target, defaultPath, fname, descriptor, requestOptions) {
        if (!this.controllers.has(target.constructor.name)) {
            this.controllers.set(target.constructor.name, {
                basePath: "",
                routes: new Map(),
                definition: target,
            });
        }
        const path = this.normalizePath(defaultPath);
        const controller = this.controllers.get(target.constructor.name);
        const route = controller.routes.get(path) || {};
        const methodDefinition = route[method] || {};
        Object.assign(methodDefinition, {
            name: fname,
            handler: descriptor.value,
            guard: requestOptions && requestOptions.useGuard,
            path,
            method,
            requestOptions,
        });
        route[method] = methodDefinition;
        controller.routes.set(path, route);
    }
    normalizePath(defaultPath) {
        if (defaultPath.endsWith("/") && !defaultPath.startsWith("/")) {
            return `/${defaultPath}`.slice(0, -1);
        }
        else if (defaultPath.endsWith("/")) {
            return defaultPath.slice(0, -1);
        }
        else if (!defaultPath.startsWith("/")) {
            return `/${defaultPath}`;
        }
        else {
            return defaultPath;
        }
    }
}
HttpMeta.noop = () => { };
exports.HttpMeta = HttpMeta;
