import IOCContainer, {IPlugin, ConfigProvider, Injectable} from "../../lib";
import {success, warning, error, info} from 'nodejs-lite-logger';

@Injectable()
export class TestPlugin implements IPlugin {

    private _params: any;

    constructor(public application: IOCContainer, private config: ConfigProvider) {

    }

    public setParams(params: any){
        this._params = params;
    }

    get params(){
        return this._params;
    }

    getConfig(key: string){
        return this.config[key];
    }
}