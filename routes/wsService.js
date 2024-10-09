var express = require("express");
var router = express.Router();

router.ws("/", function (ws, req) {
  ws.on("message", function (msg) {
    ws.send("hello client", msg);
  });
});

const onlineUsers = [];
var preLen = 0;
router.ws("/online_user", function (ws, req) {
  //----定时推送在线用户
  setInterval(() => {
    if (prelen !== onlineUsers.length) {
      //如果在线用户情况发生改变，向所有端口推送
      ws.send(JSON.stringify(onlineUsers));
    }
  }, 100);
  //---监听用户登陆状态消息
  ws.on("message", function (msg) {
    console.log("initial userlist", onlineUsers);
    const user = JSON.parse(msg);
    if (user) {
      console.log("新加入的用户!", user);
      prelen = onlineUsers.length;
      //如果用户不存在
      if (onlineUsers.findIndex((item) => item._id === user._id) === -1) {
        onlineUsers.push(user);
        ws.send(JSON.stringify(onlineUsers));
      }
    }
  });
  //-----监听用户链接关闭
  ws.on("close", function (msg) {
    //删除此时的用户
    const user = JSON.parse(msg);
    if (user) {
      console.log("before del userlist", onlineUsers);
      prelen = onlineUsers.length;
      //如果用户存在
      const user_index = onlineUsers.findIndex((item) => item.id === user.id);
      if (user_index !== -1) onlineUsers.splice(user_index, 1);
      console.log("after del userlist", onlineUsers);
      console.log("用户离开", user);
      ws.send(JSON.stringify(onlineUsers));
    }
  });
});

module.exports = router;
