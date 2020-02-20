"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ControllerResolver {
    constructor(injector, controllerDefinition, guardDefinition) {
        this.controllerDefinition = controllerDefinition;
        this.guardDefinition = guardDefinition;
        this.resolve = injector._resolveTarget.bind(injector);
        this.inject = injector.setWeakInstance.bind(injector);
    }
}
exports.ControllerResolver = ControllerResolver;
