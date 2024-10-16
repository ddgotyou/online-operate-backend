var express = require("express");
var router = express.Router();
const { docsCollection, logCollection } = require("../mongodb/open");
const DocManager = require("../utils/DocManager");

const docList = [];
let curUser = null;
let docManager = null;
router.ws("/", async function (ws, req) {
  let isGetDocInfo = false;
  ws.on("message", function (msg) {
   
    //判断是否为第一位进入文档的用户
    if (!isGetDocInfo) {
      const doc_info = JSON.parse(msg);
      isGetDocInfo = true;
      //未创建
      if (
        docList.findIndex((item) => item.getDocId() === doc_info._id) === -1
      ) {
        console.log("new创建文档");
        //创建doc manager，并存入文档管理器中
        docManager = new DocManager(doc_info);
        docList.push(docManager);
      } else {
        //已经存在，直接获取
        docManager = docList.find((item) => item.getDocId() === doc_info._id);
      }

      docManager.addOnlineOpUser(ws,curUser);
    } else {
      //接受文档的操作日志
      const new_log = JSON.parse(msg);
      docManager.applyOp(new_log);
    }
  });
});

router.ws("/online_user", function (ws, req) {
  //---监听用户登陆状态消息
  ws.on("message", function (msg) {
    //判断消息类型
    if (msg.indexOf("online_user") === -1) {
      //---新用户加入
      const user = JSON.parse(msg);
      if (user) {
        const onlineUsers =
          docManager && docManager.opUsers.length
            ? [...docManager.opUsers]
            : [];
        console.log("新加入的用户!", user);
        //如果用户不存在
        if (onlineUsers.findIndex((item) => item._id === user._id) === -1) {
          curUser = user;
          onlineUsers.push(user);
          //---10.15删除了此处的添加用户
          //新的用户list
          console.log("新的用户list", onlineUsers);
          ws.send(JSON.stringify(onlineUsers));
        }
      }
    } else {
      //---用户请求拉取新的在线用户列表
      const doc_id = msg.split(":")[1];
      const docManager = docList.find((item) => item.getDocId() === doc_id);
      if(docManager)  ws.send(JSON.stringify(docManager.opUsers));
    }
  });
  //-----监听用户链接关闭
  ws.on("close", function (msg) {
    //删除此时的用户
    const user = JSON.parse(msg);
    if (user) {
      const onlineUsers =
        docManager && docManager.opUsers.length ? [...docManager.opUsers] : [];
      //如果用户存在
      const user_index = onlineUsers.findIndex((item) => item._id === user._id);
      if (user_index !== -1) {
        docManager.removeOnlineOpUser(user);
        onlineUsers.splice(user_index, 1);
      }
      console.log("after del userlist", onlineUsers);
      console.log("用户离开", user);
      ws.send(JSON.stringify(onlineUsers));
    }
  });
});

module.exports = router;
