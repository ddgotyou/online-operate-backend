var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var app = express();
//引入WebSocket模块
var websocket = require("ws"); // 为app添加ws实例方法
var server = new websocket.Server({
  port: 1234,
});
server.on("open", () => {
  console.log("open");
});
server.on("close", () => {
  console.log("close");
});
server.on("connection", (ws, req) => {
  console.log("connection连接成功");
  ws.on("message", (data) => {
    // data: 接收信息
    server.clients.forEach((item) => {
      //对每个客户端传回消息
      if (item.readyState === ws.OPEN) {
        console.log("信息", data);
        item.send("hello client" + data);
      }
    });
  });
});

//引入路由模块管理文件
var indexRouter = require("./routes/index");
var editRouter = require("./routes/edit");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/editor", editRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
