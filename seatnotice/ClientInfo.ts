/**
 * Created by xiaodm on 2016/7/1.
 */
export class ClientInfo {
    ip:string;
    port:string;
    name:string;
    registerInfo:any;

    constructor(name:string, ip:string, port:string, registerInfo:any) {
        this.name = name;
        this.ip = ip;
        this.port = port;
        this.registerInfo = registerInfo;
    }
}