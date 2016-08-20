/**
 * Created by xiaodm on 2016/7/1.
 */
export class PhoneConnInfo {
    deviceNumber:string;
    connKey:string;
    name:string;
    registerInfo:any;

    constructor(deviceNumber:string, connKey:string, name:string, registerInfo:any) {
        this.deviceNumber = deviceNumber;
        this.connKey = connKey;
        this.name = name;
        this.registerInfo = registerInfo;
    }
}