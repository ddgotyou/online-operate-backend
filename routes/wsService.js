var express = require("express");
var router = express.Router();

router.ws("/", function (ws, req) {
  ws.on("message", function (msg) {
    ws.send("hello client", msg);
  });
});

module.exports = router;
