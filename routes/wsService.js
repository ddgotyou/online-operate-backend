var express = require("express");
var router = express.Router();
const { docsCollection, logCollection } = require("../mongodb/open");
const DocManager = require("../utils/DocManager");
var util=require("../utils/commonFunc")

const docList = [];
let curUser = null;
let docManager = null;

const checkUserOnline = (testUser,doc_id)=>{
    const _docManager = docList.find((item) => item.getDocId() === doc_id);
    if(_docManager){
      //---心跳检测
      for (let i=0;i<(_docManager.opUsers.length);i++){
          const changedUser = _docManager.opUsers[i]
          const curTime = Date.now()
          // 超过10s没收到ping，则认为不活跃
          if(curTime- changedUser.lastActiveTime>= 5000){
            changedUser.isActive=false
          }
          else{
            changedUser.isActive=true
          }
          //更新发出本次ping包的用户的时间
          if(changedUser._id===testUser._id){
            //-----NOTE:简化处理,只要检测到再次发出ping，则认为用户在线
            changedUser.isActive=true
            changedUser.lastActiveTime=curTime
          }
      }
      //---NOTE:简化处理，不活跃，先删除
      const activeUsers  = _docManager.opUsers.filter((item)=>item.isActive===true)
      _docManager.opUsers=activeUsers
    }
}

router.ws("/", async function (ws, req) {
  ws.on("message", function (msg) {
    /** 统一解析消息 */
      const curMsg = JSON.parse(msg);
      const { type }=curMsg
      switch(type){
        /* 获取文档信息 */
        case "docInfo":{
          const doc_info = curMsg.data;
          if (
            docList.findIndex((item) => item.getDocId() === doc_info._id) === -1
          ) {
            //如果为第一位访问该文档的用户，未创建
            console.log("new创建文档");
            //创建doc manager，并存入文档管理器中
            docManager = new DocManager(doc_info);
            docList.push(docManager);
          } else {
            //已经存在，直接获取
            docManager = docList.find((item) => item.getDocId() === doc_info._id);
          }
          // 添加用户进入文档在线用户队列
          docManager.addOnlineOpUser(ws,curUser);
          break
        }
        /* 操作日志 */
        case "oplog":{
          //接受用户文档的操作日志
          const new_log = curMsg.data;
          const _docManager = docList.find((item) => item.getDocId() === new_log.doc_id);
          _docManager.applyOp(new_log);
          break
        }
        default:
          break
      }
  })
});

router.ws("/online_user", function (ws, req) {
  /* 监听用户登陆状态消息 */
   ws.on("message", function (msg) {
    const curMsg = JSON.parse(msg);
    const { type }=curMsg
    //判断消息类型
    switch(type){
      case 'addUser':{
         const user = curMsg.data;
        if (user) {
          const onlineUsers =
            docManager && docManager.opUsers.length
              ? [...docManager.opUsers]
              : [];
          console.log("新加入的用户!", user);
          //如果用户不存在
          if (onlineUsers.findIndex((item) => item._id === user._id) === -1) {
            curUser = {...user,isActive:true,lastActiveTime:Date.now()};
            onlineUsers.push(curUser);
            //---10.15删除了此处的添加用户
            //新的用户list
            ws.send(util.msgWrap("onlineUser",onlineUsers,"ok"));
          }
        }
        break
      }
      case 'fetchOnlineUser':{
        //---用户请求拉取新的在线用户列表
        const doc_id = curMsg.data;
        const _docManager = docList.find((item) => item.getDocId() === doc_id);
        if(_docManager)  
          ws.send(util.msgWrap("onlineUser",_docManager.opUsers,"ok"));
        break
      }
      case 'ping':{
        const otherFlag=curMsg.data
        //获取当前用户
        const { testUser,doc_id }= otherFlag
        //----NOTE:后续可添加超过上一次发出的某个时间未发出ping，视作不活跃用户
        checkUserOnline(testUser,doc_id)
        // 后台返回状态
        ws.send(util.msgWrap("pong","ok","ok"))
      }
      case "close":{
        // console.log('用户主动关闭连接')
        //用户主动关闭
        const {user,doc} = curMsg.data;
        const _docManager = docList.find((item) => item.getDocId() === doc);
        if(_docManager){
          //删除用户
          _docManager.removeOnlineOpUser(user);
        }
      }
      default:
        break
    }
})

   /* 监听用户链接主动关闭 */
  ws.on("close", function (msg) {
    console.log('用户离开')
    // //删除此时的用户
    // const user = JSON.parse(msg).data;
    // if (user) {
    //   const onlineUsers =
    //     docManager && docManager.opUsers.length ? [...docManager.opUsers] : [];
    //   //如果用户存在
    //   const user_index = onlineUsers.findIndex((item) => item._id === user._id);
    //   if (user_index !== -1) {
    //     docManager.removeOnlineOpUser(user);
    //     onlineUsers.splice(user_index, 1);
    //   }
    //   console.log("after del userlist", onlineUsers);
    //   console.log("用户离开", user);
    //   ws.send(util.msgWrap("onlineUser",onlineUsers,"ok"));
    // }
  });
});

module.exports = router;
