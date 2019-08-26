import { InjectedService, IInjectedService } from "../external.service";
import { Injectable, ConfigProvider } from "../../tsnode-core/lib";
import uuidv4 = require("uuidv4");

@Injectable()
export class SomeService {
    id: string;
    constructor(
        public configProvider: ConfigProvider,
        public injectedService: InjectedService,
        public iInjectedService: IInjectedService
    ) {
        this.id = uuidv4()
    }

    getSomeData() {
        return {
            data: "from service",
            configField: this.configProvider.test
        }
    }

    getInjectedData() {
        return {
            injectedService: this.injectedService.stub,
            iInjectedService: this.iInjectedService.stub,
        }
    }
}