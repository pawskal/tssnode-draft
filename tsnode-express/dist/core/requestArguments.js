"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RequestArguments {
    constructor(req) {
        this.body = req.body;
        this.params = req.params;
        this.query = req.query;
        this.headers = req.headers;
    }
}
exports.RequestArguments = RequestArguments;
