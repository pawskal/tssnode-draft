"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const requestContext_1 = require("./requestContext");
const uuidv4_1 = __importDefault(require("uuidv4"));
const di_core_1 = require("@pskl/di-core");
let HeadersProvider = class HeadersProvider {
    constructor({ request }) {
        // constructor(private config: ConfigProvider) {
        // }
        this.testHeader = uuidv4_1.default();
        Object.assign(this, request.headers);
        console.log(this.testHeader, 'HEADER INJECTION');
    }
    getHeader() {
        return {
            // ...this.config,
            testHeader: this.testHeader,
        };
    }
};
HeadersProvider = __decorate([
    di_core_1.Injectable(di_core_1.ResolveTypes.WEAK),
    __metadata("design:paramtypes", [requestContext_1.RequestContext])
], HeadersProvider);
exports.HeadersProvider = HeadersProvider;
