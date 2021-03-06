## nodejs版本席位通知组件使用方式    
>  特点：    
1. 完全的P2P版本，没有服务器。   
2. 跨端，支持windows、linux。  
3. 使用nodejs为宿主。  使用了udp（p2p消息传递）、express rest服务（提供api供业务软件使用）、websocket（回调业务软件方法）    



### 1.环境安装
#### A、本地安装node  
资源地址  ：  
 windows： node-v5.5.0-x64.msi  
linux：           node-v6.2.1-linux-x64.tar.xz
默认选项安装完成  

#### B、本地安装通知组件

##### windows 安装方法
 解压后，执行install-windows-service.bat  
（卸载时，先停止服务，再执行uninstall-windows-service.bat）  
`注意关闭本地防火墙，不然会收不到消息`  

##### linux安装方法
安装完后使用pm2运行

### 2. c#端调用方式      
``` c#  
 MessageInfo<NewTestMessage> msgInfo = new MessageInfo<NewTestMessage>()
            {
                targetProName = "ip", //发送目标过滤使用的属性名，首字母小写
                targetProValues = String.Join(",", ips),//发送目标过滤使用的属性value
                isRegisterInfoPro = false, //是否是clientinfo里面的自定义regsterInfo内属性
                messageType = 4,  //业务消息传递统一赋值4
                message = new TransferMessage<NewTestMessage>()   //业务消息体
                {
                    Hub = "TestHub",
                    Method = "OnGetTextMessage",
                    Args = new NewTestMessage()
                    {
                        MessageId = 111,
                        MessageName = txtSendMsg.Text.Trim(),
                        From = ConfigurationManager.AppSettings["username"]
                    }
                }
            };
            bool rlt = await restRequest.PostAsync<MessageInfo<NewTestMessage>, bool>("message/sendMessage", msgInfo);  
```  
 

### 3. Java端调用方式（写法大致同上）
``` java  
 MessageInfo<NewTestMessage> msgInfo = new MessageInfo<NewTestMessage>();
        msgInfo.setTargetProName("ip");
        msgInfo.setTargetProValues("172.18.2.117,172.18.2.57,172.18.24.231");
        msgInfo.setRegisterInfoPro(false);
        msgInfo.setMessageType(4);

        TransferMessage transferMessage = new TransferMessage();
        //transferMessage.setCallbackId("MM");
        transferMessage.setHub("TestHub");
        transferMessage.setMethod("OnGetTextMessage");

        NewTestMessage newTestMessage = new NewTestMessage();
        newTestMessage.setMessageId(111);
        newTestMessage.setMessageName("test send message 1啊实打实大dsada");
        newTestMessage.setFrom("xiaodm java ");
        transferMessage.setArgs(newTestMessage);

        msgInfo.setMessage(transferMessage);

        String url = "http://localfiddler:3000/message/sendMessage";

        boolean rlt = httpClientUtil.httpPost(url, msgInfo, boolean.class);
```    


### 4. c#客户端接受消息时的写法
写法还是与之前一致，里面的WsConract和WsMethod对应上面写的   Hub 、Method 。
``` c#    
[WsConract(Name = "TestHub")]
    public class CustomNCallBack
    {
        #region 
        /// <summary>
        /// 业务消息1
        /// </summary>
        /// <param name="msgParams"></param>
        [WsMethod(EventName = "CustomNotice1")]
        public void OnRecieveNoticeCallBack(CustomParams msgParams)
        {
                // TODO  .....
        }


        /// <summary>
        /// 业务消息2
        /// </summary>
        /// <param name="msgParams"></param>
        [WsMethod(EventName = "CustomNotice2")]
        public void OnRecieveNoticeCallBack(CustomParams2 msgParams)
        {
                    // TODO ........
        } 
}
。。。。。。
```  

### 5. node服务的主要API    
1. 获取所有席位状态数据   - get  
http://localhost:3000/status/getAllClient  
返回`List<ClientInfo>`数据。  
  
2.   注册当前客户端信息 - post  
http://localhost:3000/message/registerClient  
post参数：ClientInfo    

3.  获取所有席位状态注册数据  - get  
http://localhost:3000/status/getAllRegisterInfos    
返回`List<SeatStatus>`数据。     
 
4. 根据条件获取数据     - get  
http://localhost:3000/status//getRegisterInfosByCondition/:proName/:proValues/:isRegisterPro   
 如：http://localhost:3000/status/getRegisterInfosByCondition/seatid/aaa-bbb-ccc-2,aaa-bbb-ccc-1/true    

5. 下线   - post  
http://localhost:3000/message/disconectClient  

6. 发送消息 - post  
http://localfiddler:3000/message/sendMessage    
如上c#、java代码demo。 post：MessageInfo
