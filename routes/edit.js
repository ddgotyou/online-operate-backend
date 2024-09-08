var express = require("express");
var router = express.Router();

/* GET edit doc */
router.get("/get_doc", function (req, res, next) {
  res.send("document");
});

/* ws 监听 */
router.ws("/doc_ws", function (ws, req) {
  //监听打开
  ws.on("open", function () {
    console.log("连接已打开");
    ws.send("hello client");
  });
  //监听消息
  ws.on("message", function (msg) {
    console.log("来自客户端的消息", msg);
  });
  //监听问题
  ws.on("error", function (err) {
    console.log("发生错误", err);
  });
});

module.exports = router;
