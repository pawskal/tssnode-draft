"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const express_2 = __importDefault(require("express"));
const ts_http_errors_1 = require("ts-http-errors");
const di_core_1 = __importDefault(require("@pskl/di-core"));
const core_1 = require("./core");
const injectionHelper_1 = require("./core/injectionHelper");
const httpMeta_1 = require("./core/httpMeta");
class TSHttpExpress extends di_core_1.default {
    get controllers() {
        return core_1.httpMeta.controllers;
    }
    get guards() {
        return core_1.httpMeta.guards;
    }
    constructor(cb) {
        super();
        this.express = express_1.default();
        this.router = express_2.default();
        cb ? cb(this.express) : void 0;
        this.use = function () {
            this.express.use(...arguments);
            return this;
        };
        this.use('/health', this.health.bind(this));
        this.use(body_parser_1.default.json());
        this.use(body_parser_1.default.urlencoded({ extended: false }));
    }
    handleNotFound() {
        this.handleError(new ts_http_errors_1.NotFoundError(`Route ${arguments[0].originalUrl} was not found`), ...arguments);
        return this;
    }
    handleError(err, req, res, next) {
        console.log('handleError');
        const { configProvider } = this;
        if (err.statusCode) {
            configProvider.logLevels.includes('warning')
                && console.warn(err.name, '\t', configProvider.printStack ? err : err.message);
            res.status(err.statusCode).send(err.toJSON());
        }
        else {
            configProvider.logLevels.includes('error') && console.error(err);
            res.status(500).json(new ts_http_errors_1.InternalServerError(err.message));
        }
        return this;
    }
    setup() {
        this.controllers.forEach(this.buildController.bind(this));
        this.use(this.handleNotFound.bind(this));
        this.use(this.handleError.bind(this));
        super.setup();
        return this;
    }
    health() {
        this.configProvider.logLevels.includes('info') && console.log('GET', '\t', '/health');
        arguments[1].status(200)
            .json({ status: 'live' });
    }
    getControllerGuard({ definition }) {
        return this.guards.get(definition.name);
    }
    buildController(controllerDefinition) {
        const { configProvider } = this;
        const guardDefinition = this.getControllerGuard(controllerDefinition);
        const controllerResolver = new injectionHelper_1.ControllerResolver(this._injector, controllerDefinition, guardDefinition);
        const router = express_2.default();
        const { routes, basePath = '/' } = controllerDefinition;
        new Map([...routes.entries()]
            .sort(([path]) => path.startsWith('/:') ? 1 : -1))
            .forEach((routes, path) => Object.keys(routes).forEach((methodKey) => {
            const method = methodKey;
            const handler = httpMeta_1.HttpMeta.getHandler(controllerResolver, routes[method]);
            this.use(basePath, router[method](path, [].filter((m) => m), handler));
            configProvider.logLevels.includes('success')
                && console.log(method.toUpperCase(), '\t', `${basePath}${path}`);
        }));
    }
}
exports.default = TSHttpExpress;
