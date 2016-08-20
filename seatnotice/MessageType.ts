/**
 * Created by xiaodm on 2016/7/13.
 */
export enum MessageType{
    /**
     * 上线注册
     */
    OnlineRegister,
    /**
     * 回复注册
     */
    ReplyRegister,
    /**
     * 下线
     */
    DisConnect,
    /**
     * 修改属性
     */
    UpdateClientInfo,
    /**
     * 自定义消息发送
     */
    CustomMessage,
    /**
     * 请求响应状态数据
     */
    RequestStatusReply
}