/**
 * Created by xiaodm on 2016/7/1.
 */
export class ClientInfo {
    ip:string;
    port:string;
    name:string;
    registerInfo:any;
    isTestClient:boolean;

    constructor(name:string, ip:string, port:string, registerInfo:any, isTestClient?:boolean) {
        this.name = name;
        this.ip = ip;
        this.port = port;
        this.registerInfo = registerInfo;
        if (isTestClient) {
            this.isTestClient = isTestClient;
        }
        else {
            this.isTestClient = false;
        }
    }
}