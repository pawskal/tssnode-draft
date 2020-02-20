"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RequestContext {
    constructor(request, response, next) {
        this.request = request;
        this.response = response;
        this.next = next;
        this.finished = false;
        this.statusCode = 200;
    }
}
exports.RequestContext = RequestContext;
