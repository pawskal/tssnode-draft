"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RouteMeta {
    constructor(controller, method) {
        this.controllerName = controller.definition.name;
        this.basePath = controller.basePath;
        this.path = method.path;
        this.method = method.method;
        this.functionName = method.name;
        this.requestOptions = method.requestOptions;
    }
    get fullPath() {
        return `${this.basePath}${this.path}`;
    }
}
exports.RouteMeta = RouteMeta;
